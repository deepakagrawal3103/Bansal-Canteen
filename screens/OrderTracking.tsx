import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { OrderStatus, PaymentMode } from '../types';

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const navigate = useNavigate();

  const order = state.orders.find(o => o.id === id);

  if (!order) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-500">Order not found.</div>
      </Layout>
    );
  }

  const getStatusColor = (s: OrderStatus) => {
    switch (s) {
      case OrderStatus.AWAITING_CASH: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800 border-blue-300';
      case OrderStatus.PREPARING: return 'bg-orange-100 text-orange-800 border-orange-300';
      case OrderStatus.READY: return 'bg-green-100 text-green-800 border-green-300';
      case OrderStatus.COMPLETED: return 'bg-gray-200 text-gray-600 border-gray-300';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusMessage = (s: OrderStatus) => {
    switch (s) {
      case OrderStatus.AWAITING_CASH: return 'Go to the counter & pay cash to confirm.';
      case OrderStatus.CONFIRMED: return 'Order Confirmed! Waiting for kitchen.';
      case OrderStatus.PREPARING: return 'Preparing your food... 🍳';
      case OrderStatus.READY: return 'Ready! Collect at counter. 🍱';
      case OrderStatus.COMPLETED: return 'Order Completed. Enjoy! 😋';
      default: return 'Order Cancelled';
    }
  };

  return (
    <Layout title="Order Status">
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 text-center">
        
        {/* Token Card */}
        <div className="bg-white w-full rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200">
            <div className={`p-6 ${order.status === OrderStatus.READY ? 'bg-green-600' : 'bg-bansal-blue'} text-white`}>
                <p className="text-xs uppercase tracking-widest opacity-80 font-bold mb-1">Your Token Number</p>
                <h1 className="text-7xl font-black tracking-tighter">{order.tokenNumber}</h1>
            </div>
            <div className="p-6">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(order.status)} mb-5`}>
                    {order.status.replace('_', ' ')}
                </div>
                
                <p className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                    {getStatusMessage(order.status)}
                </p>

                {order.status === OrderStatus.AWAITING_CASH && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-yellow-800 text-left mt-4 flex gap-3 items-start">
                        <i className="ph ph-warning-circle text-2xl flex-shrink-0"></i>
                        <span>
                            <b>Action Required:</b> Please show this screen at the Bansal Canteen counter and pay <b>₹{order.totalAmount}</b>.
                        </span>
                    </div>
                )}
            </div>
        </div>

        {/* Order Details */}
        <div className="w-full bg-white rounded-xl shadow-sm p-5 text-left border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Order Summary</h3>
            <ul className="space-y-3 mb-4">
                {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-gray-800 text-sm font-medium border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span>{item.qty} x {item.name}</span>
                        <span>₹{item.basePrice * item.qty}</span>
                    </li>
                ))}
            </ul>
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between font-bold text-gray-900 text-lg">
                <span>Total Amount</span>
                <span>₹{order.totalAmount}</span>
            </div>
            <div className="mt-4 text-xs text-gray-500 flex items-center gap-2 justify-center">
                <i className="ph ph-receipt"></i>
                Order ID: {order.id.slice(-8)}
            </div>
        </div>

        <button 
            onClick={() => navigate('/')}
            className="mt-8 text-bansal-blue font-bold text-sm flex items-center gap-2 hover:underline"
        >
            <i className="ph ph-house"></i>
            Back to Home
        </button>

      </div>
    </Layout>
  );
};

export default OrderTracking;