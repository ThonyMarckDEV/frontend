// src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../js/authToken';
import API_BASE_URL from '../js/urlHelper';
import jwtUtils from '../utilities/jwtUtils';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  const fetchCartItemCount = async () => {
    const refreshToken = jwtUtils.getRefreshTokenFromCookie();
    if (!refreshToken) {
      setCartItemCount(0);
      return;
    }

    const idCarrito = jwtUtils.getIdCarrito(refreshToken);
    if (!idCarrito) {
      setCartItemCount(0);
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/carrito/cantidad/${idCarrito}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCartItemCount(data.totalItems || 0);
      } else {
        console.error('Error fetching cart item count:', data.message);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart item count:', error);
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    fetchCartItemCount();
  }, []);

  const updateCartCount = async () => {
    await fetchCartItemCount();
  };

  return (
    <CartContext.Provider value={{ cartItemCount, updateCartCount, setCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};