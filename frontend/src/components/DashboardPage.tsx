import React, { useState } from 'react';
import YearDashboard from './YearDashboard';
import CountryDashboard from './CountryDashboard';
import GlobalBoard from './GlobalBoard';

interface DashboardPageProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const featureLabels = [
  "Savanna fires", "Forest fires", "Fires in organic soils",
  "Rice Cultivation", "Food Retail", "Food Transport", "Pesticides Manufacturing",
  "Forestland", "Net Forest conversion",
  "Manure applied to Soils", "Manure left on Pasture",
  "On-farm Electricity Use", "IPPU", "Drained organic soils (CO2)"
];

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedYear }) => {
  const [view, setView] = useState<'predict' | 'year' | 'country' | 'global'>('predict');
  const [features, setFeatures] = useState<number[]>(Array(14).fill(0));
  const [predictionResult, setPredictionResult] = useState<{ prediction: number; probability: number; meaning: string } | null>(null);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    const parsed = parseFloat(value);
    newFeatures[index] = isNaN(parsed) ? 0 : parsed;
    setFeatures(newFeatures);
  };

  const handlePredict = async () => {
    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      });

      if (!response.ok) throw new Error("API 錯誤");
      const result = await response.json();
      setPredictionResult(result);
    } catch (error) {
      alert("預測失敗，請確認輸入與伺服器狀態");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-end items-center gap-4">
        <button
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => setView('global')}
        >
            查看全球總覽
        </button>
        <button
          className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => setView('year')}
        >
          按年份查看
        </button>
        <button
          className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => setView('country')}
        >
          按國家查看
        </button>
      </div>

      {view === 'predict' && (
        <div className="bg-white shadow p-6 rounded space-y-4">
          <h2 className="text-xl font-bold">Carbon Emission Risk Prediction (Enter 14 Indicators)</h2>
          {/* <p className="text-gray-600">目前年份：{selectedYear}</p> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featureLabels.map((label, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  step="any"
                  value={features[index]}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handlePredict}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Predict
          </button>
          {predictionResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p>Prediction: <strong>{predictionResult.meaning}</strong></p>
              <p>Probability: {(predictionResult.probability * 100).toFixed(2)}%</p>
            </div>
          )}
        </div>
      )}
      {view === 'global' && (
        <GlobalBoard goBack={() => setView('predict')} />
      )}
      {view === 'year' && (
        <YearDashboard
          selectedYear={selectedYear}
          goBack={() => setView('predict')}
        />
      )}

      {view === 'country' && (
        <CountryDashboard
          selectedYear={selectedYear}
          goBack={() => setView('predict')}
        />
      )}
    </div>
  );
};

export default DashboardPage;
