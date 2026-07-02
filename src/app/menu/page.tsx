'use client';

import { useEffect, useState } from 'react';
import { getMenuItems } from '@/lib/services';
import { MenuItem } from '@/lib/types';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import { Search, Flame, Pizza, Star } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';

// Static fallback items in case Supabase is not connected
const FALLBACK_MENUS: MenuItem[] = [
  // Bases
  { id: 'base_1', category: 'base', name: 'Thin Crust', price: 149, description: 'Light, crispy, and baked to perfection' },
  { id: 'base_2', category: 'base', name: 'Thick Crust', price: 179, description: 'Soft, fluffy, and thick dough' },
  { id: 'base_3', category: 'base', name: 'Cheese Burst', price: 229, description: 'Liquid cheese flowing inside the crust' },
  { id: 'base_4', category: 'base', name: 'Whole Wheat', price: 169, description: 'Healthy wheat base with a rustic bite' },
  { id: 'base_5', category: 'base', name: 'Multigrain', price: 199, description: 'Fibre-rich, multi-grain wholesome base' },
  // Pizzas
  { id: 'pizza_1', category: 'pizza', name: 'Margherita', price: 299, description: 'Classic tomato sauce, fresh mozzarella, and basil' },
  { id: 'pizza_2', category: 'pizza', name: 'Chicago Deep Dish', price: 359, description: 'Indulgent deep crust layered with chunky sauce and cheese' },
  { id: 'pizza_3', category: 'pizza', name: 'Greek Mediterranean', price: 339, description: 'Topped with feta, olives, red onions, and bell peppers' },
  { id: 'pizza_4', category: 'pizza', name: 'Farm House', price: 319, description: 'Loaded with capsicum, onion, mushroom, and tomato' },
  { id: 'pizza_5', category: 'pizza', name: 'Pepperoni Classic', price: 379, description: 'Crispy pepperoni slices with premium mozzarella' },
  { id: 'pizza_6', category: 'pizza', name: 'BBQ Chicken', price: 369, description: 'Smoky sweet BBQ chicken with red onions' },
  { id: 'pizza_7', category: 'pizza', name: 'Paneer Tikka', price: 329, description: 'Indian fusion pizza with spiced paneer, onions, and capsicum' },
  { id: 'pizza_8', category: 'pizza', name: 'California Veggie', price: 309, description: 'Garden fresh broccoli, corn, zucchini, and olives' },
  // Toppings
  { id: 'topping_1', category: 'topping', name: 'Black Olives', price: 39, description: 'Sliced Spanish black olives' },
  { id: 'topping_2', category: 'topping', name: 'Extra Cheese', price: 59, description: 'Gooey stringy mozzarella cheese' },
  { id: 'topping_3', category: 'topping', name: 'Mushrooms', price: 49, description: 'Freshly sliced button mushrooms' },
  { id: 'topping_4', category: 'topping', name: 'Green Peppers', price: 39, description: 'Crisp green bell pepper slices' },
  { id: 'topping_5', category: 'topping', name: 'Jalapenos', price: 39, description: 'Pickled spicy jalapeno peppers' },
  { id: 'topping_6', category: 'topping', name: 'Sun-Dried Tomatoes', price: 59, description: 'Rich sweet sun-dried tomatoes' },
  { id: 'topping_7', category: 'topping', name: 'Caramelised Onions', price: 49, description: 'Slow cooked sweet brown onions' },
  { id: 'topping_8', category: 'topping', name: 'Sweet Corn', price: 39, description: 'Juicy sweet American corn kernels' },
  { id: 'topping_9', category: 'topping', name: 'Roasted Garlic', price: 49, description: 'Soft aromatic roasted garlic cloves' },
  { id: 'topping_10', category: 'topping', name: 'Peri-Peri Drizzle', price: 69, description: 'Spicy peri-peri mayo drizzle across the top' }
];

export default function MenuPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pizzas, setPizzas] = useState<MenuItem[]>([]);
  const [bases, setBases] = useState<MenuItem[]>([]);
  const [toppings, setToppings] = useState<MenuItem[]>([]);

  const [selectedPizza, setSelectedPizza] = useState<MenuItem | null>(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getMenuItems();
        if (data && data.length > 0) {
          setPizzas(data.filter(item => item.category === 'pizza'));
          setBases(data.filter(item => item.category === 'base'));
          setToppings(data.filter(item => item.category === 'topping'));
        } else {
          // If empty, load fallbacks
          loadFallbacks();
        }
      } catch (err) {
        console.warn('Failed to load menu from Supabase, loading fallback static menus:', err);
        loadFallbacks();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function loadFallbacks() {
    setPizzas(FALLBACK_MENUS.filter(item => item.category === 'pizza'));
    setBases(FALLBACK_MENUS.filter(item => item.category === 'base'));
    setToppings(FALLBACK_MENUS.filter(item => item.category === 'topping'));
    setIsFallback(true);
  }

  const handlePizzaClick = (pizza: MenuItem) => {
    setSelectedPizza(pizza);
    setCustomizerOpen(true);
  };

  const filteredPizzas = pizzas.filter(pizza =>
    pizza.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="text-center sm:text-left mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1F3A2E]">
          Artisanal Pizzas
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Click any flavor to customize its base, toppings, and quantity.
        </p>
        
        {isFallback && (
          <div className="mt-4 inline-block bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800 font-semibold">
            ⚠️ Note: Running in offline demo mode. Supabase environment variables not detected.
          </div>
        )}
      </div>

      {/* Search Filter */}
      <div className="mb-10 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pizza flavors (e.g. Margherita)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E0D8] rounded-xl focus:border-[#C8A96A] focus:outline-none focus:ring-3 focus:ring-[#C8A96A]/20 transition-all text-[#2B2B2B] text-sm"
          />
        </div>
      </div>

      {/* Pizzas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="w-full h-40 bg-gray-100 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-100 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPizzas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPizzas.map((pizza) => (
            <div
              key={pizza.id}
              className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-800/30 transition-all group"
            >
              {/* Image illustration (Beautiful custom SVG based on category) */}
              <div className="h-40 bg-[#1F3A2E]/5 border-b border-gray-100 flex items-center justify-center relative overflow-hidden text-5xl">
                <span className="group-hover:scale-110 transition-transform duration-300">🍕</span>
                {pizza.price > 350 && (
                  <span className="absolute top-3 right-3 bg-[#1F3A2E] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Premium
                  </span>
                )}
              </div>

              {/* Pizza Info */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F3A2E] group-hover:text-[#C8A96A] transition-colors">
                    {pizza.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed min-h-[36px]">
                    {pizza.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Starts at</span>
                    <span className="font-serif text-lg font-extrabold text-[#1F3A2E]">
                      ₹{Number(pizza.price).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePizzaClick(pizza)}
                    className="bg-[#234E3C] hover:bg-[#1F3A2E] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                  >
                    Select & Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E5E0D8] rounded-2xl p-8 max-w-md mx-auto">
          <Pizza className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No Pizza Flavors Found</h3>
          <p className="text-sm text-gray-500 mt-1">
            We couldn't find any pizza matching "{searchQuery}". Try searching for something else.
          </p>
        </div>
      )}

      {/* Customize Modal */}
      {selectedPizza && (
        <PizzaCustomizer
          pizza={selectedPizza}
          bases={bases}
          toppings={toppings}
          isOpen={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}
    </div>
  );
}
