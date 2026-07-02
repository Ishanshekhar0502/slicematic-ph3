'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, CartItem, BillSummary } from '../types';
import { computeBillForCart, MAX_ORDER_QTY } from '../pricing';

interface CartContextType {
  cart: CartItem[];
  addItem: (base: MenuItem, pizza: MenuItem, topping: MenuItem | null, qty: number) => { success: boolean; error?: string };
  removeItem: (index: number) => void;
  updateQuantity: (index: number, qty: number) => { success: boolean; error?: string };
  clearCart: () => void;
  bill: BillSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('slicematic_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('slicematic_cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addItem = (base: MenuItem, pizza: MenuItem, topping: MenuItem | null, qty: number) => {
    // Check total quantity constraint
    const currentTotal = cart.reduce((sum, item) => sum + item.qty, 0);
    if (currentTotal + qty > MAX_ORDER_QTY) {
      const remaining = MAX_ORDER_QTY - currentTotal;
      return {
        success: false,
        error: `Your cart already has ${currentTotal} pizza(s). You can add at most ${remaining} more (order cap is ${MAX_ORDER_QTY}).`
      };
    }

    // Check if item already exists in cart with same base, pizza, and topping
    const existingIndex = cart.findIndex(
      (item) =>
        item.base.id === base.id &&
        item.pizza.id === pizza.id &&
        ((!item.topping && !topping) || (item.topping?.id === topping?.id))
    );

    if (existingIndex !== -1) {
      const newCart = [...cart];
      newCart[existingIndex].qty += qty;
      setCart(newCart);
    } else {
      setCart([...cart, { base, pizza, topping, qty }]);
    }

    return { success: true };
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateQuantity = (index: number, newQty: number) => {
    const currentTotalWithoutItem = cart.reduce((sum, item, idx) => (idx === index ? sum : sum + item.qty), 0);
    
    if (currentTotalWithoutItem + newQty > MAX_ORDER_QTY) {
      const remaining = MAX_ORDER_QTY - currentTotalWithoutItem;
      return {
        success: false,
        error: `Updating quantity would exceed order cap. You can add at most ${remaining} more (order cap is ${MAX_ORDER_QTY}).`
      };
    }

    const newCart = [...cart];
    newCart[index].qty = newQty;
    setCart(newCart);
    return { success: true };
  };

  const clearCart = () => {
    setCart([]);
  };

  const bill = computeBillForCart(cart);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, bill }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
