// App.tsx
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Dashboard selectedYear={selectedYear} />
      </main>

      <Footer />
    </div>
  );
};

export default App;