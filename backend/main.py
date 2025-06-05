# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from . import models, schemas, crud, database
from .database import SessionLocal, engine, Base
from fastapi import Query
from typing import Optional
from pydantic import BaseModel
import joblib
import numpy as np
from tensorflow.keras.models import load_model
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pycountry
from fastapi.responses import HTMLResponse
import plotly.express as px
import pycountry_convert as pc
from functools import lru_cache
from typing import Any, List, Dict, Optional

Base.metadata.create_all(bind=engine)

app = FastAPI(debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 確保從 main.py 相對位置推回根目錄
base_dir = Path(__file__).resolve().parent.parent

scaler_path = base_dir / "backend" / "data" / "rnn_scaler_smote.pkl"
model_path = base_dir / "backend" / "data" / "rnn_model_smote.h5"
model_path_Africa = base_dir / "backend" / "data" / "rnn_model_Africa.h5"
model_path_Asia = base_dir / "backend" / "data" / "rnn_model_Asia.h5"
model_path_Europe = base_dir / "backend" / "data" / "rnn_model_Europe.h5"
model_path_NorthAmerica = base_dir / "backend" / "data" / "rnn_model_North America.h5"
model_path_SouthAmerica = base_dir / "backend" / "data" / "rnn_model_South America.h5"
model_path_Oceania = base_dir / "backend" / "data" / "rnn_model_Oceania.h5"
model_path_Other = base_dir / "backend" / "data" / "rnn_model_Other.h5"

scaler = joblib.load(scaler_path)
# rnn_model = load_model(model_path)
# rnn_model_Africa = load_model(model_path_Africa)
# rnn_model_Asia = load_model(model_path_Asia)
# rnn_model_Europe = load_model(model_path_Europe)
# rnn_model_NorthAmerica = load_model(model_path_NorthAmerica)
# rnn_model_SouthAmerica = load_model(model_path_SouthAmerica)
# rnn_model_Oceania = load_model(model_path_Oceania)
# rnn_model_Other = load_model(model_path_Other)


csv_path = base_dir / "backend" / "data" / "agri_CO2_preprocessing_ex.csv"
df = pd.read_csv(csv_path)

manual_country_to_continent = {
    # North America / Caribbean
    'American Samoa': 'Oceania',
    'Anguilla': 'North America',
    'Aruba': 'North America',
    'Bermuda': 'North America',
    'British Virgin Islands': 'North America',
    'Cayman Islands': 'North America',
    'Cook Islands': 'Oceania',
    'Falkland Islands (Malvinas)': 'South America',
    'French Polynesia': 'Oceania',
    'Greenland': 'North America',
    'Guadeloupe': 'North America',
    'Guam': 'Oceania',
    'Martinique': 'North America',
    'Mayotte': 'Africa',
    'Montserrat': 'North America',
    'Netherlands Antilles (former)': 'North America',
    'New Caledonia': 'Oceania',
    'Niue': 'Oceania',
    'Northern Mariana Islands': 'Oceania',
    'Pacific Islands Trust Territory': 'Oceania',
    'Puerto Rico': 'North America',
    'Saint Pierre and Miquelon': 'North America',
    'Saint Helena, Ascension and Tristan da Cunha': 'Africa',
    'Tokelau': 'Oceania',
    'Turks and Caicos Islands': 'North America',
    'United States Virgin Islands': 'North America',
    'Wallis and Futuna Islands': 'Oceania',
    'Western Sahara': 'Africa',

    # Europe
    'Faroe Islands': 'Europe',
    'Gibraltar': 'Europe',
    'Holy See': 'Europe',
    'Isle of Man': 'Europe',
    'Netherlands (Kingdom of the)': 'Europe',

    # Asia
    'Democratic People\'s Republic of Korea': 'Asia',
    'Iran (Islamic Republic of)': 'Asia',
    'Lao People\'s Democratic Republic': 'Asia',
    'Republic of Korea': 'Asia',
    'Syrian Arab Republic': 'Asia',
    'Venezuela (Bolivarian Republic of)': 'South America',
    'Viet Nam': 'Asia',

    # Europe (historic or alt names)
    'Czechia': 'Europe',
    'Czechoslovakia': 'Europe',
    'Republic of Moldova': 'Europe',
    'Russian Federation': 'Europe',
    'Serbia and Montenegro': 'Europe',
    'United Kingdom of Great Britain and Northern Ireland': 'Europe',
    'Yugoslav SFR': 'Europe',

    # Africa
    'Ethiopia PDR': 'Africa',
    'United Republic of Tanzania': 'Africa',
    'Sudan (former)': 'Africa',

    # Other (defunct)
    'USSR': 'Europe',
    'United States of America': 'North America',
}

@lru_cache(maxsize=None)
def get_model(continent: str):
    path_map = {
        "africa": model_path_Africa,
        "asia": model_path_Asia,
        "europe": model_path_Europe,
        "north america": model_path_NorthAmerica,
        "south america": model_path_SouthAmerica,
        "oceania": model_path_Oceania,
        "other": model_path_Other,
        "global": model_path
    }
    model_path_to_load = path_map.get(continent, model_path_Other)
    return load_model(model_path_to_load)

def get_continent(country_name):
    try:
        country = pycountry.countries.lookup(country_name)
        continent_code = pc.country_alpha2_to_continent_code(country.alpha_2)
        return {
            "AF": "Africa",
            "AS": "Asia",
            "EU": "Europe",
            "NA": "North America",
            "SA": "South America",
            "OC": "Oceania",
        }.get(continent_code)
    except:
        return manual_country_to_continent.get(country_name)

# 依賴項目
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# 加入 ISO-3 國碼（只做一次）
def get_iso_alpha(country_name):
    try:
        return pycountry.countries.lookup(country_name).alpha_3
    except:
        return None

df["iso_alpha"] = df["Area"].apply(get_iso_alpha)
df = df[df["iso_alpha"].notnull()]
        
class InputData(BaseModel):
    continent: str  # 新增：洲別（如 Asia、Europe 等）
    features: list[float]  # 14 個數值
    
def get_iso_alpha(country_name):
    try:
        return pycountry.countries.lookup(country_name).alpha_3
    except:
        return None


@app.get("/data/emission_trend")
def read_emission_trends(db: Session = Depends(get_db)):
    return crud.get_emission_trends(db)

@app.get("/data/climate")
def read_climate(year: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_climate_data(db, year)

@app.get("/data/country_summary")
def read_country_summary(year: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_country_data(db, year)

@app.get("/data/yearly")
def read_yearly_summary(year: int, db: Session = Depends(get_db)):
    return crud.get_yearly_summary(db, year)

@app.get("/data/country")
def read_country_detail(area: str, year: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_country_detail(db, area, year)

@app.get("/data/distribution")
def read_global_distribution(year: int, indicator: str, db: Session = Depends(get_db)):
    return crud.get_global_distribution(db, year, indicator)

@app.get("/data/trend")
def read_indicator_trend(area: str, indicator: str, db: Session = Depends(get_db)):
    return crud.get_country_indicator_trend(db, area, indicator)

@app.get("/data/top")
def read_top_countries(year: int, indicator: str, top_n: int = 5, db: Session = Depends(get_db)):
    return crud.get_top_countries_by_indicator(db, year, indicator, top_n)

@app.post("/predict")
def predict_emission(data: InputData):
    if len(data.features) != 14:
        raise HTTPException(status_code=400, detail="features 必須為 14 個數值")

    try:
        continent = data.continent.strip().lower()

        region_model = get_model(continent)
        global_model = get_model("global")

        input_array = np.array(data.features).reshape(1, -1)
        scaled = scaler.transform(input_array)
        rnn_input = scaled.reshape((1, 1, scaled.shape[1]))

        prob_region = region_model.predict(rnn_input)[0][0]
        label_region = int(prob_region > 0.5)

        prob_global = global_model.predict(rnn_input)[0][0]
        label_global = int(prob_global > 0.5)

        return {
            "region_result": {
                "continent": data.continent,
                "probability": float(prob_region),
                "prediction": label_region,
                "meaning": "high risk" if label_region == 1 else "low risk"
            },
            "global_result": {
                "probability": float(prob_global),
                "prediction": label_global,
                "meaning": "high risk" if label_global == 1 else "low risk"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data/global_data")
def get_global_data(year: int):
    year_df = df[df["Year"] == year].copy()

    year_df["iso_alpha"] = year_df["Area"].apply(get_iso_alpha)
    year_df["continent"] = year_df["Area"].apply(get_continent)
    year_df["total_emission"] = pd.to_numeric(year_df["total_emission"], errors="coerce")

    # Normalize for bubble size
    min_e = year_df["total_emission"].min()
    max_e = year_df["total_emission"].max()
    year_df["total_emission_norm"] = ((year_df["total_emission"] - min_e) / (max_e - min_e)) * 100

    # Remove rows with missing info
    year_df = year_df.dropna(subset=["iso_alpha", "continent", "total_emission_norm"])

    return year_df[["iso_alpha", "Area", "continent", "total_emission"]].to_dict(orient="records")

@app.get("/data/continent-bubble")
def continent_bubble(year: int = 2020, db: Session = Depends(get_db)):
    return crud.get_continent_bubble_data(db, year)

@app.get("/data/country_summary_data", response_model=List[Dict[str, Any]])
def country_summary_api(year: int, db: Session = Depends(get_db)):
    return crud.get_country_summary_data(year, db)

@app.get("/data/country_trend", response_model=List[Dict[str, Any]])
def country_trend_api(country: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return crud.get_country_trend_data(db, country)

@app.post("/data/indicator_lines", response_model=List[Dict[str, Any]])
def indicator_lines_api(
    area: Optional[str] = Query(None),
    indicators: List[str] = Body(...),
    db: Session = Depends(get_db)
):
    return crud.get_indicator_lines(area, indicators, db)

@app.post("/data/indicator_lines_fixed", response_model=List[Dict[str, Any]])
def fixed_indicator_lines_api(area: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return crud.get_fixed_indicator_lines(area, db)
# @app.post("/data/indicator_lines_fixed")
# def get_indicators(req: dict = Body(...)):
#     area = req.get("area")

