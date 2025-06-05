import React, { useEffect, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

interface CountryDashboardProps {
  selectedYear: number;
}

interface CountryData {
  country: string;
  co2Emissions: number;
  population: number;
  temperature: number;
}

interface CountryTrendData {
  year: number;
  co2Emissions: number;
}

interface IndicatorData {
  year: number;
  [key: string]: number;
}

const INDICATOR_OPTIONS = [
  { key: "savanna_fires", label: "Savanna fires", color: "#e6194b" },
  { key: "forest_fires", label: "Forest fires", color: "#3cb44b" },
  { key: "fires_organic", label: "Organic soil fires", color: "#ffe119" },
  { key: "rice_cultivation", label: "Rice Cultivation", color: "#0082c8" },
  { key: "food_retail", label: "Food Retail", color: "#f58231" },
  { key: "food_transport", label: "Food Transport", color: "#911eb4" },
  { key: "pesticides", label: "Pesticides", color: "#46f0f0" },
  { key: "forestland", label: "Forestland", color: "#f032e6" },
  { key: "net_forest_conversion", label: "Net Forest Conversion", color: "#d2f53c" },
  { key: "manure_applied", label: "Manure Applied", color: "#fabebe" },
  { key: "manure_left", label: "Manure Left", color: "#008080" },
  { key: "onfarm_electricity", label: "On-farm Electricity", color: "#e6beff" },
  { key: "ippu", label: "IPPU", color: "#aa6e28" },
  { key: "drained_soils", label: "Drained Soils", color: "#cc6600" }
];

const CountryDashboard: React.FC<CountryDashboardProps> = ({ selectedYear }) => {
  const [data, setData] = useState<CountryData[]>([]);
  const [trendData, setTrendData] = useState<CountryTrendData[]>([]);
  const [indicatorData, setIndicatorData] = useState<IndicatorData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(
    INDICATOR_OPTIONS.map(opt => opt.key)
  );

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE_URL}/data/country_summary?year=${selectedYear}`);
      const json = await res.json();
      setData(json);
      setSelectedCountry('');
    };
    load();
  }, [selectedYear]);

  useEffect(() => {
    const fetchTrend = async () => {
      const url = selectedCountry
        ? `${API_BASE_URL}/data/country_trend?country=${encodeURIComponent(selectedCountry)}`
        : `${API_BASE_URL}/data/country_trend`;
      const res = await fetch(url);
      const json = await res.json();
      setTrendData(json);
    };
    fetchTrend();
  }, [selectedCountry]);

  useEffect(() => {
    const fetchIndicators = async () => {
      const url = selectedCountry
        ? `${API_BASE_URL}/data/indicator_lines_fixed?area=${encodeURIComponent(selectedCountry)}`
        : `${API_BASE_URL}/data/indicator_lines_fixed`;
      const res = await fetch(url, { method: "POST" });
      const json = await res.json();
      console.log("📈 trendData:", json);
      setIndicatorData(json);
    };
    fetchIndicators();
  }, [selectedCountry]);

  const countryOptions = Array.from(new Set(data.map(d => d.country))).sort();
  const filteredData = selectedCountry ? data.filter(d => d.country === selectedCountry) : data;

  return (
    <div className="space-y-10">
      <div className="bg-white p-6 rounded shadow">
        <label className="block mb-2 text-sm font-medium text-gray-700">Country Selection</label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">All Countries</option>
          {countryOptions.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Total CO₂ Emissions by {selectedCountry || "All Countries"} Over the Years
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{
                fontSize: 14,
                angle: -45,
                textAnchor: 'end',  // 搭配 angle=45 時建議使用 start
              }}
            />
            <YAxis
              tickFormatter={(value: number) => `${(value / 1_000_000).toFixed(1)} M`}
            />

            <Tooltip formatter={(value: number) => `${value.toLocaleString()} Mt`} />
            <Legend verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
            />
            <Line type="monotone" dataKey="co2Emissions" name="CO₂排放" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{selectedCountry || "All country"}'s Indicators (Multi-selectable)</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {INDICATOR_OPTIONS.map(opt => (
            <label key={opt.key} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedIndicators.includes(opt.key)}
                onChange={() => {
                  setSelectedIndicators(prev =>
                    prev.includes(opt.key)
                      ? prev.filter(i => i !== opt.key)
                      : [...prev, opt.key]
                  );
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={indicatorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{
                fontSize: 14,
                angle: -45,
                textAnchor: 'end',  // 搭配 angle=45 時建議使用 start
              }}
            />
            <YAxis
              tickFormatter={(value: number) => `${(value / 1_000_000).toFixed(1)} M`}
            />

            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
            />
            {INDICATOR_OPTIONS.filter(opt => selectedIndicators.includes(opt.key)).map(opt => (
              <Line
                key={opt.key}
                type="monotone"
                dataKey={opt.key}
                name={opt.label}
                stroke={opt.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart >
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CountryDashboard;
