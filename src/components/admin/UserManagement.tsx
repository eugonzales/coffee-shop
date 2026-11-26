import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Trash2, UserCheck, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { getUsers, sendPasswordReset, setUserActive } from '../../services/shopData';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    getUsers()
      .then(allUsers => {
        if (active) setUsers(allUsers.filter(user => user.role === 'user' && user.isActive));
      })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load customer accounts.');
      });
    return () => { active = false; };
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const disableUser = async (userId: string) => {
    if (window.confirm('Disable this customer account? They will no longer be able to sign in.')) {
      try {
        await setUserActive(userId, false);
        setUsers(current => current.filter(user => user.id !== userId));
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to disable this account.');
      }
    }
  };

  const resetUserPassword = async (email: string) => {
    if (window.confirm(`Send a password reset email to ${email}?`)) {
      try {
        await sendPasswordReset(email);
        window.alert('Password reset email sent.');
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to send the password reset email.');
      }
    }
  };

  return (
    <div className="admin-page space-y-8">
      {loadError && <p role="alert" className="text-red-700">{loadError}</p>}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
          <h1 className="text-4xl font-bold text-amber-900 font-serif">User Management</h1>
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
        </div>
        <p className="text-amber-700 text-lg">Manage customer accounts and permissions</p>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-amber-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Users</option>
              <option value="user">Regular Users</option>
            </select>
          </div>
          <div className="bg-amber-50 rounded-xl px-6 py-3 border border-amber-200">
            <span className="text-sm text-amber-700 font-medium">Total Users: </span>
            <span className="font-bold text-amber-900">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-20 w-20 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-amber-900 mb-4">No users found</h2>
            <p className="text-amber-700 text-lg">Users will appear here when they register</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="p-4 rounded-2xl bg-blue-100">
                    <UserCheck className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">{user.name}</h3>
                    <p className="text-amber-700 text-lg">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    Customer
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">User ID</p>
                  <p className="font-bold text-amber-900">{user.id}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Member Since</p>
                  <p className="font-bold text-amber-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Favorites</p>
                  <p className="font-bold text-amber-900">{user.favoriteItems.length} items</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Phone</p>
                  <p className="font-bold text-amber-900">{user.phone || 'Not provided'}</p>
                </div>
              </div>

              {user.address && (
                <div className="mb-6 p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium mb-1">Delivery Address</p>
                  <p className="text-amber-900">{user.address}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => resetUserPassword(user.email)}
                  className="px-6 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Password Reset</span>
                </button>
                
                <button
                  onClick={() => void disableUser(user.id)}
                  className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Disable Account</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Stats */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          <span>User Statistics</span>
          <Sparkles className="h-6 w-6 ml-2 text-amber-600" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">Total Users</p>
            <p className="text-3xl font-bold text-amber-900">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Active Users</p>
            <p className="text-3xl font-bold text-blue-900">{users.filter(u => u.favoriteItems.length > 0).length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <p className="text-sm text-green-700 font-medium">With Address</p>
            <p className="text-3xl font-bold text-green-900">{users.filter(u => u.address).length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <p className="text-sm text-purple-700 font-medium">New This Month</p>
            <p className="text-3xl font-bold text-purple-900">
              {users.filter(u => {
                const userDate = new Date(u.createdAt);
                const now = new Date();
                return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;