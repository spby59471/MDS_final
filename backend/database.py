from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pathlib import Path

# 強制指定 .env 路徑
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("🚀 Loaded DATABASE_URL:", DATABASE_URL)

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not set!")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
