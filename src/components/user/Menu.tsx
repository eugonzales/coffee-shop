import React, { useState, useEffect } from 'react';
import { Plus, Coffee as CoffeeIcon, Heart } from 'lucide-react';
import { Coffee, IngredientOption, CartItem } from '../../types';
import { getCoffees, getIngredientOptions } from '../../services/shopData';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Menu: React.FC = () => {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [loadError, setLoadError] = useState('');
  
  const { addToCart } = useCart();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    let active = true;
    Promise.all([getCoffees(), getIngredientOptions()])
      .then(([menu, availableIngredients]) => {
        if (!active) return;
        setCoffees(menu);
        setIngredients(availableIngredients);
      })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load the menu.');
      });
    return () => { active = false; };
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
  const toggleFavorite = async (coffeeId: string) => {
    if (!user) return;
    const updatedFavorites = user.favoriteItems.includes(coffeeId)
      ? user.favoriteItems.filter(id => id !== coffeeId)
      : [...user.favoriteItems, coffeeId];
    try {
      await updateUser({ ...user, favoriteItems: updatedFavorites });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to update favorites.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <h1 className="text-4xl font-bold text-amber-900 font-serif">Coffee menu</h1>
        </div>
        <p className="text-amber-700 text-base">Simple favorites, made fresh to order.</p>
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
      {loadError && <p role="alert" className="text-red-700">{loadError}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoffees.map(coffee => (
          <div key={coffee.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
            <div className="relative overflow-hidden">
              <img
                src={coffee.image}
                alt={coffee.name}
                className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-amber-800 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                {coffee.category}
              </div>
              <button
                onClick={() => toggleFavorite(coffee.id)}
                className={`absolute top-3 right-3 p-2 rounded-full border shadow-sm transition-colors flex items-center justify-center z-10 ${user?.favoriteItems.includes(coffee.id) ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'}`}
                title={user ? (user.favoriteItems.includes(coffee.id) ? 'Remove from favorites' : 'Add to favorites') : 'Log in to favorite items'}
                aria-label={user ? (user.favoriteItems.includes(coffee.id) ? 'Remove from favorites' : 'Add to favorites') : 'Log in to favorite items'}
                disabled={!user}
              >
                <Heart
                  className="h-5 w-5"
                  fill={user?.favoriteItems.includes(coffee.id) ? 'currentColor' : 'none'}
                />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-amber-900 mb-2">{coffee.name}</h3>
              <p className="text-amber-700 mb-4 text-sm leading-relaxed">{coffee.description}</p>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-amber-900">₱{coffee.basePrice.toFixed(2)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAddToCart(coffee)}
                  className="flex-1 min-w-[8rem] bg-stone-900 hover:bg-amber-900 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
                
                {coffee.customizable && (
                  <button
                    onClick={() => handleCustomize(coffee)}
                    className="flex-1 min-w-[8rem] bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CoffeeIcon className="h-4 w-4" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[78vh] overflow-hidden shadow-lg">
            <div className="flex max-h-[78vh] flex-col p-3">
              <div className="mb-3 shrink-0">
                <h3 className="text-lg font-bold text-amber-900">Customize {selectedCoffee.name}</h3>
              </div>
              
              <div className="min-h-0 flex-1 overflow-y-auto space-y-3 pr-1">
                {['milk', 'syrup', 'extra'].map(category => (
                  <div key={category}>
                    <h4 className="font-semibold text-amber-900 mb-1 text-xs uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-1">
                      {ingredients.filter(ing => ing.category === category).map(ingredient => (
                        <label key={ingredient.id} className="flex items-center justify-between gap-3 px-2 py-1 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors cursor-pointer">
                          <div className="flex min-w-0 items-center gap-2">
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
                              className="h-4 w-4 shrink-0 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-xs text-amber-800">{ingredient.name}</span>
                          </div>
                          <span className="shrink-0 text-xs font-medium text-amber-700">+₱{ingredient.price.toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 shrink-0 border-t border-amber-200 pt-3">
                <div className="flex justify-between items-center mb-3 bg-amber-50 p-2 rounded-md">
                  <span className="font-semibold text-amber-900 text-sm">Total</span>
                  <span className="text-lg font-bold text-amber-900">
                    ₱{(selectedCoffee.basePrice + customIngredients.reduce((sum, ing) => {
                      const ingredient = ingredients.find(i => i.name === ing);
                      return sum + (ingredient?.price || 0);
                    }, 0)).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomizer(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddToCart(selectedCoffee, customIngredients)}
                    className="flex-1 bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded-md transition-colors text-sm font-semibold"
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