import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const GlobalBoard: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [year, setYear] = useState(2020);
  const [plotData, setPlotData] = useState<any>(null);

  useEffect(() => {
    fetch(`/data/global_data?year=${year}`)
      .then(res => res.json())
      .then(data => {
        // 洲別顏色對應
        const continentColorMap: Record<string, string> = {
          'Asia': '#e6194b',
          'Europe': '#3cb44b',
          'Africa': '#ffe119',
          'North America': '#4363d8',
          'South America': '#f58231',
          'Oceania': '#911eb4',
        };

        // 把資料依洲分組
        const grouped: Record<string, any[]> = {};
        data.forEach((item: any) => {
          if (!grouped[item.continent]) {
            grouped[item.continent] = [];
          }
          grouped[item.continent].push(item);
        });

        // 為每個洲建立一個 trace
        const traces = Object.keys(grouped).map((continent) => {
          const countries = grouped[continent];
          return {
            type: 'scattergeo',
            name: continent,
            locations: countries.map((d) => d.iso_alpha),
            text: countries.map((d) =>
              `${d.Area}<br>Total Emission: ${Math.round(d.total_emission).toLocaleString()}`
            ),
            hoverinfo: 'text',
            marker: {
              size: countries.map((d) => Math.sqrt(d.total_emission) / 30),
              color: continentColorMap[continent] || '#999999',
              line: {
                width: 0.5,
                color: 'rgba(0,0,0,0.5)',
              },
            },
          };
        });

        setPlotData({
          data: traces,
          layout: {
            title: `Agrifood CO₂ Emission Map (${year})`,
            geo: { projection: { type: 'natural earth' } },
            height: 600,
            width: 1000,
            legend: {
              title: { text: "Continent" },
              orientation: "h",
              x: 0.5,
              xanchor: "center",
              y: -0.1,
            },
          },
        });
      });
  }, [year]);

  return (
    <div className="space-y-6 px-6 py-4">
      {/* 上方控制區 */}
      <div className="flex justify-between items-center">
        <button
          onClick={goBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          回到預測頁面
        </button>
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold">年份：</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border rounded px-4 py-2"
          >
            {Array.from({ length: 2020 - 1990 + 1 }, (_, i) => 2020 - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 地圖區域 */}
      <div className="flex justify-center">
        {plotData && (
          <Plot
            data={plotData.data}
            layout={plotData.layout}
            config={{ responsive: true }}
          />
        )}
      </div>
    </div>
  );
};

export default GlobalBoard;
