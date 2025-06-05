# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud
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

Base.metadata.create_all(bind=engine)

app = FastAPI()

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

scaler = joblib.load(scaler_path)
rnn_model = load_model(model_path)

df = pd.read_csv("./data/agri_CO2_preprocessing_ex.csv")

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
    # 順序需與模型訓練時一致
    features: list[float]  # 共 14 個指標數值


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
        # 預處理輸入
        input_array = np.array(data.features).reshape(1, -1)
        scaled = scaler.transform(input_array)
        rnn_input = scaled.reshape((1, 1, scaled.shape[1]))  # RNN 輸入形狀
        
        # 預測
        prob = rnn_model.predict(rnn_input)[0][0]
        label = int(prob > 0.5)
        return {
            "probability": float(prob),
            "prediction": label,
            "meaning": "高風險" if label == 1 else "低風險"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# 提供資料 API
@app.get("/api/global_data")
def get_global_data(year: int):
    year_df = df[df["Year"] == year]
    return year_df[["iso_alpha", "Area", "continent", "total_emission"]].to_dict(orient="records")

# 年份下拉選單可用年份
@app.get("/api/years")
def get_years():
    return sorted(df["Year"].unique(), reverse=True)
