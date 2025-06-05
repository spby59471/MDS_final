from sqlalchemy.orm import Session
from typing import Optional
from . import models, schemas
from sqlalchemy import func

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

