import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { isSupabaseConfigured } from './lib/supabase';
import Layout from './components/Layout';
import Login from './components/Login';
import Menu from './components/user/Menu';
import Cart from './components/user/Cart';
import UserOrders from './components/user/UserOrders';
import AdminDashboard from './components/admin/AdminDashboard';
import MenuManagement from './components/admin/MenuManagement';
import Inventory from './components/admin/Inventory';
import AdminOrders from './components/admin/AdminOrders';
import UserManagement from './components/admin/UserManagement';
import HomePage from './components/HomePage';
import SupabaseSetup from './components/SupabaseSetup';

const Profile = React.lazy(() => import('./components/user/Profile'));

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading, authError } = useAuth();
  const [currentView, setCurrentView] = useState('menu');
  const [showLogin, setShowLogin] = useState(false);
  React.useEffect(() => {
    if (user) {
      setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'menu');
    } else {
      setShowLogin(false);
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
          return (
            <React.Suspense fallback={<p role="status">Loading profile…</p>}>
              <Profile />
            </React.Suspense>
          );
        case 'orders':
          return <UserOrders />;
        default:
          return <Menu />;
      }
    }
  };

  if (isLoading) {
    return <main className="p-8 text-center text-stone-600">Connecting to mia.kape…</main>;
  }

  if (authError) {
    return <main className="p-8 text-center text-red-800" role="alert">{authError}</main>;
  }

  if (new URLSearchParams(window.location.search).get('reset-password') === '1') {
    return <Login passwordRecovery />;
  }

  if (!isAuthenticated) {
    return showLogin
      ? <Login onBack={() => setShowLogin(false)} />
      : <HomePage onOrder={() => setShowLogin(true)} />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  if (!isSupabaseConfigured) return <SupabaseSetup />;

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;