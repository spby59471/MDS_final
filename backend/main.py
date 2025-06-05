# main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any # Make sure Dict, Any are imported
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from fastapi import Body
from .database import SessionLocal

from . import models, schemas, database
import pandas as pd


app = FastAPI()

# CORS configuration (keep as is)
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://localhost:5173", # Make sure this is included for your Vite frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)

# Existing APIs (keep as is or slightly modified if you had them)
@app.get("/emission_data/", response_model=List[schemas.EmissionDataResponse])
def read_emission_data(
    skip: int = 0,
    limit: int = 100,
    year: Optional[int] = None,
    area: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.EmissionData)
    if year is not None:
        query = query.filter(models.EmissionData.year == year)
    if area is not None:
        query = query.filter(models.EmissionData.area == area)
    emissions = query.offset(skip).limit(limit).all()
    return emissions

# YearDashboard specific endpoints (keep as is)
@app.get("/data/yearly", response_model=Dict[str, Any])
def get_yearly_summary(year: int, db: Session = Depends(database.get_db)):
    summary_data = db.query(
        func.sum(models.EmissionData.total_emission).label('total_emission'),
        func.avg(models.EmissionData.avg_temp).label('avg_temp'),
        func.sum(models.EmissionData.total_pop_male).label('total_pop_male'),
        func.sum(models.EmissionData.total_pop_female).label('total_pop_female')
    ).filter(models.EmissionData.year == year).first()

    if not summary_data.total_emission:
        raise HTTPException(status_code=404, detail=f"No data found for year {year}")

    return {
        "total_emission": summary_data.total_emission,
        "avg_temp": summary_data.avg_temp,
        "total_pop_male": summary_data.total_pop_male,
        "total_pop_female": summary_data.total_pop_female,
    }

@app.get("/data/top", response_model=List[Dict[str, Any]])
def get_top_n_indicator_data(
    year: int,
    indicator: str = Query(..., description="The emission indicator key, e.g., 'savanna_fires'"),
    top_n: int = 5,
    db: Session = Depends(database.get_db)
):
    allowed_indicators = [
        'savanna_fires', 'forest_fires', 'crop_residues', 'rice_cultivation',
        'drained_soils', 'pesticides', 'food_transport', 'forestland',
        'net_forest_conversion', 'food_household', 'food_retail',
        'onfarm_electricity', 'food_packaging', 'agrifood_waste',
        'food_processing', 'fertilizers', 'ippu', 'manure_applied',
        'manure_left', 'manure_management', 'fires_organic', 'fires_humid',
        'onfarm_energy', 'rural_population', 'urban_population',
        'total_pop_male', 'total_pop_female', 'total_emission', 'avg_temp'
    ]

    if indicator not in allowed_indicators:
        raise HTTPException(status_code=400, detail=f"Invalid indicator: {indicator}")

    results = db.query(
        models.EmissionData.area,
        func.sum(getattr(models.EmissionData, indicator)).label('value')
    ).filter(
        models.EmissionData.year == year,
        getattr(models.EmissionData, indicator) != None
    ).group_by(
        models.EmissionData.area
    ).order_by(
        func.sum(getattr(models.EmissionData, indicator)).desc()
    ).limit(top_n).all()

    return [{"area": r.area, "value": float(r.value) if r.value is not None else 0.0} for r in results]


# --- NEW: Endpoint for CountryDashboard summary ---
@app.get("/data/country_summary", response_model=List[Dict[str, Any]])
def get_country_summary_data(year: int, db: Session = Depends(database.get_db)):
    # Aggregate data by country (area) for the selected year
    country_summary_results = db.query(
        models.EmissionData.area,
        func.sum(models.EmissionData.total_emission).label('total_emission'),
        # Sum both male and female population to get total population per country
        (func.sum(models.EmissionData.total_pop_male) + func.sum(models.EmissionData.total_pop_female)).label('population'),
        func.avg(models.EmissionData.avg_temp).label('avg_temp') # Average temperature for the country
    ).filter(
        models.EmissionData.year == year
    ).group_by(
        models.EmissionData.area # Group by country (area)
    ).order_by(
        models.EmissionData.area # Optional: Order by country name
    ).all()

    if not country_summary_results:
        raise HTTPException(status_code=404, detail=f"No country summary data found for year {year}")

    # Format the results to match the frontend's CountryData interface
    # Note: total_emission, population, avg_temp are aggregated sums/averages
    formatted_data = []
    for r in country_summary_results:
        formatted_data.append({
            "country": r.area,
            "co2Emissions": float(r.total_emission) if r.total_emission is not None else 0.0,
            "population": float(r.population) if r.population is not None else 0.0,
            "temperature": float(r.avg_temp) if r.avg_temp is not None else 0.0,
        })
    return formatted_data

