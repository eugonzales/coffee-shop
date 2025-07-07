import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Coffee } from '../../types';
import { getCoffees, saveCoffees } from '../../utils/localStorage';

const MenuManagement: React.FC = () => {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: '',
    image: '',
    ingredients: [] as string[],
    customizable: true,
  });

  useEffect(() => {
    setCoffees(getCoffees());
  }, []);

  const categories = ['Espresso', 'Coffee', 'Latte', 'Specialty', 'Cold Brew', 'Tea'];
  const availableIngredients = ['espresso', 'milk', 'steamed milk', 'foam', 'vanilla syrup', 'caramel syrup', 'hazelnut syrup', 'whipped cream'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const coffeeData: Coffee = {
      id: editingCoffee ? editingCoffee.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      basePrice: parseFloat(formData.basePrice),
      category: formData.category,
      image: formData.image || 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
      ingredients: formData.ingredients,
      customizable: formData.customizable,
    };

    let updatedCoffees;
    if (editingCoffee) {
      updatedCoffees = coffees.map(c => c.id === editingCoffee.id ? coffeeData : c);
    } else {
      updatedCoffees = [...coffees, coffeeData];
    }

    setCoffees(updatedCoffees);
    saveCoffees(updatedCoffees);
    resetForm();
  };

  const handleEdit = (coffee: Coffee) => {
    setEditingCoffee(coffee);
    setFormData({
      name: coffee.name,
      description: coffee.description,
      basePrice: coffee.basePrice.toString(),
      category: coffee.category,
      image: coffee.image,
      ingredients: coffee.ingredients,
      customizable: coffee.customizable,
    });
    setShowForm(true);
  };

  const handleDelete = (coffeeId: string) => {
    if (window.confirm('Are you sure you want to delete this coffee?')) {
      const updatedCoffees = coffees.filter(c => c.id !== coffeeId);
      setCoffees(updatedCoffees);
      saveCoffees(updatedCoffees);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      category: '',
      image: '',
      ingredients: [],
      customizable: true,
    });
    setEditingCoffee(null);
    setShowForm(false);
  };

  const handleIngredientToggle = (ingredient: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.includes(ingredient)
        ? prev.ingredients.filter(i => i !== ingredient)
        : [...prev.ingredients, ingredient]
    }));
  };

  // Handle image file upload and convert to data URL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif mb-2">Menu Management</h1>
          <p className="text-amber-700">Add, edit, and manage your coffee menu</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Coffee</span>
        </button>
      </div>

      {/* Coffee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coffees.map(coffee => (
          <div key={coffee.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-200">
            <div className="relative">
              <img
                src={coffee.image}
                alt={coffee.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {coffee.category}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-2">{coffee.name}</h3>
              <p className="text-amber-700 mb-4">{coffee.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-amber-900">₱{coffee.basePrice.toFixed(2)}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  coffee.customizable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {coffee.customizable ? 'Customizable' : 'Fixed'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-amber-700 mb-2">Base Ingredients:</p>
                <div className="flex flex-wrap gap-1">
                  {coffee.ingredients.map(ingredient => (
                    <span key={ingredient} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(coffee)}
                  className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(coffee.id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-amber-900">
                  {editingCoffee ? 'Edit Coffee' : 'Add New Coffee'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Coffee Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-2">
                      Base Price (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded-lg border border-amber-200"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Base Ingredients
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableIngredients.map(ingredient => (
                      <label key={ingredient} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.ingredients.includes(ingredient)}
                          onChange={() => handleIngredientToggle(ingredient)}
                          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-amber-700">{ingredient}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.customizable}
                      onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-amber-700">Allow customization</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingCoffee ? 'Update' : 'Add'} Coffee</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;