import React, { useState, useEffect } from 'react';
import { Receipt, Clock, CheckCircle, XCircle, Eye, Truck, Store } from 'lucide-react';
import { Order } from '../../types';
import { getUserOrders } from '../../services/shopData';
import { useAuth } from '../../context/AuthContext';

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let active = true;
    getUserOrders(user.id)
      .then(userOrders => { if (active) setOrders(userOrders); })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load your orders.');
      });
    return () => { active = false; };
  }, [user]);

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

  if (loadError) {
    return <p role="alert" className="text-center text-red-700">{loadError}</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-16 w-16 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-amber-900 mb-2">No orders yet</h2>
        <p className="text-amber-700">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-900 font-serif mb-2">My Orders</h1>
        <p className="text-amber-700">Track your coffee orders and view history</p>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="font-bold text-amber-900">Order #{order.id}</h3>
                  <p className="text-sm text-amber-700">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
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
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-amber-700">Items</p>
                <p className="font-medium text-amber-900">{order.items.length} items</p>
              </div>
              <div>
                <p className="text-sm text-amber-700">Payment Method</p>
                <p className="font-medium text-amber-900 capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700">Total</p>
                <p className="font-bold text-amber-900">₱{order.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700">Tip</p>
                <p className="font-bold text-amber-900">₱{order.tip?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Delivery Address:</p>
                <p className="text-blue-900">{order.deliveryAddress}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-amber-700">Order Items:</p>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-amber-50 rounded-lg p-3">
                  <div>
                    <span className="font-medium text-amber-900">{item.coffeeName}</span>
                    {item.customIngredients.length > 0 && (
                      <p className="text-sm text-amber-700">
                        + {item.customIngredients.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-700">Qty: {item.quantity}</p>
                    <p className="font-medium text-amber-900">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-amber-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg mb-6 font-mono text-sm">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-amber-900">BEAN & BREW</h4>
                  <p className="text-amber-700">Order Receipt</p>
                  <p className="text-amber-600 text-xs">Philippines</p>
                </div>
                
                <div className="space-y-1 text-amber-800">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span>#{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{selectedOrder.orderType}</span>
                  </div>
                  {selectedOrder.deliveryAddress && (
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="text-right text-xs">{selectedOrder.deliveryAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className="border-t border-amber-200 mt-4 pt-4">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="mb-3">
                      <div className="flex justify-between text-amber-800">
                        <span>{item.coffeeName} x{item.quantity}</span>
                        <span>₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.customIngredients.length > 0 && (
                        <div className="text-xs text-amber-600 ml-2">
                          + {item.customIngredients.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-amber-200 mt-4 pt-4 space-y-1 text-amber-800">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₱{(selectedOrder.total - (selectedOrder.total * 0.12) - (selectedOrder.orderType === 'delivery' ? 50 : 0) - selectedOrder.tip).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₱{(selectedOrder.total * 0.12 / 1.12).toFixed(2)}</span>
                  </div>
                  {selectedOrder.orderType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span>₱50.00</span>
                    </div>
                  )}
                  {selectedOrder.tip > 0 && (
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>₱{selectedOrder.tip.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-amber-200 mt-4 pt-4 font-bold text-amber-900">
                  <div className="flex justify-between">
                    <span>TOTAL:</span>
                    <span>₱{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;