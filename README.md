# MDS_final

# Frontend

## 專案簡介

本專案是「農業活動對溫度變化影響預測」數據分析儀表板的前端部分。它旨在透過直觀、互動式的視覺化圖表，展示氣候模型預測結果、關鍵農業排放影響因素，以及相關的氣候與人口趨勢數據。

本前端應用程式是一個單頁面 (Single-Page Application, SPA)，採用 React、Vite、TypeScript 和 Tailwind CSS 構建，提供使用者對複雜數據的全面洞察。

## 操作指南

請按照以下步驟來設置和運行本前端專案：

### 必要條件

* **Node.js v18 或更高版本**: 請確保您的 Node.js 版本為 18 或更高。您可以使用 `node -v` 命令來檢查當前版本。如果版本不符，請前往 [Node.js 官方網站](https://nodejs.org/) 下載並安裝。
* **pnpm**: 您需要先安裝 pnpm。如果尚未安裝，請參考 pnpm 官方文檔：[https://pnpm.io/installation](https://pnpm.io/installation)

### 步驟

1.  **複製專案倉庫:**
    首先，將本專案的程式碼複製到您的本地電腦：

    ```bash
    git clone [您的專案 Git URL]
    cd [您的專案資料夾名稱]
    ```

    (請將 `[您的專案 Git URL]` 替換為實際的 Git 倉庫地址，並將 `[您的專案資料夾名稱]` 替換為您希望的資料夾名稱)

2.  **安裝依賴:**
    本專案使用以下關鍵函式庫來構建使用者介面和視覺化圖表，因此它們將在安裝依賴時被包含：
    * **Tailwind CSS**: 用於快速構建美觀介面的實用程式優先 CSS 框架。
    * **`lucide-react`**: 一個輕量級且高度可定制的開源圖示庫，用於介面中的圖示。
    * **`recharts`**: 一個基於 React 的強大圖表庫，用於繪製各種數據圖表。

    進入專案資料夾後，使用 `pnpm` 安裝所有必要的專案依賴：

    ```bash
    pnpm install
    ```

3.  **運行開發伺服器:**
    安裝完依賴後，您可以啟動前端開發伺服器：

    ```bash
    pnpm run dev
    ```

    成功運行後，Vite 通常會在終端機中顯示應用程式的訪問地址，例如：`http://localhost:5173`。您可以在瀏覽器中打開這個地址來查看應用程式。


---

# Backend 

本專案資料儲存在 PostgreSQL 資料庫中，並以 CSV 格式提供原始資料。  
此說明文件教你如何建立資料庫、建立資料表、以及匯入 CSV 資料。

---

## 前置條件

- 已安裝 PostgreSQL（本機或 Docker 皆可）  
- 已安裝 `psql` 工具 (PostgreSQL CLI)  
- 確認已拿到 CSV 資料檔 `emission_data.csv`

---

## 步驟

### 1. 啟動 PostgreSQL 伺服器

- 若用 Docker，請先確保容器已啟動，例如：

  ```bash
  docker-compose up -d```
- 本機 PostgreSQL 請確定已啟動服務。

### 2.  **建立資料庫（第一次使用者執行）**

    連線到 PostgreSQL：

    ```bash
    psql -U myuser -h localhost -p 5432
    ```

    建立資料庫：

    ```sql
    CREATE DATABASE agri_db;
    \q
    ```

### 3.  **建立資料表結構**

    重新連線至剛建立的資料庫：

    ```bash
    psql -U myuser -h localhost -p 5432 -d agri_db
    ```

    執行以下 SQL 建立資料表：

    ```sql
    CREATE TABLE emission_data (
      id SERIAL PRIMARY KEY,
      area TEXT,
      year INT,
      savanna_fires FLOAT,
      forest_fires FLOAT,
      crop_residues FLOAT,
      rice_cultivation FLOAT,
      drained_soils FLOAT,
      pesticides FLOAT,
      food_transport FLOAT,
      forestland FLOAT,
      net_forest_conversion FLOAT,
      food_household FLOAT,
      food_retail FLOAT,
      onfarm_electricity FLOAT,
      food_packaging FLOAT,
      agrifood_waste FLOAT,
      food_processing FLOAT,
      fertilizers FLOAT,
      ippu FLOAT,
      manure_applied FLOAT,
      manure_left FLOAT,
      manure_management FLOAT,
      fires_organic FLOAT,
      fires_humid FLOAT,
      onfarm_energy FLOAT,
      rural_population FLOAT,
      urban_population FLOAT,
      total_pop_male FLOAT,
      total_pop_female FLOAT,
      total_emission FLOAT,
      avg_temp FLOAT
    );
    ```

### 4.  **匯入 CSV 資料**

    請確認 `Agrofood_co2_emission.csv` 放在你的本機路徑，並在 `psql` 裡執行：

    ```sql
    \copy Agrofood_co2_emission(area, year, savanna_fires, forest_fires, crop_residues, rice_cultivation, drained_soils, pesticides, food_transport, forestland, net_forest_conversion, food_household, food_retail, onfarm_electricity, food_packaging, agrifood_waste, food_processing, fertilizers, ippu, manure_applied, manure_left, manure_management, fires_organic, fires_humid, onfarm_energy, rural_population, urban_population, total_pop_male, total_pop_female, total_emission, avg_temp)
    FROM '/path/to/Agrofood_co2_emission.csv'
    DELIMITER ','
    CSV HEADER;
    ```
    請將 `/path/to/Agrofood_co2_emission.csv` 改成你的實際路徑。

### 5.  **驗證資料**

    匯入後可用以下指令查看資料：

    ```sql
    SELECT * FROM Agrofood_co2_emission LIMIT 10;
    ```

---

**附註**

* 若你使用 Docker 內的 PostgreSQL，`psql` 連線的 `host` 可使用 `localhost`，或容器內部名稱視狀況而定。
* 若遇到權限問題或連線失敗，請先確認環境變數與網路設定。


