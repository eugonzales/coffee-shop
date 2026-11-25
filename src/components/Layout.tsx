import React from 'react';
import { Coffee, LogOut, ShoppingCart, User, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Coffee className="h-10 w-10 text-amber-300 drop-shadow-lg" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-serif tracking-wide">mia.kape</h1>
                <p className="text-sm text-amber-200 font-medium">Premium Coffee Experience • Philippines</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-amber-200">Welcome back,</p>
                <p className="font-semibold text-lg">{user?.name}</p>
              </div>
              <div className="flex items-center space-x-3">
                {user?.role === 'user' && (
                  <button
                    onClick={() => onViewChange('cart')}
                    className="relative p-3 bg-amber-600/80 hover:bg-amber-700 rounded-xl transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={logout}
                  className="p-3 bg-red-600/80 hover:bg-red-700 rounded-xl transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-amber-800 to-orange-700 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {user?.role === 'admin' ? (
              <>
                <button
                  onClick={() => onViewChange('admin-dashboard')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'admin-dashboard'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onViewChange('menu-management')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'menu-management'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  Menu Management
                </button>
                <button
                  onClick={() => onViewChange('inventory')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'inventory'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => onViewChange('orders')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'orders'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => onViewChange('users')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'users'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  Users
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onViewChange('menu')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'menu'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  Menu
                </button>
                <button
                  onClick={() => onViewChange('orders')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'orders'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => onViewChange('profile')}
                  className={`px-6 py-4 font-semibold transition-all duration-200 whitespace-nowrap ${
                    currentView === 'profile'
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'text-amber-200 hover:text-white hover:bg-amber-700/50'
                  }`}
                >
                  Profile
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-800 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <Coffee className="h-8 w-8 text-amber-300" />
                <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-2xl font-serif font-bold">mia.kape</span>
            </div>
            <p className="text-amber-200 mb-4">© 2025 mia.kape Philippines. Crafted with love and premium coffee beans.</p>
            <p className="text-amber-300 text-sm">Serving the finest coffee experience across the Philippines</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;