// App.tsx
import React, { useState } from 'react';
import Header from './components/Header';
// import Footer from './components/Coun';
import DashboardPage from './components/DashboardPage';

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [page, setPage] = useState<'dashboard' | 'year'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-1">
        {page === 'dashboard' && (
          <DashboardPage
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            goToYearPage={() => setPage('year')}
          />
        )}

        {/* {page === 'year' && (
          <YearDashboard
            selectedYear={selectedYear}
            goBack={() => setPage('dashboard')}
          />
        )} */}
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default App;