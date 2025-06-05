import React, { useEffect, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis,
  ResponsiveContainer, Legend
} from 'recharts';

interface BubbleData {
  area: string;
  avg_temp: number;
  total_emission: number;
  total_population: number;
  continent: string;
}

// 每個洲對應一種顏色
const continentColors: Record<string, string> = {
  Asia: "#e6194b",
  Europe: "#3cb44b",
  Africa: "#ffe119",
  "North America": "#4363d8",
  "South America": "#f58231",
  Oceania: "#911eb4",
  Other: "#a9a9a9"
};

const ContinentBubbleChart: React.FC = () => {
  const [data, setData] = useState<BubbleData[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/data/continent-bubble")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        CO₂ Emission vs Temperature by Country (Bubble Size = Population)
      </h2>
      <ResponsiveContainer width="100%" height={550}>
  <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 30 }}>
    <CartesianGrid />
    <XAxis
      type="number"
      dataKey="avg_temp"
      name="Temperature"
      label={{ value: "Average Temperature (°C)", position: "insideBottom", offset: -5 }}
    />
    <YAxis
      type="number"
      dataKey="total_emission"
      name="CO₂ Emission"
      tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
      label={{ value: "Total CO₂ Emission (kt)", angle: -90, position: "insideLeft" }}
    />
    
    {/* ✅ ZAxis 要放在這裡，和 X/Y Axis 同層 */}
    <ZAxis
      dataKey="total_population"
      range={[100, 2000]}
      name="Population"
    />

    <Tooltip
      cursor={{ strokeDasharray: "3 3" }}
      formatter={(value: number, name: string) => {
        if (name === "avg_temp") return [`${value.toFixed(2)} °C`, "Temperature"];
        if (name === "total_emission") return [`${value.toLocaleString()} kt`, "CO₂ Emission"];
        if (name === "total_population") return [`${(value / 1_000_000).toFixed(1)} M`, "Population"];
        return [value, name];
      }}
      labelFormatter={(_, payload) =>
        payload?.[0]?.payload?.area ? `Country: ${payload[0].payload.area}` : ""
      }
    />
    <Legend verticalAlign="top" />
    
    {Object.keys(continentColors).map((continent) => (
      <Scatter
        key={continent}
        name={continent}
        data={data.filter(d => d.continent === continent)}
        fill={continentColors[continent]}
        shape="circle"
      />
    ))}
  </ScatterChart>
</ResponsiveContainer>

    </div>
  );
};

export default ContinentBubbleChart;
