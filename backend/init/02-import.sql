-- 匯入 CSV 資料到 emission_data 表格
\COPY emission_data(area, year, savanna_fires, forest_fires, crop_residues, rice_cultivation, drained_soils, pesticides, food_transport, forestland, net_forest_conversion, food_household, food_retail, onfarm_electricity, food_packaging, agrifood_waste, food_processing, fertilizers, ippu, manure_applied, manure_left, manure_management, fires_organic, fires_humid, onfarm_energy, rural_population, urban_population, total_pop_male, total_pop_female, total_emission, avg_temp)
FROM '/data/Agrofood_co2_emission.csv'
DELIMITER ','
CSV HEADER;
