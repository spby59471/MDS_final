import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface GlobalBoardProps {
  goBack: () => void;
}

interface CountryEmission {
  area: string;
  value: number;
}

const GlobalBoard: React.FC<GlobalBoardProps> = ({ goBack }) => {
  const [data, setData] = useState<CountryEmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/data/global_summary'); // e.g., [{ area: "China", value: 50000 }]
        const json = await res.json();
        const sorted = json
          .filter((d: any) => typeof d.value === 'number')
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 10); // top 10
        setData(sorted);
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <button
          onClick={goBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          回到預測頁面
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center">全球前十大 CO₂ 排放國家</h2>

      <div className="bg-white p-6 rounded shadow">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="area"
              angle={-30}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 12 }}
              height={70}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: 'Mt CO₂',
                position: 'insideTopLeft',
                offset: 0,
                style: { fontSize: 14 }
              }}
            />
            <Tooltip formatter={(val: number) => `${val.toLocaleString()} Mt`} />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlobalBoard;
