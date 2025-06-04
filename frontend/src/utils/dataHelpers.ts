// utils/dataHelpers.ts
import { EnvironmentalData } from '../types';

export const generateData = (year: number): EnvironmentalData => {
  const yearDiff = 2024 - year;
  
  return {
    carbonEmission: [
      { region: '台北', value: Math.floor(Math.random() * 100) + 50 + yearDiff * 5 },
      { region: '台中', value: Math.floor(Math.random() * 80) + 40 + yearDiff * 4 },
      { region: '高雄', value: Math.floor(Math.random() * 90) + 45 + yearDiff * 4.5 },
      { region: '桃園', value: Math.floor(Math.random() * 70) + 35 + yearDiff * 3.5 },
      { region: '台南', value: Math.floor(Math.random() * 75) + 38 + yearDiff * 4 }
    ],
    renewableEnergy: [
      { month: '1月', solar: Math.floor(Math.random() * 30) + 20, wind: Math.floor(Math.random() * 25) + 15 },
      { month: '2月', solar: Math.floor(Math.random() * 35) + 25, wind: Math.floor(Math.random() * 30) + 20 },
      { month: '3月', solar: Math.floor(Math.random() * 40) + 30, wind: Math.floor(Math.random() * 35) + 25 },
      { month: '4月', solar: Math.floor(Math.random() * 45) + 35, wind: Math.floor(Math.random() * 32) + 22 },
      { month: '5月', solar: Math.floor(Math.random() * 50) + 40, wind: Math.floor(Math.random() * 28) + 18 },
      { month: '6月', solar: Math.floor(Math.random() * 55) + 45, wind: Math.floor(Math.random() * 30) + 20 }
    ],
    forestCoverage: [
      { name: '森林覆蓋', value: 65 + Math.floor(Math.random() * 10), color: '#10b981' },
      { name: '農業用地', value: 20 + Math.floor(Math.random() * 5), color: '#84cc16' },
      { name: '城市建設', value: 10 + Math.floor(Math.random() * 3), color: '#6b7280' },
      { name: '其他', value: 5 + Math.floor(Math.random() * 2), color: '#f59e0b' }
    ]
  };
};

export const calculateTotalEmission = (carbonData: RegionData[]): number => {
  return carbonData.reduce((sum, item) => sum + item.value, 0);
};

export const calculateAverageRenewable = (renewableData: RenewableEnergyData[]): number => {
  return Math.round(
    renewableData.reduce((sum, item) => sum + item.solar + item.wind, 0) / renewableData.length
  );
};

export const getColorByEmissionValue = (value: number): string => {
  if (value < 50) return '#10b981'; // 綠色 - 低排放
  if (value < 80) return '#f59e0b'; // 橙色 - 中等排放
  return '#ef4444'; // 紅色 - 高排放
};