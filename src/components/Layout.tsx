import React, { useState } from 'react';
import { Coffee, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './AppTheme.css';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [logoutError, setLogoutError] = useState('');
  const navigation = user?.role === 'admin'
    ? [
      { view: 'admin-dashboard', label: 'Dashboard' },
      { view: 'menu-management', label: 'Menu' },
      { view: 'inventory', label: 'Inventory' },
      { view: 'orders', label: 'Orders' },
      { view: 'users', label: 'Customers' },
    ]
    : [
      { view: 'menu', label: 'Menu' },
      { view: 'orders', label: 'My orders' },
      { view: 'profile', label: 'Profile' },
    ];

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <a className="app-brand" href="/" aria-label="mia.kape home">
            <span className="app-brand-mark"><Coffee size={19} aria-hidden="true" /></span>
            <span>mia.kape</span>
          </a>
          <div className="app-account">
            <div className="app-welcome">
              <span>{user?.role === 'admin' ? 'Shop dashboard' : 'Welcome back'}</span>
              <strong>{user?.name}</strong>
            </div>
            <div className="app-header-actions">
              {user?.role === 'user' && (
                <button
                  type="button"
                  onClick={() => onViewChange('cart')}
                  className="app-icon-button app-cart-button"
                  aria-label={`Shopping cart, ${getTotalItems()} items`}
                >
                  <ShoppingCart size={19} aria-hidden="true" />
                  {getTotalItems() > 0 && <span className="app-cart-count">{getTotalItems()}</span>}
                </button>
              )}
              <button type="button" onClick={handleLogout} className="app-logout" aria-label="Sign out">
                <LogOut size={16} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav" aria-label="Main navigation">
        <div className="app-nav-inner">
          {navigation.map(item => (
            <button
              type="button"
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`app-nav-link${currentView === item.view ? ' is-active' : ''}`}
              aria-current={currentView === item.view ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {logoutError && <p role="alert" className="mb-4 text-sm text-red-700">{logoutError}</p>}
        {children}
      </main>

      <footer className="app-footer">
        <a className="app-brand app-footer-brand" href="/" aria-label="mia.kape home">
          <span className="app-brand-mark"><Coffee size={17} aria-hidden="true" /></span>
          <span>mia.kape</span>
        </a>
        <p>Good coffee. Good company. See you soon.</p>
        <span className="app-footer-tagline">Made with care in the Philippines</span>
      </footer>
    </div>
  );
};

export default Layout;
