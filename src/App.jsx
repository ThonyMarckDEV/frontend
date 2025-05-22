//import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

//Contextos


//Componentes Globales
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Reutilizables/Navbar';

// Componentes Home
import HomeUI from './ui/Home';

// UIS AUTH
import ErrorPage from './components/ErrorPage';
import ErrorPage401 from './components/ErrorPage401';
import LoginUI from './ui/Auth/Login';

// UIS ADMIN


// UIS Cliente
import ProductsUI from './ui/Home/ProductsUI/Products';
import ConfigUI from './ui/Cliente/ConfigUI/Config';

// Utilities
import ProtectedRouteHome from './utilities/ProtectedRouteHome';
import ProtectedRouteCliente from './utilities/ProtectedRouteCliente';


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

      {/* Ruta de error */}
      <Route path="/*" element={<ErrorPage />} />
      <Route path="/401" element={<ErrorPage401 />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;