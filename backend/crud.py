from sqlalchemy.orm import Session
from typing import Optional
from . import models, schemas
from sqlalchemy import func
from fastapi import HTTPException
import pandas as pd


def get_emission_trends(db: Session):
    result = db.query(
        models.PEmissionData.year,
        models.PEmissionData.total_emission
    ).distinct().all()

    return [
        {
            "year": r.year,
            "total_emission": r.total_emission
        }
        for r in result
    ]

def get_climate_data(db: Session, year: Optional[int] = None):
    query = db.query(
        models.PEmissionData.year,
        models.PEmissionData.total_emission,
        models.PEmissionData.avg_temp,
        models.PEmissionData.total_pop_male,
        models.PEmissionData.total_pop_female
    )
    if year:
        query = query.filter(models.PEmissionData.year == year)
    
    result = query.all()
    return [
        {
            "year": r.year,
            "total_emission": r.total_emission,
            "avg_temp": r.avg_temp,
            "total_pop_male": r.total_pop_male,
            "total_pop_female": r.total_pop_female
        }
        for r in result
    ]

def get_country_data(db: Session, year: Optional[int] = None):
    query = db.query(
        models.PEmissionData.area,
        models.PEmissionData.total_emission,
        models.PEmissionData.avg_temp,
        models.PEmissionData.total_pop_male,
        models.PEmissionData.total_pop_female
    )
    if year:
        query = query.filter(models.PEmissionData.year == year)
    
    result = query.all()
    return [
        {
            "area": r.area,
            "total_emission": r.total_emission,
            "avg_temp": r.avg_temp,
            "total_pop_male": r.total_pop_male,
            "total_pop_female": r.total_pop_female
        }
        for r in result
    ]

# def get_country_data(db: Session, year: Optional[int] = None):
#     query = db.query(models.PEmissionData).filter(models.PEmissionData.year == year)
#     df = pd.read_sql(query.statement, db.bind)

#     if df.empty:
#         return []

#     # 加總每個國家的排放總量、人口、溫度
#     result = df.groupby("Area").agg({
#         "total_emission": "sum",
#         "total_pop": "sum",
#         "temperature": "mean"
#     }).reset_index()

#     # 改欄位名稱讓前端可以抓到 'country'
#     result = result.rename(columns={
#         "Area": "country",
#         "total_emission": "co2Emissions",
#         "total_pop": "population",
#         "temperature": "temperature"
#     })

#     return result.to_dict(orient="records")

    
def get_yearly_summary(db: Session, year: int):
    result = db.query(
        models.PEmissionData.year,
        func.sum(models.PEmissionData.total_emission).label("total_emission"),
        func.avg(models.PEmissionData.avg_temp).label("avg_temp"),
        func.sum(models.PEmissionData.total_pop_male).label("total_pop_male"),
        func.sum(models.PEmissionData.total_pop_female).label("total_pop_female"),
        func.sum(models.PEmissionData.rural_population).label("rural_population"),
        func.sum(models.PEmissionData.urban_population).label("urban_population")
    ).filter(models.PEmissionData.year == year).group_by(models.PEmissionData.year).first()

    if not result:
        return None

    return {
        "year": result.year,
        "total_emission": result.total_emission,
        "avg_temp": result.avg_temp,
        "total_pop_male": result.total_pop_male,
        "total_pop_female": result.total_pop_female,
        "rural_population": result.rural_population,
        "urban_population": result.urban_population,
    }

# 國家某年指標資料

def get_country_detail(db: Session, area: str, year: Optional[int] = None):
    query = db.query(models.PEmissionData).filter(models.PEmissionData.area == area)
    if year:
        query = query.filter(models.PEmissionData.year == year)
    result = query.all()

    return [r.__dict__ for r in result]

# 全球分布圖資料

def get_global_distribution(db: Session, year: int, indicator: str):
    col = getattr(models.PEmissionData, indicator, None)
    if not col:
        return []
    query = db.query(models.PEmissionData.area, col.label("value")).filter(models.PEmissionData.year == year)
    return [
        {"area": r.area, indicator: r.value} for r in query.all()
    ]

# 國家某指標年度趨勢

