import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import StudentMenu from './screens/StudentMenu';
import Cart from './screens/Cart';
import OrderTracking from './screens/OrderTracking';
import StaffLogin from './screens/StaffLogin';
import StaffDashboard from './screens/StaffDashboard';
import AdminPanel from './screens/AdminPanel';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StudentMenu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;