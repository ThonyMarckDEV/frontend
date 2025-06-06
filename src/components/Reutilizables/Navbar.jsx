// src/components/Reutilizables/Navbar.jsx
import React, { useContext, useState } from 'react';
import { Menu, X, Heart, ShoppingBag, User } from 'lucide-react';
import jwtUtils from '../../utilities/jwtUtils';
import { logout } from '../../js/logout';
import { CartContext } from '../../context/CartContext';

const Navbar = () => {
  const { cartItemCount } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const token = jwtUtils.getRefreshTokenFromCookie();
  const rol = token ? jwtUtils.getUserRole(token) : null;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <a href="/">
              <h1 className="text-2xl font-bold text-pink-300">MelyMarckStore</h1>
            </a>
          </div>

          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-pink-500 transition">Inicio</a>
            <a href="/products" className="text-gray-700 hover:text-pink-500 transition">Productos</a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Always show heart icon */}
            <button className="text-gray-700 hover:text-pink-500">
              <Heart size={20} />
            </button>
            
            {/* Show shopping bag only if role exists and is cliente */}
            {rol === 'cliente' && (
              <div className="relative">
                <a href="/cart" className="text-gray-700 hover:text-pink-500">
                  <ShoppingBag size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </a>
              </div>
            )}

            <div className="relative">
              <button
                className="text-gray-700 hover:text-pink-500"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User size={20} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-2 z-50">
                  {rol === 'cliente' ? (
                    <>
                      <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Perfil</a>
                      <a href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Pedidos</a>
                      <a href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Configuración</a>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-white hover:bg-gray-100 text-red-500 px-4 py-2 rounded w-full"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Iniciar Sesión</a>
                      <a href="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Registrarse</a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t mt-4">
            <div className="flex flex implode
            flex-col space-y-3">
              <a href="/" className="text-gray-700 hover:text-pink-500 transition py-2">Inicio</a>
              <a href="/products" className="text-gray-700 hover:text-pink-500 transition py-2">Productos</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;