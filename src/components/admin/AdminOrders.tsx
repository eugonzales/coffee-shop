import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, Search, Filter, Truck, Store, Sparkles } from 'lucide-react';
import { Order, User } from '../../types';
import { getOrders, saveOrders, getUsers } from '../../utils/localStorage';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setOrders(getOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setUsers(getUsers());
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.coffeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const updateOrderStatus = (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
          <h1 className="text-4xl font-bold text-amber-900 font-serif">Order Management</h1>
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
        </div>
        <p className="text-amber-700 text-lg">Track and manage customer orders</p>
        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-amber-500" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-amber-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="bg-amber-50 rounded-xl px-6 py-3 border border-amber-200">
            <span className="text-sm text-amber-700 font-medium">Total Orders: </span>
            <span className="font-bold text-amber-900">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="h-20 w-20 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-amber-900 mb-4">No orders found</h2>
            <p className="text-amber-700 text-lg">Orders will appear here when customers place them</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">Order #{order.id}</h3>
                    <p className="text-amber-700">
                      {getUserName(order.userId)} • {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.orderType === 'delivery' ? (
                      <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Truck className="h-4 w-4" />
                        <span>Delivery</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Store className="h-4 w-4" />
                        <span>Pickup</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Items</p>
                  <p className="font-bold text-amber-900">{order.items.length} items</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Payment Method</p>
                  <p className="font-bold text-amber-900 capitalize">{order.paymentMethod}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Total</p>
                  <p className="font-bold text-amber-900">₱{order.total.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Tip</p>
                  <p className="font-bold text-amber-900">₱{order.tip?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {order.deliveryAddress && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-1">Delivery Address:</p>
                  <p className="text-blue-900">{order.deliveryAddress}</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <p className="text-sm text-amber-700 font-medium">Order Items:</p>
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-amber-50 rounded-xl p-4">
                    <div>
                      <span className="font-semibold text-amber-900">{item.coffeeName}</span>
                      {item.customIngredients.length > 0 && (
                        <p className="text-sm text-amber-700">
                          + {item.customIngredients.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-amber-700">Qty: {item.quantity}</p>
                      <p className="font-semibold text-amber-900">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Actions */}
              <div className="flex space-x-3">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-semibold"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-semibold"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                {order.status === 'completed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'pending')}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Mark Pending</span>
                  </button>
                )}
                {order.status === 'cancelled' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'pending')}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-amber-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-amber-600 hover:text-amber-700 p-2 hover:bg-amber-50 rounded-full transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-amber-700 font-medium">Order ID:</p>
                      <p className="font-bold text-amber-900">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-amber-700 font-medium">Customer:</p>
                      <p className="font-bold text-amber-900">{getUserName(selectedOrder.userId)}</p>
                    </div>
                    <div>
                      <p className="text-amber-700 font-medium">Date:</p>
                      <p className="font-bold text-amber-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-amber-700 font-medium">Time:</p>
                      <p className="font-bold text-amber-900">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-amber-700 font-medium">Status:</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-amber-700 font-medium">Payment:</p>
                      <p className="font-bold text-amber-900 capitalize">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-amber-700 font-medium">Order Type:</p>
                      <div className="flex items-center space-x-1">
                        {selectedOrder.orderType === 'delivery' ? (
                          <>
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-blue-900">Delivery</span>
                          </>
                        ) : (
                          <>
                            <Store className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-900">Pickup</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-amber-700 font-medium">Tip:</p>
                      <p className="font-bold text-amber-900">₱{selectedOrder.tip?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <p className="text-blue-700 font-medium mb-2">Delivery Address:</p>
                    <p className="text-blue-900">{selectedOrder.deliveryAddress}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-amber-900 mb-4 text-lg">Order Items:</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-amber-50 rounded-xl p-4">
                        <div>
                          <span className="font-semibold text-amber-900">{item.coffeeName}</span>
                          {item.customIngredients.length > 0 && (
                            <p className="text-sm text-amber-700">
                              + {item.customIngredients.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-amber-700">Qty: {item.quantity}</p>
                          <p className="font-semibold text-amber-900">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-100 p-6 rounded-xl">
                  <div className="flex justify-between items-center font-bold text-amber-900 text-lg">
                    <span>Total:</span>
                    <span>₱{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;