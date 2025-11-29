import React, { useState } from 'react';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { GoogleGenAI } from "@google/genai";
import { MenuItem } from '../types';

const AdminPanel: React.FC = () => {
  const { state, updateStock, saveMenuItem, addNewMenuItem, updateAdminMobile, updatePaymentConfig } = useApp();
  
  const [activeTab, setActiveTab] = useState<'MENU' | 'SETTINGS'>('MENU');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Add Item State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Snacks');

  // Settings State
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  
  const [upiId, setUpiId] = useState(state.paymentConfig.upiId);
  const [merchantName, setMerchantName] = useState(state.paymentConfig.merchantName);

  const handleStockToggle = (itemId: string, current: boolean) => {
    updateStock(itemId, { available: !current });
  };

  const handleQtyChange = (itemId: string, qty: number) => {
    updateStock(itemId, { stockQty: qty });
  };

  const handleAddItem = () => {
      if(!newItemName || !newItemPrice) return;
      addNewMenuItem(newItemName, parseFloat(newItemPrice), newItemImage, newItemCategory);
      setShowAddModal(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemImage('');
  };

  // --- OTP Logic ---
  const handleRequestOtp = () => {
      if(mobileInput.length < 10) {
          alert("Please enter a valid mobile number");
          return;
      }
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otp);
      setOtpStep('VERIFY');
      alert(`Bansal Canteen Security: Your OTP to change admin number is ${otp}`);
  };

  const handleVerifyOtp = () => {
      if(otpInput === generatedOtp) {
          updateAdminMobile(mobileInput);
          alert("Admin Mobile Number Updated Successfully!");
          setOtpStep('REQUEST');
          setMobileInput('');
          setOtpInput('');
          setGeneratedOtp(null);
      } else {
          alert("Invalid OTP");
      }
  };

  const handleSavePayment = () => {
      updatePaymentConfig({ upiId, merchantName });
      alert("Payment Details Saved!");
  };

  // --- Gemini AI Feature ---
  const generateAIDescription = async (item: MenuItem) => {
    if(!process.env.API_KEY) {
        alert("API_KEY missing in environment variables. Cannot use AI.");
        return;
    }
    setAiLoading(true);
    setEditingItem(item.id);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, appetizing 1-sentence description for a canteen menu item called "${item.name}". No quotes. Make it sound delicious for college students.`,
        });
        
        if (response.text) {
            saveMenuItem({ ...item, description: response.text.trim() });
        }
    } catch (e) {
        console.error(e);
        alert("AI generation failed.");
    } finally {
        setAiLoading(false);
        setEditingItem(null);
    }
  };

  return (
    <Layout title="Admin Panel" showBack>
      
      {/* Modern Tabs */}
      <div className="p-4 pb-0 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex bg-slate-100 p-1.5 rounded-xl">
            <button 
                onClick={() => setActiveTab('MENU')}
                className={`flex-1 py-2.5 text-sm font-bold text-center rounded-lg transition-all duration-300 ${activeTab === 'MENU' ? 'bg-white text-bansal-blue shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <i className="ph ph-fork-knife mr-1.5 align-text-bottom"></i> Menu Manager
            </button>
            <button 
                onClick={() => setActiveTab('SETTINGS')}
                className={`flex-1 py-2.5 text-sm font-bold text-center rounded-lg transition-all duration-300 ${activeTab === 'SETTINGS' ? 'bg-white text-bansal-blue shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <i className="ph ph-sliders-horizontal mr-1.5 align-text-bottom"></i> Settings
            </button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
        
        {activeTab === 'MENU' && (
            <>
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-slate-800 text-lg">Menu Items</h3>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-bansal-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-800 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                    >
                        <i className="ph ph-plus-circle text-base"></i> Add Item
                    </button>
                </div>

                <div className="space-y-4">
                    {state.menuMaster.map(item => {
                        const stock = state.dailyInventory[item.id];
                        const isEditing = editingItem === item.id;

                        return (
                            <div key={item.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${!stock.available ? 'border-red-100 opacity-70 grayscale-[0.5]' : 'border-slate-100 hover:shadow-md'}`}>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                                                <button 
                                                    onClick={() => generateAIDescription(item)}
                                                    disabled={aiLoading}
                                                    className="text-bansal-blue hover:text-blue-600 p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                                                    title="Generate AI Description"
                                                >
                                                    <i className={`ph ph-sparkle text-sm ${aiLoading && isEditing ? 'animate-spin' : ''}`}></i>
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed pr-2 font-medium">{item.description}</p>
                                        </div>
                                        <div className="ml-2">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={stock.available}
                                                    onChange={() => handleStockToggle(item.id, stock.available)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                        <div className="flex-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Stock Qty</label>
                                            <div className="flex items-center shadow-sm rounded-lg overflow-hidden">
                                                <button 
                                                    onClick={() => handleQtyChange(item.id, Math.max(0, stock.stockQty - 5))}
                                                    className="w-10 h-10 bg-white border-r border-slate-100 hover:bg-slate-50 font-bold text-slate-600 active:bg-slate-100"
                                                >-5</button>
                                                <input 
                                                    type="number" 
                                                    value={stock.stockQty}
                                                    onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                                                    className="w-full h-10 text-center text-sm font-bold bg-white focus:outline-none text-slate-800"
                                                />
                                                <button 
                                                    onClick={() => handleQtyChange(item.id, stock.stockQty + 5)}
                                                    className="w-10 h-10 bg-white border-l border-slate-100 hover:bg-slate-50 font-bold text-slate-600 active:bg-slate-100"
                                                >+5</button>
                                            </div>
                                        </div>
                                        <div className="text-right pl-4 border-l border-slate-200">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Price</label>
                                            <div className="font-bold text-slate-900 text-xl">₹{item.basePrice}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}

        {activeTab === 'SETTINGS' && (
            <div className="space-y-6">
                
                {/* Payment Configuration */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <i className="ph ph-bank text-bansal-blue"></i>
                        </div>
                         Payment Settings
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Merchant Name</label>
                            <input 
                                type="text"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-bansal-blue focus:ring-1 focus:ring-bansal-blue outline-none transition-all"
                                value={merchantName}
                                onChange={(e) => setMerchantName(e.target.value)}
                                placeholder="e.g. Bansal Canteen"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">UPI ID</label>
                            <input 
                                type="text"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-bansal-blue focus:ring-1 focus:ring-bansal-blue outline-none transition-all"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="e.g. bansal@okhdfc"
                            />
                        </div>
                        <button 
                            onClick={handleSavePayment}
                            className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black mt-2 shadow-lg active:scale-95 transition-all"
                        >
                            Save Payment Details
                        </button>
                    </div>
                </div>

                {/* Admin Mobile Change */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <i className="ph ph-device-mobile text-bansal-blue"></i>
                        </div>
                        Admin Access
                    </h3>
                    
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-xs text-yellow-800 mb-6 flex items-start gap-2">
                        <i className="ph-fill ph-warning-circle text-lg mt-0.5"></i>
                        <span>Current Registered Admin Number: <br/><b className="text-sm">{state.adminMobile}</b></span>
                    </div>

                    {otpStep === 'REQUEST' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">New Mobile Number</label>
                                <input 
                                    type="tel"
                                    placeholder="Enter new mobile"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-bansal-blue focus:ring-1 focus:ring-bansal-blue outline-none transition-all"
                                    value={mobileInput}
                                    onChange={(e) => setMobileInput(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleRequestOtp}
                                className="w-full bg-bansal-blue text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-800 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                            >
                                Send Verification OTP
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Enter OTP</label>
                                <input 
                                    type="text"
                                    placeholder="----"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold tracking-[0.5em] text-center focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleVerifyOtp}
                                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 active:scale-95 transition-all"
                            >
                                Verify & Update
                            </button>
                            <button 
                                onClick={() => setOtpStep('REQUEST')}
                                className="w-full text-slate-500 py-2 text-xs hover:underline font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* Add Item Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 transition-all">
                  <div className="bg-bansal-blue p-5 text-white flex justify-between items-center">
                      <h3 className="font-bold text-lg">Add New Item</h3>
                      <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                          <i className="ph ph-x text-xl font-bold"></i>
                      </button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Item Name</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-bansal-blue outline-none transition-all font-medium" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="e.g. Veg Burger"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Price (₹)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-bansal-blue outline-none transition-all font-medium" 
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            placeholder="e.g. 50"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Image URL</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-bansal-blue outline-none transition-all font-medium text-xs" 
                            placeholder="https://..."
                            value={newItemImage}
                            onChange={(e) => setNewItemImage(e.target.value)}
                          />
                      </div>
                      <button 
                        onClick={handleAddItem}
                        className="w-full bg-bansal-blue text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all mt-2"
                      >
                          Save to Menu
                      </button>
                  </div>
              </div>
          </div>
      )}

    </Layout>
  );
};

export default AdminPanel;