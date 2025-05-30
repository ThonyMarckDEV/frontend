import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../context/CartContext';
import API_BASE_URL from '../../../js/urlHelper';
import FetchWithGif from '../../../components/Reutilizables/FetchWithGif';
import NetworkError from '../../../components/Reutilizables/NetworkError';
import Footer from '../../../components/Home/Footer';
import noProductsImage from '../../../img/utilidades/noproduct.webp';
import { fetchWithAuth } from '../../../js/authToken';
import jwtUtils from '../../../utilities/jwtUtils';
import Swal from 'sweetalert2';
import CartItem from '../../../components/ui/Cliente/Carrito/CartItem';
import CartSummary from '../../../components/ui/Cliente/Carrito/CartSummary';
import PickupMethodCard from '../../../components/ui/Cliente/Carrito/PickupMethodCard';

const CartDetail = () => {
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const navigate = useNavigate();
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const idCarrito = jwtUtils.getIdCarrito(refresh_token);
  const { updateCartCount } = useContext(CartContext);
  const updateTimeouts = useRef({});

  const updateLocalQuantity = (idDetalle, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setCartDetails((prevDetails) =>
      prevDetails.map((detail) => {
        if (detail.idDetalle === idDetalle) {
          const updatedDetail = { ...detail, cantidad: newQuantity };
          updatedDetail.subtotal = (parseFloat(detail.producto.precio) * newQuantity).toFixed(2);
          return updatedDetail;
        }
        return detail;
      })
    );

    setPendingUpdates(prev => ({ ...prev, [idDetalle]: newQuantity }));
  };

  const updateServerQuantity = async (idDetalle, quantity) => {
    try {
      setIsUpdating(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/cart/details/${idDetalle}`, {
        method: 'PUT',
        body: JSON.stringify({ cantidad: quantity }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCartDetails((prevDetails) =>
          prevDetails.map((detail) =>
            detail.idDetalle === idDetalle
              ? { 
                  ...detail, 
                  cantidad: data.data.cantidad,
                  subtotal: parseFloat(data.data.subtotal) 
                }
              : detail
          )
        );
        await updateCartCount();
        setError(null);
        setPendingUpdates(prev => {
          const newPending = { ...prev };
          delete newPending[idDetalle];
          return newPending;
        });
      } else {
        setError(data?.message || 'Error al actualizar la cantidad');
        fetchCartDetails();
      }
    } catch (err) {
      setError('Error al actualizar la cantidad: ' + err.message);
      if (err.message.includes('Network Error') || err.name === 'TypeError') {
        setIsNetworkError(true);
      }
      fetchCartDetails();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityChange = (idDetalle, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    updateLocalQuantity(idDetalle, newQuantity);

    if (updateTimeouts.current[idDetalle]) {
      clearTimeout(updateTimeouts.current[idDetalle]);
    }

    updateTimeouts.current[idDetalle] = setTimeout(() => {
      updateServerQuantity(idDetalle, newQuantity);
      delete updateTimeouts.current[idDetalle];
    }, 800);
  };

  const handleQuantityInputChange = (idDetalle, value) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.max(1, Math.min(10, numValue));
    handleQuantityChange(idDetalle, clampedValue);
  };

  const fetchCartDetails = async () => {
    if (!refresh_token || !idCarrito) {
      setError('No se encontró un carrito válido. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/cart/${idCarrito}/details`);
      const data = await response.json();

      if (response.ok && data.success) {
        const formattedData = data.data.map(detail => ({
          ...detail,
          subtotal: parseFloat(detail.subtotal),
          producto: {
            ...detail.producto,
            precio: parseFloat(detail.producto.precio),
          },
        }));
        setCartDetails(formattedData);
        setIsNetworkError(false);
      } else {
        setError(data?.message || 'Error al cargar los detalles del carrito');
        setIsNetworkError(false);
      }
    } catch (err) {
      console.error('Error fetching cart details:', err);
      if (err.message.includes('Network Error') || err.name === 'TypeError') {
        setIsNetworkError(true);
      } else {
        setError('No se pudieron cargar los detalles del carrito');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartDetails();
    
    return () => {
      Object.values(updateTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [idCarrito]);

  const handleRemoveItem = async (idDetalle) => {
    const result = await Swal.fire({
      title: '¿Retirar artículo?',
      text: '¿Desea retirar este exquisito artículo de su selección?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FBB6CE',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Conservar',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-pink-100',
        title: 'font-thin text-2xl text-gray-800 tracking-wider',
        content: 'text-gray-600 font-light',
        confirmButton: 'font-light tracking-widest uppercase text-sm px-8 py-3',
        cancelButton: 'font-light tracking-widest uppercase text-sm px-8 py-3',
      },
      background: '#FEFEFE',
      buttonsStyling: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/cart/details/${idDetalle}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCartDetails((prevDetails) =>
          prevDetails.filter((detail) => detail.idDetalle !== idDetalle)
        );
        await updateCartCount();
        setError(null);
      } else {
        setError(data?.message || 'Error al eliminar el producto');
      }
    } catch (err) {
      setError('Error al eliminar el producto: ' + err.message);
      if (err.message.includes('Network Error') || err.name === 'TypeError') {
        setIsNetworkError(true);
      }
    }
  };

  const calculateTotal = () => {
    return cartDetails
      .reduce((total, detail) => total + (parseFloat(detail.subtotal) || 0), 0)
      .toFixed(2);
  };

  const UpdateLoader = () => (
    <div className="fixed bottom-4 right-4 flex items-center bg-white border border-pink-200 text-gray-800 px-4 py-2 rounded-xl shadow-lg z-50 backdrop-blur-sm bg-opacity-95">
      <div className="w-4 h-4 border-2 border-pink-300 border-t-transparent rounded-full animate-spin mr-2"></div>
      <span className="text-xs font-light tracking-wide">Actualizando...</span>
    </div>
  );

  if (loading) return <FetchWithGif />;
  if (isNetworkError) return <NetworkError />;
  if (error) return (
    <div className="text-center p-6 bg-white border border-pink-200 text-gray-800 rounded-xl shadow-lg mx-auto max-w-md">
      <div className="font-light tracking-wide">{error}</div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 text-gray-900">
      {isUpdating && <UpdateLoader />}
      <div className="bg-white border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-thin text-gray-800 tracking-[0.2em] uppercase">
              Mi Carrito
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent mx-auto mt-2"></div>
          </div>
        </div>
      </div>
      <div className="flex-grow py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {cartDetails.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
              <div className="lg:w-2/3">
                <div className="bg-white rounded-2xl border border-pink-100 shadow-lg p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
                  <div className="space-y-4">
                    {cartDetails.map((detail, index) => (
                      <CartItem
                        key={detail.idDetalle}
                        detail={detail}
                        index={index}
                        handleQuantityChange={handleQuantityChange}
                        handleQuantityInputChange={handleQuantityInputChange}
                        handleRemoveItem={handleRemoveItem}
                        pendingUpdates={pendingUpdates}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3 space-y-6">
                <PickupMethodCard />
                <CartSummary
                  cartDetails={cartDetails}
                  calculateTotal={calculateTotal}
                  pendingUpdates={pendingUpdates}
                  navigate={navigate}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-sm mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                  <img
                    src={noProductsImage}
                    alt="Carrito vacío"
                    className="w-12 h-12 opacity-60"
                  />
                </div>
                <h2 className="text-xl font-thin text-gray-600 tracking-wide mb-3">
                  Su selección está vacía
                </h2>
                <p className="text-gray-400 font-light tracking-wide mb-6">
                  Descubra nuestra colección exclusiva
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-2.5 bg-pink-300 hover:bg-pink-400 text-white font-light tracking-[0.15em] uppercase text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Explorar Colección
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartDetail;