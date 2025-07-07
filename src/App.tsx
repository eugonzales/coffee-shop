import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { initializeData } from './utils/localStorage';
import Layout from './components/Layout';
import Login from './components/Login';
import Menu from './components/user/Menu';
import Cart from './components/user/Cart';
import Profile from './components/user/Profile';
import UserOrders from './components/user/UserOrders';
import AdminDashboard from './components/admin/AdminDashboard';
import MenuManagement from './components/admin/MenuManagement';
import Inventory from './components/admin/Inventory';
import AdminOrders from './components/admin/AdminOrders';
import UserManagement from './components/admin/UserManagement';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState('menu');

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (user) {
      setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'menu');
    }
  }, [user]);

  const renderContent = () => {
    if (user?.role === 'admin') {
      switch (currentView) {
        case 'admin-dashboard':
          return <AdminDashboard onViewChange={setCurrentView} />;
        case 'menu-management':
          return <MenuManagement />;
        case 'inventory':
          return <Inventory />;
        case 'orders':
          return <AdminOrders />;
        case 'users':
          return <UserManagement />;
        default:
          return <AdminDashboard onViewChange={setCurrentView} />;
      }
    } else {
      switch (currentView) {
        case 'menu':
          return <Menu />;
        case 'cart':
          return <Cart onViewChange={setCurrentView} />;
        case 'profile':
          return <Profile />;
        case 'orders':
          return <UserOrders />;
        default:
          return <Menu />;
      }
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;