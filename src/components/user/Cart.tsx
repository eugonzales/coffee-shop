import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, QrCode, Sparkles, MapPin, Truck, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { placeOrder } from '../../services/shopData';

interface CartProps {
  onViewChange: (view: string) => void;
}

const Cart: React.FC<CartProps> = ({ onViewChange }) => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tip, setTip] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  // Auto-populate delivery address from user profile
  useEffect(() => {
    if (user?.address && orderType === 'delivery') {
      setDeliveryAddress(user.address);
    }
  }, [user?.address, orderType]);

  const deliveryFee = orderType === 'delivery' ? 50 : 0;
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee + tip;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) {
      setCheckoutError('Sign in before placing an order.');
      return;
    }

    setCheckoutError('');
    try {
      const order = await placeOrder(
        items,
        paymentMethod,
        orderType,
        orderType === 'delivery' ? deliveryAddress : null,
        tip,
      );
      setCurrentOrder(order);
      clearCart();
      setShowCheckout(false);
      setShowReceipt(true);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to place your order.');
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    onViewChange('orders');
  };

  // Auto-redirect to orders after payment/receipt
  useEffect(() => {
    if (showReceipt) {
      const timer = setTimeout(() => {
        onViewChange('orders');
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [showReceipt, onViewChange]);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative inline-block mb-6">
          <ShoppingBag className="h-24 w-24 text-amber-400 mx-auto" />
          <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-amber-900 mb-4">Your cart is empty</h2>
        <p className="text-amber-700 text-lg">Add some delicious coffee to get started!</p>
        <div className="mt-6 w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-4xl font-bold text-amber-900 font-serif">Your Cart</h1>
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
        </div>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 flex items-center space-x-2 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
        >
          <Trash2 className="h-5 w-5" />
          <span className="font-medium">Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-3xl shadow-xl p-6 border border-amber-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">{item.coffeeName}</h3>
                  <p className="text-amber-700 text-sm mb-2">Base Price: ₱{item.basePrice.toFixed(2)}</p>
                  
                  {item.customIngredients.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-xl">
                      <p className="text-sm text-amber-700 font-medium mb-1">Customizations:</p>
                      <p className="text-sm text-amber-600">{item.customIngredients.join(', ')}</p>
                    </div>
                  )}
                  
                  <p className="text-xl font-bold text-amber-900 mt-3">
                    ₱{item.totalPrice.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 bg-amber-50 rounded-xl p-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 bg-amber-200 hover:bg-amber-300 rounded-full text-amber-700 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 bg-amber-200 hover:bg-amber-300 rounded-full text-amber-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        {checkoutError && <p role="alert" className="text-red-700">{checkoutError}</p>}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200 h-fit">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            <span>Order Summary</span>
            <Sparkles className="h-6 w-6 ml-2 text-amber-600" />
          </h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-lg">
              <span className="text-amber-700">Subtotal:</span>
              <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-lg">
                <span className="text-amber-700">Delivery Fee:</span>
                <span className="font-semibold">₱{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            {tip > 0 && (
              <div className="flex justify-between text-lg">
                <span className="text-amber-700">Tip:</span>
                <span className="font-semibold">₱{tip.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t-2 border-amber-200 pt-4">
              <div className="flex justify-between text-xl">
                <span className="font-bold text-amber-900">Total:</span>
                <span className="font-bold text-amber-900">₱{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
          >
            <CreditCard className="h-6 w-6" />
            <span>Proceed to Checkout</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">Checkout</h3>
            
            <div className="space-y-6">
              {/* Order Type */}
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      orderType === 'pickup'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <Store className="h-6 w-6 mx-auto mb-2" />
                    <span className="font-medium">Pickup</span>
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      orderType === 'delivery'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <Truck className="h-6 w-6 mx-auto mb-2" />
                    <span className="font-medium">Delivery</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              {orderType === 'delivery' && (
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-3">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-amber-500" />
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white resize-none"
                      rows={3}
                      placeholder="Enter your complete delivery address"
                      required
                    />
                  </div>
                  {user?.address && deliveryAddress === user.address && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Using address from your profile
                    </p>
                  )}
                  {!user?.address && (
                    <p className="text-sm text-amber-600 mt-2">
                      💡 Add your address in your profile for faster checkout next time!
                    </p>
                  )}
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                </select>
              </div>

              {/* Tip */}
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Add Tip (Optional)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0, 20, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTip(amount)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        tip === amount
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      {amount === 0 ? 'No Tip' : `₱${amount}`}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={tip}
                  onChange={(e) => setTip(Number(e.target.value))}
                  className="w-full p-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Custom tip amount"
                  min="0"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-amber-50 p-6 rounded-xl">
                <h4 className="font-semibold text-amber-900 mb-4">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-amber-700">
                      <span>{item.coffeeName} x{item.quantity}</span>
                      <span>₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-amber-200 pt-2 space-y-1">
                    <div className="flex justify-between text-amber-700">
                      <span>Subtotal:</span>
                      <span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>Delivery Fee:</span>
                        <span>₱{deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {tip > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>Tip:</span>
                        <span>₱{tip.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-amber-200 mt-4 pt-4 flex justify-between font-bold text-amber-900">
                  <span>Total:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={orderType === 'delivery' && !deliveryAddress.trim()}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-6 rounded-xl transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && currentOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <QrCode className="h-20 w-20 text-amber-600 mx-auto" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Order Placed Successfully!</h3>
              <p className="text-amber-700">
                {currentOrder.orderType === 'pickup' 
                  ? 'Show this receipt at the counter' 
                  : 'Your order will be delivered soon'
                }
              </p>
            </div>

            <div className="bg-amber-50 p-6 rounded-xl mb-8 font-mono text-sm">
              <div className="text-center mb-6">
                <h4 className="font-bold text-amber-900 text-lg">BEAN & BREW</h4>
                <p className="text-amber-700">Digital Receipt</p>
                <p className="text-amber-600 text-xs">Philippines</p>
              </div>
              
              <div className="space-y-2 text-amber-800">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span>#{currentOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(currentOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{currentOrder.orderType}</span>
                </div>
                {currentOrder.deliveryAddress && (
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="text-right text-xs">{currentOrder.deliveryAddress}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="capitalize">{currentOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-amber-200 mt-4 pt-4">
                {currentOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-amber-800 mb-1">
                    <span>{item.coffeeName} x{item.quantity}</span>
                    <span>₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-amber-200 mt-4 pt-4 space-y-1 text-amber-800">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₱{(currentOrder.total - (currentOrder.total * 0.12) - (currentOrder.orderType === 'delivery' ? 50 : 0) - currentOrder.tip).toFixed(2)}</span>
                </div>
                {currentOrder.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>₱{currentOrder.tip.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-amber-200 mt-4 pt-4 font-bold text-amber-900">
                <div className="flex justify-between">
                  <span>TOTAL:</span>
                  <span>₱{currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={closeReceipt}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-4 px-6 rounded-xl transition-colors font-semibold"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;