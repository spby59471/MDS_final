// src/components/Header.tsx
import React from 'react';
import { Leaf } from 'lucide-react'; // 移除 Calendar 引入

// 移除 HeaderProps 介面，因為不再需要傳遞 selectedYear 和 onYearChange
// interface HeaderProps {
//   selectedYear: number;
//   onYearChange: (year: number) => void;
// }

// 修改組件簽名，不再接收 props
const Header: React.FC = () => { // 移除 { selectedYear, onYearChange }

  // 移除 availableYears 陣列的定義
  // const availableYears = [2024, 2023, 2022, 2021, 2020];

  return (
    <header className="bg-gradient-to-br from-[#09bc8a] to-[#004346] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Leaf className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold font-['Cambria',_serif]">Agricultral CO2 Emission</h1>
              <p className="text-emerald-100 mt-1 font-['Cambria',_serif]">Environmental Data Analytics Dashboard</p>
            </div>
          </div>
          
          {/* 刪除這個整個區塊，這是年份選單的部分 */}
          {/*
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
            <Calendar className="h-5 w-5" />
            <select 
              value={selectedYear} 
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year} className="text-gray-800">
                  {year}年
                </option>
              ))}
            </select>
          </div>
          */}
        </div>
      </div>
    </header>
  );
};

export default Header;