import React, { useState, useEffect } from 'react';
import { Plus, Edit2, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { Ingredient } from '../../types';
import { getIngredients, saveIngredients } from '../../utils/localStorage';

const Inventory: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    setIngredients(getIngredients());
  }, []);

  const categories = ['all', 'milk', 'syrup', 'extra'];
  const filteredIngredients = category === 'all' 
    ? ingredients 
    : ingredients.filter(ing => ing.category === category);

  const lowStockItems = ingredients.filter(ing => ing.stock <= ing.lowStockThreshold);

  const handleRestock = () => {
    if (!selectedIngredient || !restockAmount) return;

    const amount = parseInt(restockAmount);
    if (amount <= 0) return;

    const updatedIngredients = ingredients.map(ing =>
      ing.id === selectedIngredient.id
        ? { ...ing, stock: ing.stock + amount }
        : ing
    );

    setIngredients(updatedIngredients);
    saveIngredients(updatedIngredients);
    setShowRestockModal(false);
    setSelectedIngredient(null);
    setRestockAmount('');
  };

  const updateLowStockThreshold = (ingredientId: string, newThreshold: number) => {
    const updatedIngredients = ingredients.map(ing =>
      ing.id === ingredientId
        ? { ...ing, lowStockThreshold: newThreshold }
        : ing
    );

    setIngredients(updatedIngredients);
    saveIngredients(updatedIngredients);
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.stock <= ingredient.lowStockThreshold) {
      return { color: 'bg-red-100 text-red-800', label: 'Low Stock' };
    } else if (ingredient.stock <= ingredient.lowStockThreshold * 2) {
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Stock' };
    } else {
      return { color: 'bg-green-100 text-green-800', label: 'In Stock' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif mb-2">Inventory Management</h1>
          <p className="text-amber-700">Monitor and manage ingredient stock levels</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg px-4 py-2 border border-amber-200">
            <span className="text-sm text-amber-700">Low Stock Alerts: </span>
            <span className="font-bold text-red-600">{lowStockItems.length}</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Low Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map(ingredient => (
              <div key={ingredient.id} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-red-900">{ingredient.name}</h3>
                  <span className="text-sm text-red-700 capitalize">{ingredient.category}</span>
                </div>
                <div className="text-sm text-red-700">
                  <p>Current Stock: <span className="font-bold">{ingredient.stock}</span></p>
                  <p>Minimum: <span className="font-bold">{ingredient.lowStockThreshold}</span></p>
                </div>
                <button
                  onClick={() => {
                    setSelectedIngredient(ingredient);
                    setShowRestockModal(true);
                  }}
                  className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Restock Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              category === cat
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-300'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIngredients.map(ingredient => {
          const status = getStockStatus(ingredient);
          return (
            <div key={ingredient.id} className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-amber-600" />
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">{ingredient.name}</h3>
                    <p className="text-sm text-amber-700 capitalize">{ingredient.category}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-amber-700">Current Stock:</span>
                  <span className="font-bold text-amber-900">{ingredient.stock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-700">Unit Price:</span>
                  <span className="font-bold text-amber-900">₱{ingredient.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-700">Low Stock Alert:</span>
                  <input
                    type="number"
                    value={ingredient.lowStockThreshold}
                    onChange={(e) => updateLowStockThreshold(ingredient.id, parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border border-amber-300 rounded text-center text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedIngredient(ingredient);
                      setShowRestockModal(true);
                    }}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Restock</span>
                  </button>
                </div>
              </div>

              {/* Stock Level Indicator */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-amber-700 mb-1">
                  <span>Stock Level</span>
                  <span>{Math.round((ingredient.stock / (ingredient.lowStockThreshold * 3)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      ingredient.stock <= ingredient.lowStockThreshold ? 'bg-red-500' :
                      ingredient.stock <= ingredient.lowStockThreshold * 2 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (ingredient.stock / (ingredient.lowStockThreshold * 3)) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock Modal */}
      {showRestockModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-amber-900 mb-4">Restock {selectedIngredient.name}</h3>
            
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-700">Current Stock:</span>
                  <span className="font-bold text-amber-900">{selectedIngredient.stock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-700">Low Stock Threshold:</span>
                  <span className="font-bold text-amber-900">{selectedIngredient.lowStockThreshold}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Restock Amount
                </label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter amount to add"
                  min="1"
                />
              </div>

              {restockAmount && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">
                    New stock level will be: <span className="font-bold">
                      {selectedIngredient.stock + parseInt(restockAmount || '0')}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRestockModal(false);
                  setSelectedIngredient(null);
                  setRestockAmount('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={!restockAmount || parseInt(restockAmount) <= 0}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;