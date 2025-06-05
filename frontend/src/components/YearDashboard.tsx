import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface SummaryData {
  total_emission: number;
  avg_temp: number;
  total_pop_male: number;
  total_pop_female: number;
}

interface DistributionData {
  area: string;
  value: number;
}

interface YearDashboardProps {
  selectedYear: number;
}

const INDICATOR_GROUPS = [
  {
    category: 'Fire',
    items: [
      { key: 'savanna_fires', label: 'Savanna Fires' },
      { key: 'forest_fires', label: 'Forest Fires' },
      { key: 'fires_organic', label: 'Fires in Organic Soils' }
    ]
  },
  {
    category: 'Food',
    items: [
      { key: 'rice_cultivation', label: 'Rice Cultivation' },
      { key: 'food_retail', label: 'Food Retail' },
      { key: 'food_transport', 'label': 'Food Transport' },
      { key: 'pesticides', label: 'Pesticides Manufacturing' }
    ]
  },
  {
    category: 'Forest',
    items: [
      { key: 'forestland', label: 'Forestland' },
      { key: 'net_forest_conversion', label: 'Forest Conversion' }
    ]
  },
  {
    category: 'Manure',
    items: [
      { key: 'manure_applied', label: 'Manure Applied to Soils' },
      { key: 'manure_left', label: 'Manure Left on Pasture' }
    ]
  },
  {
    category: 'Others',
    items: [
      { key: 'onfarm_electricity', label: 'On-farm Electricity Use' },
      { key: 'ippu', label: 'IPPU' },
      { key: 'drained_soils', label: 'Drained Organic Soils (CO₂)' }
    ]
  }
];

const YearDashboard: React.FC<YearDashboardProps> = ({ selectedYear }) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [distributionData, setDistributionData] = useState<Record<string, DistributionData[]>>({});
  const [totalByCountry, setTotalByCountry] = useState<DistributionData[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const summaryRes = await fetch(`${API_BASE_URL}/data/yearly?year=${selectedYear}`);
        if (!summaryRes.ok) {
          const errorText = await summaryRes.text();
          throw new Error(`Failed to fetch summary data: ${summaryRes.status} ${errorText}`);
        }
        const summaryJson: SummaryData = await summaryRes.json();
        setSummary(summaryJson);

        const distributions: Record<string, DistributionData[]> = {};
        const indicators = INDICATOR_GROUPS.flatMap(group => group.items);
        let combinedData: DistributionData[] = [];

        for (const indicator of indicators) {
          const distRes = await fetch(`${API_BASE_URL}/data/top?year=${selectedYear}&indicator=${indicator.key}&top_n=5`);
          if (!distRes.ok) {
            const errorText = await distRes.text();
            console.warn(`Failed to fetch distribution data for ${indicator.key}: ${distRes.status} ${errorText}`);
            distributions[indicator.key] = [];
            continue;
          }
          const distJson: DistributionData[] = await distRes.json();
          distributions[indicator.key] = distJson;
          combinedData = [...combinedData, ...distJson];
        }

        const totalsMap: Record<string, number> = {};
        for (const { area, value } of combinedData) {
          totalsMap[area] = (totalsMap[area] || 0) + value;
        }

        const totalPerCountry: DistributionData[] = Object.entries(totalsMap).map(
          ([area, value]) => ({ area, value })
        );

        totalPerCountry.sort((a, b) => b.value - a.value);
        setTotalByCountry(totalPerCountry);
        setDistributionData(distributions);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedYear]);

  if (loading || !summary) return <p className="text-center">Loading...</p>;

  return (
    <div className="space-y-10">
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">{selectedYear} Global Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">Total CO₂ Emissions</span>
            <span className="text-xl text-green-600">{summary.total_emission.toLocaleString()} Mt</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">Average Temperature</span>
            <span className="text-xl text-blue-500">{summary.avg_temp.toFixed(2)} °C</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">Total Population</span>
            <span className="text-xl text-rose-600">
              {(summary.total_pop_male + summary.total_pop_female).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      ---

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Total CO₂ Emissions by Country (All Indicators Combined)</h2>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={totalByCountry.filter(d => d.area !== "China, mainland")}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="area"
              interval={0}
              angle={-45}
              textAnchor="end"
              tick={{ fontSize: 10 }}
              height={80}
              label={{
                value: 'Country',
                position: 'insideBottomRight',
                offset: -5,
                style: { textAnchor: 'end', fontSize: 12 }
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              width={70}
              label={{
                value: 'kt',
                position: 'insideTopLeft',
                offset: 0,
                angle: 0,
                style: { textAnchor: 'start', fontSize: 12 }
              }}
            />
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} kt`, 'Total Emissions']} />
            <Bar dataKey="value" fill="#007c77" /> {/* Changed fill to green */}
          </BarChart>
        </ResponsiveContainer>
      </div>

      ---

      {INDICATOR_GROUPS.map(group => (
        <div key={group.category}>
          <h2 className="text-xl font-bold mb-4">{group.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {group.items.map(({ key, label }) => (
              <div key={key} className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">{label} - Top 5 Countries</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distributionData[key]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="area"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      tick={{ fontSize: 10 }}
                      height={60}
                      label={{
                        value: 'Country',
                        position: 'insideBottomRight',
                        offset: -5,
                        style: { textAnchor: 'end', fontSize: 12 }
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      width={60}
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                      label={{
                        value: 'kt',
                        angle: 0,
                        position: 'insideTopLeft',
                        offset: 10,
                        style: { textAnchor: 'start', fontSize: 12 }
                      }}
                    />
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} kt`, 'Emissions']} />
                    <Bar dataKey="value" fill="#007c77" /> {/* Changed fill to green */}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default YearDashboard;