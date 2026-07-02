'use client';

import { useState, useEffect } from 'react';
import { MenuItem } from '@/lib/types';
import { useCart } from '@/lib/context/CartContext';
import { validateQuantity } from '@/lib/validation';
import { X, Plus, Minus, Check } from 'lucide-react';

interface PizzaCustomizerProps {
  pizza: MenuItem;
  bases: MenuItem[];
  toppings: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function PizzaCustomizer({
  pizza,
  bases,
  toppings,
  isOpen,
  onClose,
  onSuccess
}: PizzaCustomizerProps) {
  const { addItem } = useCart();
  const [selectedBase, setSelectedBase] = useState<MenuItem | null>(null);
  const [selectedTopping, setSelectedTopping] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Set default selections when modal opens or pizza changes
  useEffect(() => {
    if (isOpen) {
      if (bases.length > 0) setSelectedBase(bases[0]);
      setSelectedTopping(null); // No topping by default
      setQuantity(1);
      setError(null);
    }
  }, [isOpen, pizza, bases]);

  if (!isOpen) return null;

  // Calculate live price
  const basePrice = selectedBase ? Number(selectedBase.price) : 0;
  const toppingPrice = selectedTopping ? Number(selectedTopping.price) : 0;
  const unitPrice = Number(pizza.price) + basePrice + toppingPrice;
  const totalPrice = unitPrice * quantity;

  const handleQuantityChange = (val: number) => {
    const nextQty = quantity + val;
    if (nextQty >= 1 && nextQty <= 10) {
      setQuantity(nextQty);
      setError(null);
    }
  };

  const handleAddToCart = () => {
    if (!selectedBase) {
      setError("Please select a crust base.");
      return;
    }

    // Run quantity validation
    const { qty, error: qtyError } = validateQuantity(quantity);
    if (qtyError || !qty) {
      setError(qtyError);
      return;
    }

    const result = addItem(selectedBase, pizza, selectedTopping, qty);
    if (result.success) {
      onSuccess(`Added ${qty} × ${pizza.name} combo to your cart!`);
      onClose();
    } else {
      setError(result.error || "Failed to add item to cart.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-black animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1F3A2E] text-white flex justify-between items-center border-b-2 border-[#C8A96A]">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide">Customize Your Pizza</h3>
            <p className="text-xs text-emerald-300">Assemble your custom pizza flavor combination</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-emerald-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Pizza Selection Summary */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-[#1F3A2E] text-lg">{pizza.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{pizza.description}</p>
            </div>
            <div className="font-serif text-xl font-bold text-[#C8A96A] bg-[#1F3A2E] px-4 py-1.5 rounded-full shadow-sm">
              ₹{Number(pizza.price).toFixed(2)}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* 1. Crust Bases */}
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              1. Select Crust Base
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bases.map((base) => {
                const isSelected = selectedBase?.id === base.id;
                return (
                  <button
                    key={base.id}
                    onClick={() => { setSelectedBase(base); setError(null); }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-[#1F3A2E] bg-emerald-50/60 ring-2 ring-[#1F3A2E]/10' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{base.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{base.description}</div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#1F3A2E] bg-gray-100 px-2.5 py-1 rounded-full">
                      +₹{Number(base.price).toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Extra Gourmet Toppings */}
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              2. Add Topping (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option to skip topping */}
              <button
                onClick={() => setSelectedTopping(null)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedTopping === null 
                    ? 'border-[#1F3A2E] bg-emerald-50/60 ring-2 ring-[#1F3A2E]/10' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedTopping === null ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTopping === null && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">No Topping</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Classic flavor without extras</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 px-2.5 py-1">
                  ₹0.00
                </span>
              </button>

              {/* Real toppings */}
              {toppings.map((topping) => {
                const isSelected = selectedTopping?.id === topping.id;
                return (
                  <button
                    key={topping.id}
                    onClick={() => { setSelectedTopping(topping); setError(null); }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-[#1F3A2E] bg-emerald-50/60 ring-2 ring-[#1F3A2E]/10' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{topping.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{topping.description}</div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#1F3A2E] bg-gray-100 px-2.5 py-1 rounded-full">
                      +₹{Number(topping.price).toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer (Checkout controls) */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <span className="text-sm font-bold text-gray-600">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-2 text-gray-600 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-1 text-base font-extrabold text-[#1F3A2E] min-w-[32px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
                className="p-2 text-gray-600 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price & Submit Action */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Price</p>
              <p className="font-serif text-2xl font-black text-[#1F3A2E]">
                ₹{totalPrice.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none bg-[#234E3C] hover:bg-[#1F3A2E] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-800/10 hover:shadow-emerald-900/20 active:scale-95"
            >
              Add to Cart 🛒
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
