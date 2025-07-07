import React, { useState, useEffect } from 'react';
import { Plus, Star, Coffee as CoffeeIcon, Heart, Sparkles } from 'lucide-react';
import { Coffee, Ingredient, CartItem } from '../../types';
import { getCoffees, getIngredients } from '../../utils/localStorage';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Menu: React.FC = () => {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [_, forceUpdate] = useState(0);
  
  const { addToCart } = useCart();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    setCoffees(getCoffees());
    setIngredients(getIngredients());
  }, []);

  const categories = ['all', ...Array.from(new Set(coffees.map(c => c.category)))];
  const filteredCoffees = category === 'all' ? coffees : coffees.filter(c => c.category === category);

  const handleCustomize = (coffee: Coffee) => {
    setSelectedCoffee(coffee);
    setCustomIngredients([]);
    setShowCustomizer(true);
  };

  const handleAddToCart = (coffee: Coffee, customIngredients: string[] = []) => {
    const ingredientPrices = ingredients.reduce((acc, ing) => {
      acc[ing.name] = ing.price;
      return acc;
    }, {} as Record<string, number>);

    const additionalPrice = customIngredients.reduce((sum, ing) => sum + (ingredientPrices[ing] || 0), 0);
    const totalPrice = coffee.basePrice + additionalPrice;

    const cartItem: CartItem = {
      id: `${coffee.id}-${Date.now()}`,
      coffeeId: coffee.id,
      coffeeName: coffee.name,
      basePrice: coffee.basePrice,
      customIngredients,
      totalPrice,
      quantity: 1,
    };

    addToCart(cartItem);
    setShowCustomizer(false);
    setSelectedCoffee(null);
  };

  // Toggle favorite for a coffee item
  const toggleFavorite = (coffeeId: string) => {
    console.log('toggleFavorite called for coffeeId:', coffeeId);
    console.log('Current user:', user);
    if (!user) {
      alert('You must be logged in as a user to favorite items.');
      return;
    }
    const updatedFavorites = user.favoriteItems.includes(coffeeId)
      ? user.favoriteItems.filter(id => id !== coffeeId)
      : [...user.favoriteItems, coffeeId];
    console.log('Updated favorites:', updatedFavorites);
    updateUser({
      ...user,
      favoriteItems: updatedFavorites,
    });
    forceUpdate(n => n + 1);
  };

  console.log('Menu render user:', user);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
          <h1 className="text-4xl font-bold text-amber-900 font-serif">Our Premium Coffee Menu</h1>
          <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
        </div>
        <p className="text-amber-700 text-lg">Handcrafted with the finest beans from around the world</p>
        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
              category === cat
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                : 'bg-white text-amber-700 hover:bg-amber-100 border-2 border-amber-300 shadow-md'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Coffee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCoffees.map(coffee => (
          <div key={coffee.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
            <div className="relative overflow-hidden">
              <img
                src={coffee.image}
                alt={coffee.name}
                className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {coffee.category}
              </div>
              <button
                onClick={() => toggleFavorite(coffee.id)}
                className={`absolute top-4 right-4 p-3 rounded-full border-2 shadow-md transition-colors duration-300 flex items-center justify-center z-10 ${user?.favoriteItems.includes(coffee.id) ? 'bg-red-100 border-red-400 text-red-600 hover:bg-red-200' : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50'}`}
                title={user ? (user.favoriteItems.includes(coffee.id) ? 'Remove from favorites' : 'Add to favorites') : 'Log in to favorite items'}
                aria-label={user ? (user.favoriteItems.includes(coffee.id) ? 'Remove from favorites' : 'Add to favorites') : 'Log in to favorite items'}
                disabled={!user}
              >
                <Heart
                  className="h-6 w-6"
                  fill={user?.favoriteItems.includes(coffee.id) ? 'currentColor' : 'none'}
                />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-2">{coffee.name}</h3>
              <p className="text-amber-700 mb-4 text-sm leading-relaxed">{coffee.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-amber-900">₱{coffee.basePrice.toFixed(2)}</span>
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-amber-700 font-medium">4.8</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleAddToCart(coffee)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                
                {coffee.customizable && (
                  <button
                    onClick={() => handleCustomize(coffee)}
                    className="w-full bg-white border-2 border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
                  >
                    <CoffeeIcon className="h-5 w-5" />
                    <span>Customize</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customization Modal */}
      {showCustomizer && selectedCoffee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900 mb-2">Customize Your {selectedCoffee.name}</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-6">
                {['milk', 'syrup', 'extra'].map(category => (
                  <div key={category}>
                    <h4 className="font-semibold text-amber-900 mb-3 text-lg capitalize flex items-center">
                      <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                      {category}
                    </h4>
                    <div className="space-y-3">
                      {ingredients.filter(ing => ing.category === category).map(ingredient => (
                        <label key={ingredient.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={customIngredients.includes(ingredient.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCustomIngredients([...customIngredients, ingredient.name]);
                                } else {
                                  setCustomIngredients(customIngredients.filter(ing => ing !== ingredient.name));
                                }
                              }}
                              className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-5 h-5"
                            />
                            <span className="text-amber-700 font-medium">{ingredient.name}</span>
                          </div>
                          <span className="text-amber-600 font-semibold">+₱{ingredient.price.toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-amber-200">
                <div className="flex justify-between items-center mb-6 bg-amber-50 p-4 rounded-xl">
                  <span className="font-semibold text-amber-900 text-lg">Total Price:</span>
                  <span className="text-2xl font-bold text-amber-900">
                    ₱{(selectedCoffee.basePrice + customIngredients.reduce((sum, ing) => {
                      const ingredient = ingredients.find(i => i.name === ing);
                      return sum + (ingredient?.price || 0);
                    }, 0)).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCustomizer(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddToCart(selectedCoffee, customIngredients)}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-6 rounded-xl transition-colors font-semibold shadow-lg"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;