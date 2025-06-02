import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import jwtUtils from './utilities/jwtUtils';

//Contextos
import { CartProvider } from './context/CartContext';

//Componentes Globales
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Reutilizables/Navbar';
import SidebarAdmin from './components/ui/Admin/Sidebar';

// Componentes Home
import HomeUI from './ui/Home';

// UIS AUTH
import ErrorPage from './components/ErrorPage';
import ErrorPage401 from './components/ErrorPage401';
import LoginUI from './ui/Auth/Login';

// UIS ADMIN
import HomeAdmin from './ui/Admin/Home/HomeAdmin';

// UIS Cliente
import ProductsUI from './ui/Home/ProductsUI/Products';
import ConfigUI from './ui/Cliente/ConfigUI/Config';
import CartUI from './ui/Cliente/Carrito/CartDetail';
import OrdersUI from './ui/Cliente/Ordenes/Orders';

// Utilities
import ProtectedRouteHome from './utilities/ProtectedRouteHome';
import ProtectedRouteCliente from './utilities/ProtectedRouteCliente';
import ProtectedRouteAdmin from './utilities/ProtectedRouteAdmin';
import Categories from './ui/Admin/Categorias/Categories';


function AppContent() {

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<ProtectedRouteHome element={<HomeUI />} />} />
      <Route path="/login"  element={<ProtectedRouteHome element={<LoginUI />}  />} />
      <Route path="/products" element={<ProductsUI />} />
      <Route path="/products/:categoryId?/:subcategoryId?" element={<ProductsUI />} />

      {/* Rutas Cliente */}
      <Route path="/settings" element={<ProtectedRouteCliente element={<ConfigUI />} />}  />
      <Route path="/cart" element={<ProtectedRouteCliente element={<CartUI />} />}  />
      <Route path="/orders" element={<ProtectedRouteCliente element={<OrdersUI />} />}  />

      {/* Rutas Admin */}
      <Route path="/admin" element={<ProtectedRouteAdmin element={<HomeAdmin />} />}  />
      <Route path="/admin/categories" element={<ProtectedRouteAdmin element={<Categories />} />}  />

      {/* Ruta de error */}
      <Route path="/*" element={<ErrorPage />} />
      <Route path="/401" element={<ErrorPage401 />} />
    </Routes>
  );
}

// Componente App corregido
function App() {
  const [rol, setRol] = useState(() => {
    const token = jwtUtils.getRefreshTokenFromCookie();
    return token ? jwtUtils.getUserRole(token) : null;
  });
  const isAdmin = rol === 'admin';

  // Effect to re-check the token on navigation or cookie change
  useEffect(() => {
    const checkToken = () => {
      const token = jwtUtils.getRefreshTokenFromCookie();
      const newRol = token ? jwtUtils.getUserRole(token) : null;
      if (newRol !== rol) {
        setRol(newRol);
      }
    };

    // Check token immediately and on navigation
    checkToken();

    // Listen for navigation changes
    window.addEventListener('popstate', checkToken);

    // Optional: Poll for cookie changes (if cookies are set asynchronously)
    const interval = setInterval(checkToken, 1000);

    return () => {
      window.removeEventListener('popstate', checkToken);
      clearInterval(interval);
    };
  }, [rol]);

  return (
    <Router>
      <CartProvider>
        <div className="bg-white">
          {isAdmin && <SidebarAdmin />}
          {/* Contenido principal con margen responsivo */}
          <div className={`flex-1 ${isAdmin ? 'md:ml-64' : ''}`}>
            {!isAdmin && <Navbar />}
            <AppContent />
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;