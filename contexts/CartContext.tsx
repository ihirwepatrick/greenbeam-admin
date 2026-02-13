"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../lib/types/api';

// Extended interface for guest cart with product data
interface ExtendedAddToCartRequest extends AddToCartRequest {
  product?: {
    id: number;
    name: string;
    description?: string;
    category?: string;
    image?: string;
    images?: string[] | null;
    price?: string;
    createdAt?: string;
  };
}
import { cartService } from '../lib/services/api';
import { useAuth } from './AuthContext';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_ITEM':
      if (!state.cart) return state;
      const existingItemIndex = state.cart.items.findIndex(
        item => item.productId === action.payload.productId
      );
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.cart.items];
        updatedItems[existingItemIndex] = action.payload;
        return {
          ...state,
          cart: {
            ...state.cart,
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
            total: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          }
        };
      } else {
        // Add new item
        const newItems = [...state.cart.items, action.payload];
        return {
          ...state,
          cart: {
            ...state.cart,
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: newItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
            total: newItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          }
        };
      }
    case 'UPDATE_ITEM':
      if (!state.cart) return state;
      const itemIndex = state.cart.items.findIndex(
        item => item.productId === action.payload.productId
      );
      if (itemIndex >= 0) {
        const updatedItems = [...state.cart.items];
        updatedItems[itemIndex] = action.payload;
        return {
          ...state,
          cart: {
            ...state.cart,
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
            total: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          }
        };
      }
      return state;
    case 'REMOVE_ITEM':
      if (!state.cart) return state;
      const filteredItems = state.cart.items.filter(
        item => item.productId !== action.payload
      );
      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: filteredItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          total: filteredItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
        }
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: state.cart ? {
          ...state.cart,
          items: [],
          totalItems: 0,
          subtotal: '0.00',
          total: '0.00',
        } : null
      };
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateCartItem: (productId: number, data: UpdateCartItemRequest) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartCount: () => number;
  isInCart: (productId: number) => boolean;
  getCartItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();



  // Load guest cart from localStorage
  const loadGuestCart = () => {
    try {
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const parsedCart = JSON.parse(guestCart);
        dispatch({ type: 'SET_CART', payload: parsedCart });
        return;
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
    }
    
    // Initialize empty guest cart
    const emptyCart = {
      id: 'guest',
      userId: 'guest',
      items: [],
      totalItems: 0,
      subtotal: '0.00',
      total: '0.00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'SET_CART', payload: emptyCart });
    localStorage.setItem('guestCart', JSON.stringify(emptyCart));
  };

  // Save guest cart to localStorage
  const saveGuestCart = (cart: Cart) => {
    try {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const refreshCart = async () => {
    // Always use guest cart functionality
    loadGuestCart();
  };

  const addToCart = async (data: ExtendedAddToCartRequest) => {
    // Always use guest cart functionality
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const currentCart = state.cart || {
        id: 'guest',
        userId: 'guest',
        items: [],
        totalItems: 0,
        subtotal: '0.00',
        total: '0.00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use provided product data or create basic structure
      const guestCartItem: CartItem = {
        id: `guest-${data.productId}-${Date.now()}`,
        productId: data.productId,
        product: {
          id: data.productId,
          name: data.product?.name || `Product ${data.productId}`,
          description: data.product?.description || 'Product details will be loaded when viewing cart',
          category: data.product?.category || 'General',
          image: data.product?.image || '/placeholder.svg',
          images: data.product?.images || null,
          createdAt: data.product?.createdAt || new Date().toISOString(),
        },
        quantity: data.quantity,
        price: data.product?.price || '0.00',
        total: data.product?.price ? (parseFloat(data.product.price) * data.quantity).toFixed(2) : '0.00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if item already exists
      const existingItemIndex = currentCart.items.findIndex(
        item => item.productId === data.productId
      );

      let updatedCart;
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...currentCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + data.quantity,
          total: (parseFloat(updatedItems[existingItemIndex].price) * (updatedItems[existingItemIndex].quantity + data.quantity)).toFixed(2)
        };
        
        updatedCart = {
          ...currentCart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          total: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Add new item
        const newItems = [...currentCart.items, guestCartItem];
        updatedCart = {
          ...currentCart,
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: newItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          total: newItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
          updatedAt: new Date().toISOString(),
        };
      }

      dispatch({ type: 'SET_CART', payload: updatedCart });
      saveGuestCart(updatedCart);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error adding item to cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (productId: number, data: UpdateCartItemRequest) => {
    // Always use guest cart functionality
    try {
      const currentCart = state.cart;
      if (!currentCart) return;

      const itemIndex = currentCart.items.findIndex(item => item.productId === productId);
      if (itemIndex === -1) return;

      const updatedItems = [...currentCart.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: data.quantity,
        total: (parseFloat(updatedItems[itemIndex].price) * data.quantity).toFixed(2)
      };

      const updatedCart = {
        ...currentCart,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
        total: updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'SET_CART', payload: updatedCart });
      saveGuestCart(updatedCart);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error updating cart item' });
    }
  };

  const removeFromCart = async (productId: number) => {
    // Always use guest cart functionality
    try {
      const currentCart = state.cart;
      if (!currentCart) return;

      const filteredItems = currentCart.items.filter(item => item.productId !== productId);
      const updatedCart = {
        ...currentCart,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: filteredItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
        total: filteredItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'SET_CART', payload: updatedCart });
      saveGuestCart(updatedCart);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error removing item from cart' });
    }
  };

  const clearCart = async () => {
    // Always use guest cart functionality
    try {
      const emptyCart = {
        id: 'guest',
        userId: 'guest',
        items: [],
        totalItems: 0,
        subtotal: '0.00',
        total: '0.00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'SET_CART', payload: emptyCart });
      saveGuestCart(emptyCart);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error clearing cart' });
    }
  };

  const getCartCount = () => {
    return state.cart?.totalItems || 0;
  };

  const isInCart = (productId: number) => {
    return state.cart?.items.some(item => item.productId === productId) || false;
  };

  const getCartItemQuantity = (productId: number) => {
    const item = state.cart?.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const value: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartCount,
    isInCart,
    getCartItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}