import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface YearDashboardProps {
  selectedYear: number;
}

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
      { key: 'food_transport', label: 'Food Transport' },
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const summaryRes = await fetch(`/data/yearly?year=${selectedYear}`);
        const summaryJson = await summaryRes.json();
        setSummary(summaryJson);

        const distributions: Record<string, DistributionData[]> = {};
        const indicators = INDICATOR_GROUPS.flatMap(group => group.items);
        let combinedData: DistributionData[] = [];

        for (const indicator of indicators) {
          const distRes = await fetch(`/data/top?year=${selectedYear}&indicator=${indicator.key}&top_n=5`);
          const distJson = await distRes.json();

          const cleaned = distJson.map((item: any) => ({
            area: item.area,
            value: Number(item[indicator.key])
          }));

          distributions[indicator.key] = cleaned;
          combinedData = [...combinedData, ...cleaned];
        }

        // 計算每個國家的碳排總量
        const totalsMap: Record<string, number> = {};
        for (const { area, value } of combinedData) {
          totalsMap[area] = (totalsMap[area] || 0) + value;
        }

        const totalPerCountry: DistributionData[] = Object.entries(totalsMap).map(
          ([area, value]) => ({ area, value })
        );

        totalPerCountry.sort((a, b) => b.value - a.value); // 遞減排序
        setTotalByCountry(totalPerCountry);
        setDistributionData(distributions);
      } catch (error) {
        console.error('載入失敗:', error);
      }

      setLoading(false);
    };

    load();
  }, [selectedYear]);

  if (loading || !summary) return <p className="text-center">載入中...</p>;

  return (
    <div className="space-y-10">
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-xl font-bold mb-2">{selectedYear} 全球總覽</h2>
        <p>碳排放總量：{summary.total_emission.toLocaleString()} Mt CO₂</p>
        <p>平均氣溫：{summary.avg_temp.toFixed(2)} °C</p>
        <p>總人口：{(summary.total_pop_male + summary.total_pop_female).toLocaleString()} 人</p>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">各國總碳排放量（所有指標總和）</h2>
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
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} kt`, '總排放']} />
            <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
        </div>


      {INDICATOR_GROUPS.map(group => (
        <div key={group.category}>
          <h2 className="text-xl font-bold mb-4">{group.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {group.items.map(({ key, label }) => (
              <div key={key} className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">{label} - 排名前五國家</h3>
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
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} kt`, '排放量']} />
                    <Bar dataKey="value" fill="#8884d8" />
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
