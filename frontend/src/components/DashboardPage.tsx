// components/DashboardPage.tsx
import React from 'react';
import YearDashboard from './YearDashboard';
import CountryDashboard from './CountryDashboard';

interface DashboardPageProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedYear, setSelectedYear }) => {
  const [view, setView] = React.useState<'year' | 'country'>('year');

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <div className="flex gap-4 mb-4 lg:mb-0">
          <button
            className={`px-4 py-2 rounded text-white font-semibold ${view === 'year' ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'}`}
            onClick={() => setView('year')}
          >
            按年份查看
          </button>
          <button
            className={`px-4 py-2 rounded text-white font-semibold ${view === 'country' ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'}`}
            onClick={() => setView('country')}
          >
            按國家查看
          </button>
        </div>

        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="border rounded px-4 py-2 text-gray-800"
        >
        {Array.from({ length: 2020 - 1990 + 1 }, (_, i) => {
            const year = 2020 - i;
            return (
                <option key={year} value={year}>
                {year}
                </option>
            );
        })}
        </select>
      </div>

      {view === 'year' ? (
        <YearDashboard selectedYear={selectedYear} />
      ) : (
        <CountryDashboard selectedYear={selectedYear} />
      )}
    </div>
  );
};

export default DashboardPage;
