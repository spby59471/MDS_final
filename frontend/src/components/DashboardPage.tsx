// components/DashboardPage.tsx
import React from 'react';
import YearDashboard from './YearDashboard';
import CountryDashboard from './CountryDashboard';
// import ContinentDashboard from './ContinentDashboard';
import PredictDashboard from './PredictDashboard';

interface DashboardPageProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedYear, setSelectedYear }) => {
  const [view, setView] = React.useState<'predict' | 'year' | 'country' | 'continent'>('predict');

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (view === 'year') {
    setSelectedYear(Number(event.target.value));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-0 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <div className="flex gap-4 mb-4 lg:mb-0">
          <button
            className={`px-4 py-2 text-white rounded transition
              bg-[#058068]
              hover:bg-[#069A7D]
              font-bold 
              ${view === 'predict' ? 'ring-2 ring-white' : ''}`}
            onClick={() => setView('predict')}
          >
            Predict Model
          </button>
          <button
            className={`px-4 py-2 text-white rounded transition
              bg-[#058068]
              hover:bg-[#069A7D]
              font-bold 
              ${view === 'year' ? 'ring-2 ring-white' : ''}`}
            onClick={() => setView('year')}
          >
            View by Year
          </button>
          <button
            className={`px-4 py-2 text-white rounded transition
              bg-[#058068]
              hover:bg-[#069A7D]
              font-bold 
              ${view === 'country' ? 'ring-2 ring-white' : ''}`}
            onClick={() => setView('country')}
          >
            View by Country
          </button>
          {/* <button
            className={`px-4 py-2 text-white rounded transition
              bg-[#058068]
              hover:bg-[#069A7D]
              font-bold 
              ${view === 'continent' ? 'ring-2 ring-white' : ''}`}
            onClick={() => setView('continent')}
          >
            View by Continent
          </button> */}
        </div>
        {view === 'year' && (
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
      )}
      </div>

      {view === 'predict' && <PredictDashboard />}
      {view === 'year' && <YearDashboard selectedYear={selectedYear} />}
      {view === 'country' && <CountryDashboard selectedYear={selectedYear} />}
      {/* {view === 'continent' && <ContinentDashboard/>} */}
    </div>
  );
};

export default DashboardPage;

