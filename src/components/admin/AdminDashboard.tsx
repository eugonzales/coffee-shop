import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Users, Coffee, AlertTriangle, DollarSign, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Order, Ingredient } from '../../types';
import { getAdminOrders, getUsers, getCoffees, getIngredients } from '../../services/shopData';

interface AdminDashboardProps {
  onViewChange: (view: string) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewChange }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Ingredient[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getAdminOrders(), getUsers(), getCoffees(), getIngredients()])
      .then(([orders, users, coffees, ingredients]) => {
        if (!active) return;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const lowStock = ingredients.filter(ing => ing.stock <= ing.lowStockThreshold);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalUsers: users.filter(user => user.role === 'user' && user.isActive).length,
          totalMenuItems: coffees.length,
          pendingOrders,
          lowStockItems: lowStock.length,
        });
        setRecentOrders(orders.slice(0, 10));
        setLowStockItems(lowStock);
      })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard data.');
      });
    return () => { active = false; };
  }, []);

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700 mb-1">{title}</p>
          <p className="text-3xl font-bold text-amber-900">{value}</p>
          {subtitle && <p className="text-xs text-amber-600 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${color} relative`}>
          <Icon className="h-8 w-8 text-white" />
          <Sparkles className="h-4 w-4 text-white/80 absolute -top-1 -right-1 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
          <h1 className="text-4xl font-bold text-amber-900 font-serif">Admin Dashboard</h1>
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
        </div>
        <p className="text-amber-700 text-lg">Manage your coffee shop operations</p>
        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
      </div>

      {loadError && <p role="alert" className="text-red-700">{loadError}</p>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="All time"
        />
        <StatCard
          title="Total Revenue"
          value={`₱${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle="All time"
        />
        <StatCard
          title="Active Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="Registered customers"
        />
        <StatCard
          title="Menu Items"
          value={stats.totalMenuItems}
          icon={Coffee}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          subtitle="Active items"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={TrendingUp}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="Awaiting completion"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="bg-gradient-to-br from-red-500 to-red-600"
          subtitle="Items need restocking"
        />
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            <span>Recent Orders</span>
            <Sparkles className="h-6 w-6 ml-2 text-amber-600" />
          </h2>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-amber-700 text-center py-8">No orders yet</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                  <div>
                    <p className="font-semibold text-amber-900">Order #{order.id}</p>
                    <p className="text-sm text-amber-700">
                      {new Date(order.createdAt).toLocaleDateString()} - {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-900">₱{order.total.toFixed(2)}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="h-6 w-6 ml-2 text-red-600" />
          </h2>
          <div className="space-y-4">
            {lowStockItems.length === 0 ? (
              <p className="text-amber-700 text-center py-8">All items are well stocked</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div>
                    <p className="font-semibold text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">Category: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-900">{item.stock} left</p>
                    <p className="text-xs text-red-700">Min: {item.lowStockThreshold}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          <span>Quick Actions</span>
          <Sparkles className="h-6 w-6 ml-2 text-amber-600" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button 
            onClick={() => onViewChange('orders')}
            className="p-6 bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 rounded-2xl transition-all duration-300 text-left transform hover:scale-105 shadow-lg"
          >
            <ShoppingBag className="h-10 w-10 text-amber-600 mb-3" />
            <h3 className="font-semibold text-amber-900 mb-1">View All Orders</h3>
            <p className="text-sm text-amber-700">Manage order status</p>
          </button>
          <button 
            onClick={() => onViewChange('menu-management')}
            className="p-6 bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 rounded-2xl transition-all duration-300 text-left transform hover:scale-105 shadow-lg"
          >
            <Coffee className="h-10 w-10 text-amber-600 mb-3" />
            <h3 className="font-semibold text-amber-900 mb-1">Add Menu Item</h3>
            <p className="text-sm text-amber-700">Create new coffee</p>
          </button>
          <button 
            onClick={() => onViewChange('inventory')}
            className="p-6 bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 rounded-2xl transition-all duration-300 text-left transform hover:scale-105 shadow-lg"
          >
            <AlertTriangle className="h-10 w-10 text-amber-600 mb-3" />
            <h3 className="font-semibold text-amber-900 mb-1">Restock Items</h3>
            <p className="text-sm text-amber-700">Update inventory</p>
          </button>
          <button 
            onClick={() => onViewChange('users')}
            className="p-6 bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 rounded-2xl transition-all duration-300 text-left transform hover:scale-105 shadow-lg"
          >
            <Users className="h-10 w-10 text-amber-600 mb-3" />
            <h3 className="font-semibold text-amber-900 mb-1">Manage Users</h3>
            <p className="text-sm text-amber-700">View user accounts</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;