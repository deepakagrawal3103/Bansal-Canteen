import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { Order, OrderStatus, PaymentMode } from '../types';
import { useNavigate } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  const { state, updateOrder } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  const activeOrders = useMemo(() => {
    return state.orders
      .filter(o => ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(o.status))
      .sort((a, b) => {
        const priority = {
            [OrderStatus.AWAITING_CASH]: 1,
            [OrderStatus.CONFIRMED]: 2,
            [OrderStatus.PREPARING]: 3,
            [OrderStatus.READY]: 4,
            [OrderStatus.COMPLETED]: 9,
            [OrderStatus.CANCELLED]: 9
        };
        return priority[a.status] - priority[b.status];
      });
  }, [state.orders]);

  const historyOrders = useMemo(() => {
      return state.orders
        .filter(o => [OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(o.status))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50); 
  }, [state.orders]);

  const displayedOrders = filter === 'ACTIVE' ? activeOrders : historyOrders;

  const handleNextStatus = (order: Order) => {
    let next: OrderStatus | null = null;
    switch (order.status) {
        case OrderStatus.AWAITING_CASH: next = OrderStatus.CONFIRMED; break; // "Cash Received"
        case OrderStatus.CONFIRMED: next = OrderStatus.PREPARING; break;     // "Start Cooking"
        case OrderStatus.PREPARING: next = OrderStatus.READY; break;         // "Mark Ready"
        case OrderStatus.READY: next = OrderStatus.COMPLETED; break;         // "Delivered"
        default: break;
    }
    if (next) updateOrder(order.id, next);
  };

  const getActionButtonText = (status: OrderStatus) => {
      switch (status) {
          case OrderStatus.AWAITING_CASH: return '💵 Confirm Cash';
          case OrderStatus.CONFIRMED: return '👨‍🍳 Start Cooking';
          case OrderStatus.PREPARING: return '✅ Mark Ready';
          case OrderStatus.READY: return '🎉 Complete Order';
          default: return 'Next';
      }
  };

  const getActionButtonColor = (status: OrderStatus) => {
      switch (status) {
          case OrderStatus.AWAITING_CASH: return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
          case OrderStatus.CONFIRMED: return 'bg-bansal-blue hover:bg-blue-900 shadow-blue-200';
          case OrderStatus.PREPARING: return 'bg-orange-500 hover:bg-orange-600 shadow-orange-200';
          case OrderStatus.READY: return 'bg-gray-800 hover:bg-gray-900 shadow-gray-200';
          default: return 'bg-gray-500';
      }
  };

  return (
    <Layout title="Kitchen Display">
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 px-4 py-3 flex justify-between items-center shadow-sm backdrop-blur-md bg-white/90">
        
        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
                onClick={() => setFilter('ACTIVE')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'ACTIVE' ? 'bg-white text-bansal-blue shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Active ({activeOrders.length})
            </button>
            <button 
                onClick={() => setFilter('HISTORY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'HISTORY' ? 'bg-white text-bansal-blue shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
                History
            </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 border border-slate-200 active:scale-95 transition-all"
                title="Go to Home"
            >
                <i className="ph ph-house text-lg"></i>
            </button>
            <button 
                onClick={() => navigate('/admin')}
                className="w-10 h-10 rounded-full bg-bansal-blue text-white flex items-center justify-center hover:bg-blue-800 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                title="Admin Panel"
            >
                <i className="ph ph-gear text-lg"></i>
            </button>
        </div>
      </div>

      <div className="p-4 space-y-5 bg-slate-50 min-h-screen pb-32">
        {displayedOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <i className="ph ph-cooking-pot text-4xl opacity-50"></i>
                </div>
                <p className="font-bold text-lg">All caught up!</p>
                <p className="text-sm">No orders in queue</p>
            </div>
        )}

        {displayedOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-100 group">
                {/* Order Header */}
                <div className="flex justify-between items-center bg-slate-50/50 p-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="bg-slate-800 text-white font-black px-3.5 py-1.5 rounded-lg text-xl shadow-lg shadow-slate-200">
                            #{order.tokenNumber}
                        </span>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Placed At</span>
                            <span className="text-xs text-slate-700 font-mono font-bold">
                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {order.paymentMode === PaymentMode.CASH_DESK ? (
                             <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                <i className="ph-fill ph-money text-green-600"></i>
                                <span className="text-[10px] font-bold text-green-700">CASH</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                <i className="ph-fill ph-lightning text-blue-600"></i>
                                <span className="text-[10px] font-bold text-blue-700">ONLINE</span>
                            </div>
                        )}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                            order.status === OrderStatus.READY ? 'bg-green-100 text-green-800 border-green-200' :
                            order.status === OrderStatus.AWAITING_CASH ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                            {order.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Order Body */}
                <div className="p-4">
                    <ul className="space-y-3 mb-5">
                        {order.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                                    <img src={item.image} className="w-full h-full object-cover" alt="thumb" />
                                </div>
                                <div className="text-sm font-medium text-slate-700 flex-1 flex justify-between items-center">
                                    <span className="font-bold text-slate-800 text-base">{item.name}</span>
                                    <div className="bg-slate-100 px-3 py-1 rounded-lg text-slate-800 font-bold text-sm">
                                        x {item.qty}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    {filter === 'ACTIVE' && (
                        <div className="flex gap-3 pt-4 border-t border-slate-50">
                            <button 
                                onClick={() => updateOrder(order.id, OrderStatus.CANCELLED)}
                                className="w-12 h-12 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                                title="Cancel Order"
                            >
                                <i className="ph ph-trash text-xl"></i>
                            </button>
                            
                            <button 
                                onClick={() => handleNextStatus(order)}
                                className={`flex-1 text-sm font-bold py-3 rounded-xl text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${getActionButtonColor(order.status)}`}
                            >
                                {getActionButtonText(order.status)}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </Layout>
  );
};

export default StaffDashboard;