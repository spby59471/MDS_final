// types/index.ts
export interface RegionData {
    region: string;
    value: number;
  }
  
  export interface RenewableEnergyData {
    month: string;
    solar: number;
    wind: number;
  }
  
  export interface ForestCoverageData {
    name: string;
    value: number;
    color: string;
  }
  
  export interface EnvironmentalData {
    carbonEmission: RegionData[];
    renewableEnergy: RenewableEnergyData[];
    forestCoverage: ForestCoverageData[];
  }
  
  export interface DataCardProps {
    title: string;
    value: number;
    unit: string;
    icon: React.ComponentType<any>;
    trend?: number;
  }
  
  export interface ChartSectionProps {
    title: string;
    children: React.ReactNode;
    icon: React.ComponentType<any>;
  }
  
  // types/index.ts

// 基礎數據類型
export interface EmissionTrendData {
    year: number;
    totalEmissions: number;
  }
  
  export interface ClimateData {
    year: number;
    co2Emissions: number;
    population: number;
    temperature: number;
  }
  
  export interface CountryData {
    country: string;
    co2Emissions: number;
    population: number;
    temperature: number;
    region?: string;
    gdp?: number;
  }
  
  // API 響應類型
  export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    timestamp: string;
  }
  
  // 組件 Props 類型
  export interface DashboardProps {
    selectedYear: number;
  }
  
  export interface HeaderProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
  }
  
  // 圖表配置類型
  export interface ChartConfig {
    width?: string | number;
    height?: string | number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }
  
  // API 端點類型
  export interface ApiEndpoints {
    emissionTrends: string;
    climateData: string;
    countryData: string;
  }
  
  // 載入狀態類型
  export interface LoadingState {
    isLoading: boolean;
    error: string | null;
  }