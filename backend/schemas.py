# schemas.py
from pydantic import BaseModel

class EmissionDataBase(BaseModel):
    area: str
    year: int
    savanna_fires: float
    forest_fires: float
    crop_residues: float
    rice_cultivation: float
    drained_soils: float
    pesticides: float
    food_transport: float
    forestland: float
    net_forest_conversion: float
    food_household: float
    food_retail: float
    onfarm_electricity: float
    food_packaging: float
    agrifood_waste: float
    food_processing: float
    fertilizers: float
    ippu: float
    manure_applied: float
    manure_left: float
    manure_management: float
    fires_organic: float
    fires_humid: float
    onfarm_energy: float
    rural_population: float
    urban_population: float
    total_pop_male: float
    total_pop_female: float
    total_emission: float
    avg_temp: float

class EmissionDataCreate(EmissionDataBase):
    # 如果創建時有額外的欄位，可以在這裡添加
    pass

class EmissionDataResponse(EmissionDataBase):
    id: int # 響應中通常包含 ID
    class Config:
        from_attributes = True # 允許從 ORM 模型實例創建 Pydantic 模型