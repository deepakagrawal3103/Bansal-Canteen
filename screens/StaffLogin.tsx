
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../AppContext';

const StaffLogin: React.FC = () => {
  const { state, updateStaffPin } = useApp();
  const [pin, setPin] = useState('');
  const [view, setView] = useState<'LOGIN' | 'FORGOT'>('LOGIN');
  const [mobileInput, setMobileInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const navigate = useNavigate();

  // --- Logic for Login View ---
  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin === state.staffPin) {
      navigate('/staff-dashboard');
    } else {
      alert('Incorrect PIN');
      setPin('');
    }
  };

  // --- Logic for Forgot Password View ---
  const handleReset = () => {
    if (mobileInput === state.adminMobile) {
        if (newPinInput.length === 4) {
            updateStaffPin(newPinInput);
            alert('PIN updated successfully! Please login.');
            setPin('');
            setView('LOGIN');
            setMobileInput('');
            setNewPinInput('');
        } else {
            alert('New PIN must be 4 digits.');
        }
    } else {
        alert('Mobile number does not match Admin records.');
    }
  };

  return (
    <Layout title={view === 'LOGIN' ? "Staff Access" : "Reset PIN"} showBack>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        
        {view === 'LOGIN' ? (
            <>
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-bansal-blue border border-blue-100">
                        <i className="ph ph-lock-key text-3xl"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Staff Login</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter 4-digit PIN to access dashboard.</p>
                </div>

                {/* PIN Display */}
                <div className="flex gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold shadow-sm transition-all ${pin[i] ? 'border-bansal-blue text-bansal-blue bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            {pin[i] ? '•' : ''}
                        </div>
                    ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button 
                            key={num}
                            onClick={() => handleDigit(num.toString())}
                            className="h-16 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-2xl font-bold text-gray-700 active:scale-95 transition-all shadow-sm"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="h-16"></div>
                    <button 
                        onClick={() => handleDigit('0')}
                        className="h-16 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-2xl font-bold text-gray-700 active:scale-95 transition-all shadow-sm"
                    >
                        0
                    </button>
                    <button 
                        onClick={handleBackspace}
                        className="h-16 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 text-2xl text-red-600 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                    >
                        <i className="ph ph-backspace"></i>
                    </button>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={pin.length !== 4}
                    className={`w-full max-w-[300px] mt-8 font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform ${pin.length === 4 ? 'bg-bansal-blue text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    Access Dashboard
                </button>
                
                <button 
                    onClick={() => setView('FORGOT')}
                    className="mt-6 text-sm text-bansal-blue underline opacity-80"
                >
                    Forgot PIN?
                </button>
            </>
        ) : (
            <div className="w-full max-w-sm">
                 <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-gray-800">Reset Staff PIN</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter registered Admin mobile number.</p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Admin Mobile Number</label>
                        <input 
                            type="tel" 
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-bansal-blue outline-none font-bold text-lg tracking-widest"
                            placeholder="Enter mobile"
                            value={mobileInput}
                            onChange={(e) => setMobileInput(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">New 4-Digit PIN</label>
                        <input 
                            type="number" 
                            maxLength={4}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:border-bansal-blue outline-none font-bold text-lg tracking-widest"
                            placeholder="Enter new PIN"
                            value={newPinInput}
                            onChange={(e) => setNewPinInput(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleReset}
                        className="w-full bg-bansal-blue text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all mt-2"
                    >
                        Update PIN
                    </button>

                    <button 
                        onClick={() => setView('LOGIN')}
                        className="w-full text-gray-500 py-3 font-bold mt-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default StaffLogin;