@app.get("/data/country_trend", response_model=List[Dict[str, Any]])
def get_country_trend_data(
    country: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        models.EmissionData.year,
        func.sum(models.EmissionData.total_emission).label('total_emission')
    )

    if country:
        query = query.filter(models.EmissionData.area == country)

    query = query.group_by(models.EmissionData.year).order_by(models.EmissionData.year)
    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail=f"No emission trend data found.")

    return [
        {"year": r.year, "co2Emissions": float(r.total_emission) if r.total_emission else 0.0}
        for r in results
    ]



@app.post("/data/indicator_lines", response_model=List[Dict[str, Any]])
def get_indicator_lines(
    area: Optional[str] = Query(None),
    indicators: List[str] = Body(...),
    db: Session = Depends(get_db)
):
    if not indicators:
        raise HTTPException(status_code=400, detail="No indicators provided.")

    query = db.query(models.EmissionData.year)

    for indicator in indicators:
        if hasattr(models.EmissionData, indicator):
            query = query.add_columns(func.sum(getattr(models.EmissionData, indicator)).label(indicator))
        else:
            raise HTTPException(status_code=400, detail=f"Invalid indicator: {indicator}")

    if area:
        query = query.filter(models.EmissionData.area == area)

    query = query.group_by(models.EmissionData.year).order_by(models.EmissionData.year)

    results = query.all()

    # 組合格式
    response = []
    for row in results:
        year = row[0]
        values = {indicators[i]: float(row[i + 1]) if row[i + 1] else 0.0 for i in range(len(indicators))}
        values["year"] = year
        response.append(values)

    return response


from fastapi import Body

@app.post("/data/indicator_lines_fixed", response_model=List[Dict[str, Any]])
def get_fixed_indicator_lines(
    area: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    indicators = [
        "savanna_fires", "forest_fires", "fires_organic",
        "rice_cultivation", "food_retail", "food_transport", "pesticides",
        "forestland", "net_forest_conversion",
        "manure_applied", "manure_left",
        "onfarm_electricity", "ippu", "drained_soils"
    ]

    query = db.query(models.EmissionData.year)

    for indicator in indicators:
        if hasattr(models.EmissionData, indicator):
            query = query.add_columns(func.sum(getattr(models.EmissionData, indicator)).label(indicator))
        else:
            raise HTTPException(status_code=400, detail=f"Invalid indicator: {indicator}")

    if area:
        query = query.filter(models.EmissionData.area == area)

    query = query.group_by(models.EmissionData.year).order_by(models.EmissionData.year)

    results = query.all()

    response = []
    for row in results:
        year = row[0]
        values = {indicators[i]: float(row[i + 1]) if row[i + 1] else 0.0 for i in range(len(indicators))}
        values["year"] = year
        response.append(values)

    return response


# 區域對應洲別的函式（可根據實際資料庫內容調整）
def assign_continent_updated(area: str) -> str:
    if area in ["China", "India", "Japan", "Thailand", "Indonesia"]:
        return "Asia"
    elif area in ["Germany", "France", "United Kingdom", "Italy"]:
        return "Europe"
    elif area in ["United States", "Canada", "Mexico"]:
        return "North America"
    elif area in ["Brazil", "Argentina", "Colombia"]:
        return "South America"
    elif area in ["Nigeria", "South Africa", "Egypt"]:
        return "Africa"
    elif area in ["Australia", "New Zealand"]:
        return "Oceania"
    else:
        return "Other"

# Bubble Chart API：回傳各洲的氣溫與排放量與人口（bubble）
@app.get("/data/continent-bubble")
def get_continent_bubble_data(db: Session = Depends(get_db)):
    # 從資料庫撈出所有資料
    emission_data = db.query(models.EmissionData).all()

    # 轉為 DataFrame
    df = pd.DataFrame([{
        "area": e.area,
        "year": e.year,
        "avg_temp": e.avg_temp,
        "total_emission": e.total_emission,
        "total_pop_male": e.total_pop_male,
        "total_pop_female": e.total_pop_female
    } for e in emission_data])

    # 加總人口
    df["total_population"] = df["total_pop_male"] + df["total_pop_female"]

    # 指派洲別
    df["continent"] = df["area"].apply(assign_continent_updated)

    # 選擇最新一年的資料（或你想要的年度）
    df = df[df["year"] == 2020]

    # 選擇必要欄位輸出
    result = df[["area", "avg_temp", "total_emission", "total_population", "continent"]]

    return result.to_dict(orient="records")
