# models.py
from sqlalchemy import Column, Integer, Float, Text
from .database import Base

class EmissionData(Base):
    __tablename__ = "emission_data" # 確保這裡的名稱和您 PostgreSQL 表格的名稱完全匹配

    id = Column(Integer, primary_key=True, index=True) # index=True 可選，但對於 PRIMARY KEY 來說通常是自動的
    area = Column(Text)
    year = Column(Integer)
    savanna_fires = Column(Float)
    forest_fires = Column(Float)
    crop_residues = Column(Float)
    rice_cultivation = Column(Float)
    drained_soils = Column(Float)
    pesticides = Column(Float)
    food_transport = Column(Float)
    forestland = Column(Float)
    net_forest_conversion = Column(Float)
    food_household = Column(Float)
    food_retail = Column(Float)
    onfarm_electricity = Column(Float)
    food_packaging = Column(Float)
    agrifood_waste = Column(Float)
    food_processing = Column(Float)
    fertilizers = Column(Float)
    ippu = Column(Float)
    manure_applied = Column(Float)
    manure_left = Column(Float)
    manure_management = Column(Float)
    fires_organic = Column(Float)
    fires_humid = Column(Float)
    onfarm_energy = Column(Float)
    rural_population = Column(Float)
    urban_population = Column(Float)
    total_pop_male = Column(Float)
    total_pop_female = Column(Float)
    total_emission = Column(Float)
    avg_temp = Column(Float)

    def __repr__(self):
        return f"<EmissionData(id={self.id}, area='{self.area}', year={self.year})>"