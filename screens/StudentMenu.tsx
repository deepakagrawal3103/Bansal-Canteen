
import React, { useMemo } from 'react';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const StudentMenu: React.FC = () => {
  const { state, addToCart, removeFromCart } = useApp();
  const navigate = useNavigate();

  const activeItems = useMemo(() => {
    return state.menuMaster.filter(item => {
      const stock = state.dailyInventory[item.id];
      return stock && stock.available;
    });
  }, [state.menuMaster, state.dailyInventory]);

  const cartTotalQty = state.cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <Layout>
      {/* CSS for custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card-enter {
          opacity: 0;
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes floatUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-float-up {
          animation: floatUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Hero Banner with Gradient */}
      <div className="bg-gradient-to-b from-white to-blue-50/50 p-6 pt-8 pb-6 border-b border-blue-100/50 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="flex justify-between items-start">
          <div className="animate-card-enter" style={{ animationDelay: '0ms' }}>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">
              <span className="text-bansal-blue">Bansal</span> Canteen
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Open Now &bull; Fresh Food
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-100/50 rounded-full flex items-center justify-center text-bansal-blue animate-card-enter" style={{ animationDelay: '100ms' }}>
            <i className="ph-fill ph-bowl-food text-xl"></i>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-32 grid grid-cols-2 gap-4">
        {activeItems.map((item, index) => {
          const stock = state.dailyInventory[item.id];
          const cartItem = state.cart.find(c => c.id === item.id);
          const isOutOfStock = stock.trackStock && stock.stockQty <= 0;
          const currentQty = cartItem ? cartItem.qty : 0;
          const maxAllowed = stock.trackStock ? stock.stockQty : 99;
          
          // Staggered delay based on index
          const delay = `${100 + (index * 50)}ms`;

          return (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col animate-card-enter group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/5"
              style={{ animationDelay: delay }}
            >
              {/* Image Section */}
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`} 
                  loading="lazy"
                />
                
                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white font-bold text-[10px] uppercase tracking-wider bg-red-500 px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                      Sold Out
                    </span>
                  </div>
                )}

                {/* Low Stock Badge */}
                {stock.trackStock && !isOutOfStock && stock.stockQty < 20 && (
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm border border-orange-100 flex items-center gap-1 animate-pulse">
                    <i className="ph-fill ph-fire"></i>
                    Only {stock.stockQty} left
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 leading-tight text-sm mb-1 line-clamp-2 min-h-[2.5em]">
                    {item.name}
                  </h4>
                  <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xs text-slate-400 font-bold">₹</span>
                        <span className="text-slate-900 font-black text-xl">{item.basePrice}</span>
                    </div>
                    {item.category && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {!isOutOfStock ? (
                    cartItem ? (
                      <div className="flex items-center justify-between bg-bansal-blue rounded-xl overflow-hidden h-10 shadow-lg shadow-blue-200 ring-2 ring-blue-100 transition-all duration-300">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-10 flex items-center justify-center text-white font-black hover:bg-white/20 active:bg-white/30 transition-colors h-full text-lg"
                        >
                          <i className="ph-bold ph-minus text-xs"></i>
                        </button>
                        <span className="text-sm font-bold text-white min-w-[20px] text-center">{cartItem.qty}</span>
                        <button 
                          onClick={() => currentQty < maxAllowed && addToCart(item)}
                          disabled={currentQty >= maxAllowed}
                          className={`w-10 flex items-center justify-center text-white font-black hover:bg-white/20 active:bg-white/30 transition-colors h-full text-lg ${currentQty >= maxAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <i className="ph-bold ph-plus text-xs"></i>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-full bg-slate-50 border-2 border-slate-100 text-slate-700 text-sm font-bold py-2.5 rounded-xl hover:bg-bansal-blue hover:text-white hover:border-bansal-blue hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-white"
                      >
                        ADD <i className="ph-bold ph-plus text-xs"></i>
                      </button>
                    )
                  ) : (
                    <button disabled className="w-full bg-slate-50 text-slate-300 text-xs font-bold py-3 rounded-xl cursor-not-allowed border border-slate-100">
                      Unavailable Today
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Button */}
      {cartTotalQty > 0 && (
        <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 z-40 animate-float-up">
          <button 
            onClick={() => navigate('/cart')}
            className="w-full bg-slate-900 text-white p-1 rounded-2xl shadow-2xl flex justify-between items-center active:scale-95 transition-transform border border-slate-800 relative overflow-hidden group"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
            
            <div className="flex items-center gap-3 p-3 z-10">
              <div className="bg-white text-slate-900 text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                {cartTotalQty} <span className="hidden sm:inline">ITEMS</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pr-5 z-10">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total</span>
                <span className="font-bold text-lg leading-none">
                  ₹{state.cart.reduce((a, b) => a + (b.basePrice * b.qty), 0)}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-slate-700 mx-3"></div>
              <span className="text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Checkout <i className="ph-bold ph-caret-right"></i>
              </span>
            </div>
          </button>
        </div>
      )}
    </Layout>
  );
};

export default StudentMenu;
