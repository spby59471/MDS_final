// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            綠色環境數據分析平台
          </p>
          <p className="text-sm opacity-80">
            &copy; 2024 Environmental Data Analytics Platform. 致力於環境保護與可持續發展.
          </p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-emerald-400 transition-colors">關於我們</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">數據來源</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">聯絡我們</a>
          </div>
          <div className="text-gray-400">
            最後更新：{new Date().toLocaleDateString('zh-TW')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;