def get_country_indicator_trend(db: Session, area: str, indicator: str):
    col = getattr(models.PEmissionData, indicator, None)
    if not col:
        return []
    query = db.query(models.PEmissionData.year, col.label("value")) \
              .filter(models.PEmissionData.area == area) \
              .order_by(models.PEmissionData.year)
    return [
        {"year": r.year, indicator: r.value} for r in query.all()
    ]

# 排名前幾的國家

def get_top_countries_by_indicator(db: Session, year: int, indicator: str, top_n: int = 10):
    col = getattr(models.PEmissionData, indicator, None)
    if not col:
        return []
    query = db.query(models.PEmissionData.area, col.label("value")) \
              .filter(models.PEmissionData.year == year) \
              .filter(models.PEmissionData.area != "China, mainland") \
              .order_by(col.desc()) \
              .limit(top_n)
    return [
        {"area": r.area, indicator: r.value} for r in query.all()
    ]

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

def get_continent_bubble_data(db: Session, year: int = 2020):
    # 撈資料
    data = db.query(models.PEmissionData).filter(models.PEmissionData.year == year).all()

    # 整理為 DataFrame
    df = pd.DataFrame([{
        "area": r.area,
        "avg_temp": r.avg_temp,
        "total_emission": r.total_emission,
        "total_pop_male": r.total_pop_male,
        "total_pop_female": r.total_pop_female,
    } for r in data])

    if df.empty:
        return []

    df["total_population"] = df["total_pop_male"] + df["total_pop_female"]
    df["continent"] = df["area"].apply(assign_continent_updated)

    return df[["area", "avg_temp", "total_emission", "total_population", "continent"]].to_dict(orient="records")

def get_country_summary_data(year: int, db: Session):
    results = db.query(
        models.PEmissionData.area,
        func.sum(models.PEmissionData.total_emission).label("total_emission"),
        (func.sum(models.PEmissionData.total_pop_male) + func.sum(models.PEmissionData.total_pop_female)).label("population"),
        func.avg(models.PEmissionData.avg_temp).label("avg_temp")
    ).filter(models.PEmissionData.year == year)
    results = results.group_by(models.PEmissionData.area).order_by(models.PEmissionData.area).all()

    if not results:
        raise HTTPException(status_code=404, detail=f"No country summary data found for year {year}")

    return [
        {
            "country": r.area,
            "co2Emissions": float(r.total_emission or 0.0),
            "population": float(r.population or 0.0),
            "temperature": float(r.avg_temp or 0.0)
        } for r in results
    ]


def get_country_trend_data(db: Session, country: str = None):
    query = db.query(
        models.PEmissionData.year,
        func.sum(models.PEmissionData.total_emission).label("total_emission")
    )
    if country:
        query = query.filter(models.PEmissionData.area == country)
    results = query.group_by(models.PEmissionData.year).order_by(models.PEmissionData.year).all()

    if not results:
        raise HTTPException(status_code=404, detail="No emission trend data found.")

    return [
        {"year": r.year, "co2Emissions": float(r.total_emission or 0.0)} for r in results
    ]


def get_indicator_lines(area: str, indicators: list[str], db: Session):
    query = db.query(models.PEmissionData.year)
    for ind in indicators:
        if hasattr(models.PEmissionData, ind):
            query = query.add_columns(func.sum(getattr(models.PEmissionData, ind)).label(ind))
        else:
            raise HTTPException(status_code=400, detail=f"Invalid indicator: {ind}")

    if area:
        query = query.filter(models.PEmissionData.area == area)
    results = query.group_by(models.PEmissionData.year).order_by(models.PEmissionData.year).all()

    return [
        {**{ind: float(row[i+1] or 0.0) for i, ind in enumerate(indicators)}, "year": row[0]} for row in results
    ]


def get_fixed_indicator_lines(area: str, db: Session):
    indicators = [
        "savanna_fires", "forest_fires", "fires_organic",
        "rice_cultivation", "food_retail", "food_transport", "pesticides",
        "forestland", "net_forest_conversion",
        "manure_applied", "manure_left",
        "onfarm_electricity", "ippu", "drained_soils"
    ]
    return get_indicator_lines(area, indicators, db)
