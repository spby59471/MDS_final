import React, { useState } from 'react';

const featureLabels = [
  "Savanna fires", "Forest fires", "Fires in organic soils",
  "Rice Cultivation", "Food Retail", "Food Transport", "Pesticides Manufacturing",
  "Forestland", "Net Forest conversion",
  "Manure applied to Soils", "Manure left on Pasture",
  "On-farm Electricity Use", "IPPU", "Drained organic soils (CO2)"
];

const PredictDashboard: React.FC = () => {
  const [features, setFeatures] = useState<string[]>(Array(14).fill(""));
  const [continent, setContinent] = useState<string>('Asia');
  const [predictionResult, setPredictionResult] = useState<{
    region_result: { continent: string; prediction: number; probability: number; meaning: string };
    global_result: { prediction: number; probability: number; meaning: string };
  } | null>(null);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handlePredict = async () => {
    try {
      const numericFeatures = features.map((f) => {
        const parsed = parseFloat(f);
        return isNaN(parsed) ? 0 : parsed;
      });

      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: numericFeatures, continent }),
      });

      if (!response.ok) throw new Error("API 錯誤");
      const result = await response.json();
      setPredictionResult(result);
    } catch (error) {
      alert("預測失敗，請確認輸入與伺服器狀態");
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded flex flex-col md:flex-row gap-6">
      {/* 左側：輸入區塊佔 3/4 */}
      <div className="md:basis-3/4 space-y-4">
        <h2 className="text-xl font-bold">Carbon Emission Risk Prediction (Enter 14 Indicators)</h2>

        {/* 洲別選單 */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Continent:</label>
          <select
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
            <option value="Africa">Africa</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Oceania">Oceania</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* 指標輸入區：三欄 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featureLabels.map((label, index) => (
            <div key={index} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input
                type="number"
                step="any"
                value={features[index]}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="Enter value"
              />
            </div>
          ))}
        </div>

        {/* 預測按鈕 */}
        <button
          onClick={handlePredict}
          className="px-4 py-2 text-white rounded transition
                bg-[#058068]
                hover:bg-[#069A7D]
                font-bold "
        >
          Predict
        </button>
      </div>

      {/* 右側：預測結果佔 1/4 */}
      {predictionResult && (
        <div className="md:basis-1/4 bg-gray-100 p-4 rounded space-y-4">
          <div>
            <h4 className="font-bold text-lg mb-1">{predictionResult.region_result.continent} Model</h4>
            <p>Prediction: <strong>{predictionResult.region_result.meaning}</strong></p>
            <p>Probability: {(predictionResult.region_result.probability * 100).toFixed(2)}%</p>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-bold text-lg mb-1">Global Model</h4>
            <p>Prediction: <strong>{predictionResult.global_result.meaning}</strong></p>
            <p>Probability: {(predictionResult.global_result.probability * 100).toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictDashboard;
