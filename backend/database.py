# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 替換成您的 PostgreSQL 連線資訊
DATABASE_URL = "postgresql://postgres:123@localhost:5432/MDS_db"
# 例如: "postgresql://postgres:mysecretpassword@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 獲取資料庫會話的依賴函數
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()