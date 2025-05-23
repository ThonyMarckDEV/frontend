import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../context/CartContext';
import API_BASE_URL from '../../../js/urlHelper';
import FetchWithGif from '../../../components/Reutilizables/FetchWithGif';
import NetworkError from '../../../components/Reutilizables/NetworkError';
import Footer from '../../../components/Home/Footer';
import noProductsImage from '../../../img/utilidades/noproduct.png';
import { fetchWithAuth } from '../../../js/authToken';
import jwtUtils from '../../../utilities/jwtUtils';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';

const CartDetail = () => {
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const navigate = useNavigate();
  const token = jwtUtils.getRefreshTokenFromCookie();
  const idCarrito = jwtUtils.getIdCarrito(token);
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
    if (!token || !idCarrito) {
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
      
      {/* Header */}
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
              {/* Products Section */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-2xl border border-pink-100 shadow-lg p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
                  <div className="space-y-4">
                    {cartDetails.map((detail, index) => (
                      <div
                        key={detail.idDetalle}
                        className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-pink-50 p-4 animate-fadeInUp"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-white shadow-inner">
                              <img
                                src={detail.modelo?.imagenes?.[0]?.urlImagen || noProductsImage}
                                alt={detail.producto?.nombreProducto || 'Producto'}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-300 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-medium">{detail.cantidad}</span>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-grow w-full">
                            <h3 className="text-lg sm:text-xl font-thin text-gray-800 tracking-wide truncate">
                              {detail.producto?.nombreProducto || 'Producto Exclusivo'}
                            </h3>
                            <div className="mt-1 text-xs sm:text-sm text-gray-500 font-light space-y-1">
                              <p className="truncate">
                                <span className="uppercase text-xs tracking-widest">Modelo:</span> {detail.modelo?.nombreModelo || 'N/A'}
                              </p>
                              <p>
                                <span className="uppercase text-xs tracking-widest">Disponibilidad:</span> {detail.modelo?.stock?.cantidad || 0} piezas
                              </p>
                            </div>
                            <div className="mt-2 sm:mt-3">
                              <div className="flex items-baseline space-x-2">
                                <span className="text-sm sm:text-base text-gray-600 font-light">
                                  S./ {(parseFloat(detail.producto?.precio) || 0).toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">por unidad</span>
                              </div>
                              <div className="mt-1 flex items-center">
                                <span className="text-lg sm:text-xl font-light text-pink-400">
                                  S./ {(parseFloat(detail.subtotal) || 0).toFixed(2)}
                                </span>
                                {pendingUpdates[detail.idDetalle] && (
                                  <span className="ml-2 text-xs text-pink-300 animate-pulse">
                                    ● Calculando...
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2 flex-wrap">
                              <div className="flex items-center bg-pink-50 rounded-full border border-pink-200 p-1">
                                <button
                                  onClick={() => handleQuantityChange(detail.idDetalle, detail.cantidad - 1)}
                                  disabled={detail.cantidad <= 1}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-pink-300 hover:bg-pink-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                                >
                                  <svg width="8" height="2" viewBox="0 0 12 2" className="fill-current">
                                    <rect width="12" height="2" rx="1"/>
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={detail.cantidad}
                                  onChange={(e) => handleQuantityInputChange(detail.idDetalle, e.target.value)}
                                  className="w-10 h-7 text-center bg-transparent text-gray-800 font-light text-sm focus:outline-none"
                                  onBlur={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    const clampedValue = Math.max(1, Math.min(10, value));
                                    if (value !== clampedValue) {
                                      handleQuantityChange(detail.idDetalle, clampedValue);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleQuantityChange(detail.idDetalle, detail.cantidad + 1)}
                                  disabled={detail.cantidad >= 10 || detail.cantidad >= (detail.modelo?.stock?.cantidad || 0)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-pink-300 hover:bg-pink-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                                >
                                  <svg width="8" height="8" viewBox="0 0 12 12" className="fill-current">
                                    <rect x="5" y="0" width="2" height="12" rx="1"/>
                                    <rect x="0" y="5" width="12" height="2" rx="1"/>
                                  </svg>
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(detail.idDetalle)}
                                className="px-3 py-1 text-xs uppercase tracking-widest text-gray-400 hover:text-pink-400 border border-gray-200 hover:border-pink-200 rounded-full transition-all duration-200"
                              >
                                Retirar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-2xl border border-pink-100 shadow-lg p-6 sticky top-4">
                  <h3 className="text-lg font-thin text-gray-800 tracking-widest uppercase mb-4 text-center">
                    Resumen
                  </h3>
                  <div className="border-t border-pink-100 pt-4">
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-base font-light text-gray-600">Total</span>
                      <div className="text-right">
                        <div className="text-2xl font-thin text-pink-400">
                          S./ {calculateTotal()}
                        </div>
                        {Object.keys(pendingUpdates).length > 0 && (
                          <div className="text-xs text-pink-300 animate-pulse mt-1">
                            Actualizando...
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/checkout')}
                      disabled={Object.keys(pendingUpdates).length > 0}
                      className="w-full py-3 bg-pink-300 hover:bg-pink-400 text-white font-light tracking-[0.15em] uppercase text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {Object.keys(pendingUpdates).length > 0 ? 'Procesando...' : 'Finalizar Compra'}
                    </button>
                  </div>
                </div>
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