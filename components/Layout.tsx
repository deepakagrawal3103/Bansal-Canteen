import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-start pt-0 sm:pt-4 font-sans text-slate-800">
      {/* Mobile Frame */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[850px] sm:h-auto sm:rounded-[2rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-900 overflow-hidden relative flex flex-col">
        
        {/* Header */}
        <header className="bg-bansal-blue text-white py-4 px-5 shadow-lg sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={() => navigate(-1)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
              >
                <i className="ph ph-arrow-left text-xl font-bold"></i>
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">{title || 'Bansal Canteen'}</h1>
          </div>
          
          {/* Staff Portal Link */}
          {isHome && (
            <button 
              onClick={() => navigate('/staff-login')}
              className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 backdrop-blur-md py-1.5 px-3 rounded-full hover:bg-white/20 transition-all border border-white/10 shadow-sm"
            >
              <i className="ph ph-lock-key text-sm"></i>
              STAFF
            </button>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-slate-50 relative">
          {/* Subtle decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;