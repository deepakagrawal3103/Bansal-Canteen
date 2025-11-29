
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { PaymentMode } from '../types';

const Cart: React.FC = () => {
  const { state, addToCart, removeFromCart, submitOrder } = useApp();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');

  const totalAmount = state.cart.reduce((acc, i) => acc + (i.basePrice * i.qty), 0);

  const handleCheckout = async (mode: PaymentMode) => {
    if (state.cart.length === 0) return;
    setIsProcessing(true);
    
    if (mode === PaymentMode.ONLINE) {
      // Simulate Razorpay / UPI Intent Flow
      setLoadingText(`Connecting to ${state.paymentConfig.merchantName}...`);
      await new Promise(r => setTimeout(r, 800));
      setLoadingText('Opening UPI App...');
      await new Promise(r => setTimeout(r, 1000));
      setLoadingText('Verifying Payment...');
      await new Promise(r => setTimeout(r, 1000));
      // Success
    } else {
      setLoadingText('Creating Cash Order...');
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const order = await submitOrder(mode);
      navigate(`/order-tracking/${order.id}`);
    } catch (e) {
      alert('Order failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.cart.length === 0) {
    return (
      <Layout title="Your Cart" showBack>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <i className="ph ph-shopping-bag text-4xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Empty Cart</h2>
          <p className="text-gray-500 mt-2 text-sm">Add some delicious food to get started.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 bg-bansal-blue text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-blue-800"
          >
            Browse Menu
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout" showBack>
      <div className="p-4 space-y-6">
        
        {/* Items List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {state.cart.map(item => (
            <div key={item.id} className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-1">₹{item.basePrice} x {item.qty}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center active:bg-gray-100"
                >-</button>
                <span className="font-bold w-4 text-center text-gray-800">{item.qty}</span>
                <button 
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center active:bg-gray-100"
                >+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Item Total</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxes</span>
            <span>₹0</span>
          </div>
          <div className="border-t border-dashed border-gray-300 pt-3 mt-1 flex justify-between font-bold text-xl text-gray-900">
            <span>Total Payable</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4 pt-2">
            <h3 className="font-bold text-gray-800 ml-1">Choose Payment Method</h3>
            
            {/* Online Payment (Preferred) */}
            <button 
                disabled={isProcessing}
                onClick={() => handleCheckout(PaymentMode.ONLINE)}
                className="w-full relative bg-bansal-blue hover:bg-blue-800 text-white p-5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
                        <i className="ph ph-lightning text-xl"></i>
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-base">Pay Online (Instant)</div>
                        <div className="text-xs opacity-80">UPI, PhonePe, GPay, Paytm</div>
                    </div>
                </div>
                <i className="ph ph-caret-right text-xl opacity-80"></i>
            </button>
            <div className="text-[10px] text-center text-gray-500">
                Payment linked to: <b>{state.paymentConfig.merchantName} ({state.paymentConfig.upiId})</b>
            </div>

            {/* Cash Payment */}
            <button 
                disabled={isProcessing}
                onClick={() => handleCheckout(PaymentMode.CASH_DESK)}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 p-5 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-between hover:bg-gray-50"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center text-gray-500">
                        <i className="ph ph-coins text-xl"></i>
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-base">Pay Cash at Counter</div>
                        <div className="text-xs text-gray-500">Show Order ID to staff</div>
                    </div>
                </div>
                <i className="ph ph-caret-right text-xl text-gray-400"></i>
            </button>
        </div>

        {isProcessing && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl flex flex-col items-center shadow-2xl animate-pulse min-w-[250px]">
                    <div className="w-12 h-12 border-4 border-bansal-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-gray-800 text-lg">{loadingText}</p>
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default Cart;
