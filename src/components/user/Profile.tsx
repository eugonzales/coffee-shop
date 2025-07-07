import React, { useState } from 'react';
import { User, Mail, Heart, Edit2, Save, X, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCoffees } from '../../utils/localStorage';
import { validateEmail } from '../../utils/validation';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const coffees = getCoffees();
  const favoriteItems = coffees.filter(coffee => user?.favoriteItems.includes(coffee.id));

  const handleSave = () => {
    if (!user) return;

    const validationErrors: string[] = [];
    
    if (!formData.name.trim()) {
      validationErrors.push('Name is required');
    }
    
    if (!validateEmail(formData.email)) {
      validationErrors.push('Please enter a valid email address');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    updateUser({
      ...user,
      name: formData.name,
      email: formData.email,
      address: formData.address,
      phone: formData.phone,
    });
    
    setIsEditing(false);
    setErrors([]);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setErrors([]);
  };

  const toggleFavorite = (coffeeId: string) => {
    if (!user) return;

    const updatedFavorites = user.favoriteItems.includes(coffeeId)
      ? user.favoriteItems.filter(id => id !== coffeeId)
      : [...user.favoriteItems, coffeeId];

    updateUser({
      ...user,
      favoriteItems: updatedFavorites,
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-900 font-serif mb-2">My Profile</h1>
        <p className="text-amber-700 text-lg">Manage your account and preferences</p>
        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-amber-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl">
                    <User className="h-6 w-6 text-amber-600" />
                    <span className="text-amber-900 font-medium">{user?.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl">
                    <Mail className="h-6 w-6 text-amber-600" />
                    <span className="text-amber-900 font-medium">{user?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl">
                    <Phone className="h-6 w-6 text-amber-600" />
                    <span className="text-amber-900 font-medium">{user?.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Delivery Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                    rows={3}
                    placeholder="Enter your complete address for delivery orders"
                  />
                ) : (
                  <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl">
                    <MapPin className="h-6 w-6 text-amber-600 mt-1" />
                    <span className="text-amber-900 font-medium">{user?.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Member Since
                </label>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <span className="text-amber-900 font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900 mb-4">Account Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                <span className="text-amber-700 font-medium">Account Type:</span>
                <span className="font-bold capitalize bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-sm">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                <span className="text-amber-700 font-medium">Favorite Items:</span>
                <span className="font-bold text-amber-900">{user?.favoriteItems.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Items */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 mb-6">Favorite Items</h2>
        
        {favoriteItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <p className="text-amber-700 text-lg">You haven't added any favorites yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteItems.map(coffee => (
              <div key={coffee.id} className="bg-amber-50 rounded-2xl p-6 border border-amber-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-1">{coffee.name}</h4>
                    <p className="text-amber-700 font-bold">₱{coffee.basePrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;