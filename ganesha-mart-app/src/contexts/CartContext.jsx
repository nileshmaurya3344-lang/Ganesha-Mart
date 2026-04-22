import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('guest_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const isMock = user?.id?.startsWith('00000000');

  useEffect(() => {
    if (user && !isMock) {
      mergeGuestCart();
    } else if (user && isMock) {
      const saved = localStorage.getItem(`cart_${user.id}`);
      setCartItems(saved ? JSON.parse(saved) : []);
    } else {
      const saved = localStorage.getItem('guest_cart');
      setCartItems(saved ? JSON.parse(saved) : []);
    }
  }, [user, isMock]);

  async function mergeGuestCart() {
    const saved = localStorage.getItem('guest_cart');
    const guestItems = saved ? JSON.parse(saved) : [];
    
    if (guestItems.length > 0) {
      // For each guest item, try to add it to the user's cart in DB
      for (const item of guestItems) {
        // We can reuse addToCart logic or implement a batch insert
        // Here we'll do it simply: fetch existing user items, then merge
        const { data: existingItems } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', item.product_id);

        if (existingItems && existingItems.length > 0) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({ quantity: existingItems[0].quantity + item.quantity })
            .eq('id', existingItems[0].id);
        } else {
          // Insert new
          await supabase.from('cart_items').insert({
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity
          });
        }
      }
      // Clear guest cart after merging
      localStorage.removeItem('guest_cart');
    }
    fetchCart();
  }

  // Sync cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    } else if (isMock) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user, isMock]);

  async function fetchCart() {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);
    setCartItems(data || []);
  }

  async function addToCart(product) {
    if (!user || isMock) {
      const existing = cartItems.find(i => i.product_id === product.id);
      if (existing) {
        setCartItems(prev => prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        const newItem = {
          id: `local-${Date.now()}`,
          user_id: user?.id || null,
          product_id: product.id,
          quantity: 1,
          products: product
        };
        setCartItems(prev => [...prev, newItem]);
      }
      return;
    }

    // Real Supabase User logic
    try {
      const existing = cartItems.find(i => i.product_id === product.id);
      if (existing) {
        await updateQty(existing.id, existing.quantity + 1);
      } else {
        const { data, error } = await supabase.from('cart_items').insert({
          user_id: user.id, product_id: product.id, quantity: 1
        }).select('*, products(*)').single();
        
        if (error) throw error;
        if (data) setCartItems(prev => [...prev, data]);
      }
    } catch (err) {
      console.error('Cart Error:', err);
      // Fallback to local state if DB fails, so user is not blocked
      const newItem = {
        id: `fallback-${Date.now()}`,
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
        products: product
      };
      setCartItems(prev => [...prev, newItem]);
    }
  }

  async function updateQty(cartItemId, qty) {
    if (qty <= 0) return removeFromCart(cartItemId);
    
    if (!user || isMock || String(cartItemId).startsWith('local-') || String(cartItemId).startsWith('fallback-')) {
      setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: qty } : i));
      return;
    }

    try {
      const { error } = await supabase.from('cart_items').update({ quantity: qty }).eq('id', cartItemId);
      if (error) throw error;
      setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: qty } : i));
    } catch (err) {
      console.error('Update Qty Error:', err);
      // Still update local state even if DB fails
      setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: qty } : i));
    }
  }

  async function removeFromCart(cartItemId) {
    if (!user || isMock || String(cartItemId).startsWith('local-') || String(cartItemId).startsWith('fallback-')) {
      setCartItems(prev => prev.filter(i => i.id !== cartItemId));
      return;
    }
    try {
      await supabase.from('cart_items').delete().eq('id', cartItemId);
    } catch (err) {
      console.error('Remove Error:', err);
    }
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
  }

  async function clearCart() {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem('guest_cart');
      return;
    }
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setCartItems([]);
  }

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + (i.products?.price * i.quantity), 0);

  const getQty = (productId) => cartItems.find(i => i.product_id === productId)?.quantity || 0;
  const getCartItem = (productId) => cartItems.find(i => i.product_id === productId);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart, totalItems, totalPrice, getQty, getCartItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
