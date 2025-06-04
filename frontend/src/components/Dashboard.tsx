// components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

// 定義數據類型
interface EmissionTrendData {
  year: number;
  totalEmissions: number;
}

interface ClimateData {
  year: number;
  co2Emissions: number;
  population: number;
  temperature: number;
}

interface CountryData {
  country: string;
  co2Emissions: number;
  population: number;
  temperature: number;
}

interface DashboardProps {
  selectedYear: number;
}

// API 調用函數（模擬後端數據）
const fetchEmissionTrends = async (): Promise<EmissionTrendData[]> => {
  // 這裡替換為實際的API調用
  // const response = await fetch('/api/emission-trends');
  // return response.json();
  
  // 模擬數據
  return [
    { year: 2015, totalEmissions: 36200 },
    { year: 2016, totalEmissions: 36700 },
    { year: 2017, totalEmissions: 37100 },
    { year: 2018, totalEmissions: 37500 },
    { year: 2019, totalEmissions: 36800 },
    { year: 2020, totalEmissions: 34800 },
    { year: 2021, totalEmissions: 36300 },
    { year: 2022, totalEmissions: 37400 },
    { year: 2023, totalEmissions: 37800 },
    { year: 2024, totalEmissions: 38100 }
  ];
};

const fetchClimateData = async (): Promise<ClimateData[]> => {
  // const response = await fetch('/api/climate-data');
  // return response.json();
  
  return [
    { year: 2015, co2Emissions: 36200, population: 7349, temperature: 14.8 },
    { year: 2016, co2Emissions: 36700, population: 7432, temperature: 15.0 },
    { year: 2017, co2Emissions: 37100, population: 7515, temperature: 14.9 },
    { year: 2018, co2Emissions: 37500, population: 7594, temperature: 14.7 },
    { year: 2019, co2Emissions: 36800, population: 7674, temperature: 15.2 },
    { year: 2020, co2Emissions: 34800, population: 7753, temperature: 15.1 },
    { year: 2021, co2Emissions: 36300, population: 7837, temperature: 14.8 },
    { year: 2022, co2Emissions: 37400, population: 7918, temperature: 15.3 },
    { year: 2023, co2Emissions: 37800, population: 8000, temperature: 15.4 },
    { year: 2024, co2Emissions: 38100, population: 8080, temperature: 15.5 }
  ];
};

const fetchCountryData = async (): Promise<CountryData[]> => {
  // const response = await fetch('/api/country-data');
  // return response.json();
  
  return [
    { country: 'China', co2Emissions: 10670, population: 1412, temperature: 8.1 },
    { country: 'USA', co2Emissions: 4713, population: 331, temperature: 8.5 },
    { country: 'India', co2Emissions: 2442, population: 1380, temperature: 25.2 },
    { country: 'Russia', co2Emissions: 1756, population: 146, temperature: -5.1 },
    { country: 'Japan', co2Emissions: 1061, population: 125, temperature: 15.4 },
    { country: 'Germany', co2Emissions: 675, population: 83, temperature: 9.3 },
    { country: 'Iran', co2Emissions: 672, population: 84, temperature: 17.0 },
    { country: 'South Korea', co2Emissions: 616, population: 52, temperature: 12.5 },
    { country: 'Saudi Arabia', co2Emissions: 517, population: 35, temperature: 25.4 },
    { country: 'Canada', co2Emissions: 544, population: 38, temperature: -5.4 }
  ];
};

const Dashboard: React.FC<DashboardProps> = ({ selectedYear }) => {
  const [emissionTrends, setEmissionTrends] = useState<EmissionTrendData[]>([]);
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [trends, climate, countries] = await Promise.all([
          fetchEmissionTrends(),
          fetchClimateData(),
          fetchCountryData()
        ]);
        
        setEmissionTrends(trends);
        setClimateData(climate);
        setCountryData(countries);
      } catch (err) {
        setError('數據載入失敗');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">全球趨勢與關聯</h1>
        <p className="text-gray-600">分析全球碳排放、人口與氣溫的相關性</p>
      </div>

      {/* 上排圖表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 總排放量趨勢 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">總排放量趨勢</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={emissionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`${value.toLocaleString()} Mt CO₂`, '總排放量']}
                labelFormatter={(label: any) => `年份: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalEmissions" 
                stroke="#2563eb" 
                strokeWidth={3}
                name="總排放量 (Mt CO₂)"
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 碳排、人口、氣溫年度變化 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">碳排、人口、氣溫年度變化</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={climateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="co2Emissions" 
                stroke="#dc2626" 
                name="CO₂排放 (Mt)"
                strokeWidth={2}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="population" 
                stroke="#059669" 
                name="人口 (百萬)"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="temperature" 
                stroke="#ea580c" 
                name="氣溫 (°C)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 下排散布圖 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CO₂ vs 人口散布圖 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">CO₂排放 vs 人口關聯</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={countryData}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="population" 
                name="人口"
                unit="百萬"
              />
              <YAxis 
                type="number" 
                dataKey="co2Emissions" 
                name="CO₂排放"
                unit="Mt"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string) => [
                  name === 'co2Emissions' ? `${value} Mt CO₂` : `${value} 百萬人`,
                  name === 'co2Emissions' ? 'CO₂排放' : '人口'
                ]}
                labelFormatter={(label: any, payload: any) => 
                  payload && payload[0] ? `國家: ${payload[0].payload.country}` : ''
                }
              />
              <Scatter name="國家" dataKey="co2Emissions" fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* CO₂ vs 氣溫散布圖 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">CO₂排放 vs 氣溫關聯</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={countryData}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="temperature" 
                name="氣溫"
                unit="°C"
              />
              <YAxis 
                type="number" 
                dataKey="co2Emissions" 
                name="CO₂排放"
                unit="Mt"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string) => [
                  name === 'co2Emissions' ? `${value} Mt CO₂` : `${value}°C`,
                  name === 'co2Emissions' ? 'CO₂排放' : '平均氣溫'
                ]}
                labelFormatter={(label :any, payload:any) => 
                  payload && payload[0] ? `國家: ${payload[0].payload.country}` : ''
                }
              />
              <Scatter name="國家" dataKey="co2Emissions" fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;