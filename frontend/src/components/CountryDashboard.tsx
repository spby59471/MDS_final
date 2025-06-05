// components/CountryDashboard.tsx
import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CountryDashboardProps {
  selectedYear: number;
}

interface CountryData {
  country: string;
  co2Emissions: number;
  population: number;
  temperature: number;
}

const CountryDashboard: React.FC<CountryDashboardProps> = ({ selectedYear }) => {
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch(`/data/country_summary?year=${selectedYear}`);
      const raw = await res.json();
        if (!Array.isArray(raw)) {
        console.error("API response is not an array:", raw);
        return;
      }
      const processed = raw.map((d: any) => ({
        country: d.area,
        co2Emissions: d.total_emission,
        population: d.total_pop_male + d.total_pop_female,
        temperature: d.avg_temp
      }));
      setData(processed);
      setLoading(false);
    };
    load();
  }, [selectedYear]);

  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="space-y-10">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">CO₂排放 vs 人口</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="population" name="人口" unit="人" />
            <YAxis type="number" dataKey="co2Emissions" name="CO₂排放" unit="Mt" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">CO₂排放 vs 氣溫</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="temperature" name="氣溫" unit="°C" />
            <YAxis type="number" dataKey="co2Emissions" name="CO₂排放" unit="Mt" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#ef4444" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CountryDashboard;
