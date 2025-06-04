import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pandas as pd
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import EmissionData, Base


# 建表（若尚未建立）
Base.metadata.create_all(bind=engine)

# 載入 CSV
df = pd.read_csv("data/Agrofood_co2_emission.csv")

# 欄位清理（去空白、換小寫、特殊字元）
df.columns = [c.strip().lower()
                   .replace(" ", "_")
                   .replace("-", "_")
                   .replace("(", "")
                   .replace(")", "")
                   .replace("°c", "c")
             for c in df.columns]

# 重新命名成符合模型的欄位名稱
df = df.rename(columns={
    "drained_organic_soils_co2": "drained_soils",
    "pesticides_manufacturing": "pesticides",
    "food_household_consumption": "food_household",
    "on_farm_electricity_use": "onfarm_electricity",
    "agrifood_systems_waste_disposal": "agrifood_waste",
    "fertilizers_manufacturing": "fertilizers",
    "manure_applied_to_soils": "manure_applied",
    "manure_left_on_pasture": "manure_left",
    "fires_in_organic_soils": "fires_organic",
    "fires_in_humid_tropical_forests": "fires_humid",
    "on_farm_energy_use": "onfarm_energy",
    "total_population_male": "total_pop_male",
    "total_population_female": "total_pop_female",
    "average_temperature_c": "avg_temp",
    # 其他欄位名稱如果相同就不用列出來
})


# 建立資料庫 session
session: Session = SessionLocal()

for _, row in df.iterrows():
    record = EmissionData(**row.to_dict())
    session.add(record)

session.commit()
session.close()

print("✅ 匯入成功")
