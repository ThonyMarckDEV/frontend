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
  const [pendingUpdates, setPendingUpdates] = useState({}); // Para manejar actualizaciones pendientes
  const navigate = useNavigate();
  const token = jwtUtils.getRefreshTokenFromCookie();
  const idCarrito = jwtUtils.getIdCarrito(token);
  const { updateCartCount } = useContext(CartContext);

  // Referencias para los timeouts de debounce por producto
  const updateTimeouts = useRef({});

  // Función para actualizar cantidad localmente (instantánea)
  const updateLocalQuantity = (idDetalle, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setCartDetails((prevDetails) =>
      prevDetails.map((detail) => {
        if (detail.idDetalle === idDetalle) {
          const updatedDetail = { ...detail, cantidad: newQuantity };
          // Recalcular subtotal localmente
          updatedDetail.subtotal = (parseFloat(detail.producto.precio) * newQuantity).toFixed(2);
          return updatedDetail;
        }
        return detail;
      })
    );

    // Marcar como actualización pendiente
    setPendingUpdates(prev => ({ ...prev, [idDetalle]: newQuantity }));
  };

  // Función debounced para actualizar en el servidor
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
        // Actualizar con datos del servidor
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
        
        // Remover de actualizaciones pendientes
        setPendingUpdates(prev => {
          const newPending = { ...prev };
          delete newPending[idDetalle];
          return newPending;
        });
      } else {
        // Si falla, revertir cambio local
        setError(data?.message || 'Error al actualizar la cantidad');
        fetchCartDetails(); // Recargar datos del servidor
      }
    } catch (err) {
      setError('Error al actualizar la cantidad: ' + err.message);
      if (err.message.includes('Network Error') || err.name === 'TypeError') {
        setIsNetworkError(true);
      }
      fetchCartDetails(); // Recargar datos del servidor
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar cambio de cantidad con debounce
  const handleQuantityChange = (idDetalle, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    // Actualizar inmediatamente en la UI
    updateLocalQuantity(idDetalle, newQuantity);

    // Cancelar timeout anterior si existe
    if (updateTimeouts.current[idDetalle]) {
      clearTimeout(updateTimeouts.current[idDetalle]);
    }

    // Crear nuevo timeout para actualizar en servidor
    updateTimeouts.current[idDetalle] = setTimeout(() => {
      updateServerQuantity(idDetalle, newQuantity);
      delete updateTimeouts.current[idDetalle];
    }, 800); // 800ms de espera
  };

  // Manejar input directo de cantidad
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
    
    // Cleanup function para limpiar timeouts
    return () => {
      Object.values(updateTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [idCarrito]);

  const handleRemoveItem = async (idDetalle) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB6CE',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'font-serif text-2xl text-pink-300',
        content: 'text-gray-600',
        confirmButton: 'font-serif tracking-wide',
        cancelButton: 'font-serif tracking-wide',
      },
      background: '#FFF',
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

  // Componente de loader mejorado
  const UpdateLoader = () => (
    <div className="fixed bottom-4 right-4 flex items-center bg-pink-300 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      <span className="text-sm font-medium">Actualizando...</span>
    </div>
  );

  if (loading) return <FetchWithGif />;
  if (isNetworkError) return <NetworkError />;
  if (error) return (
    <div className="text-center p-6 bg-pink-50 text-pink-800 rounded-xl shadow-lg mx-auto max-w-2xl">
      {error}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-100 to-white text-gray-900">
      {isUpdating && <UpdateLoader />}
      <div className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-serif text-pink-300 text-center mb-12 animate-fade-in tracking-wide">
            Tu Carrito de Compras
          </h1>
          {cartDetails.length > 0 ? (
            <div className="space-y-6">
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-50 pr-4">
                {cartDetails.map((detail) => (
                  <div
                    key={detail.idDetalle}
                    className="flex items-center bg-white rounded-xl shadow-md p-6 mb-4 hover:shadow-xl transition-shadow duration-300 border border-pink-200"
                  >
                    <img
                      src={detail.modelo?.imagenes?.[0]?.urlImagen || noProductsImage}
                      alt={detail.producto?.nombreProducto || 'Producto'}
                      className="w-32 h-32 object-cover rounded-lg mr-6 transform hover:scale-105 transition-transform duration-200"
                    />
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-pink-300 font-serif">
                        {detail.producto?.nombreProducto || 'Producto no disponible'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Modelo: {detail.modelo?.nombreModelo || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Stock disponible: {detail.modelo?.stock?.cantidad || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Precio unitario: S./ {(parseFloat(detail.producto?.precio) || 0).toFixed(2)}
                      </p>
                      <p className="text-base font-bold text-pink-400">
                        Subtotal: S./ {(parseFloat(detail.subtotal) || 0).toFixed(2)}
                        {pendingUpdates[detail.idDetalle] && (
                          <span className="ml-2 text-xs text-orange-500 animate-pulse">
                            ● Actualizando...
                          </span>
                        )}
                      </p>
                      
                      {/* Controles de cantidad mejorados */}
                      <div className="flex items-center mt-4 space-x-2">
                        <button
                          onClick={() => handleQuantityChange(detail.idDetalle, detail.cantidad - 1)}
                          disabled={detail.cantidad <= 1}
                          className="px-3 py-2 bg-pink-300 text-white rounded-l-lg hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold"
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={detail.cantidad}
                          onChange={(e) => handleQuantityInputChange(detail.idDetalle, e.target.value)}
                          className="w-16 px-2 py-2 bg-pink-50 text-gray-900 text-center border border-pink-200 focus:border-pink-400 focus:outline-none"
                          onBlur={(e) => {
                            // Validar cuando pierde el foco
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
                          className="px-3 py-2 bg-pink-300 text-white rounded-r-lg hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold"
                        >
                          +
                        </button>
                        
                        <span className="text-xs text-gray-500 ml-2">
                          (máx. 10)
                        </span>
                        
                        <button
                          onClick={() => handleRemoveItem(detail.idDetalle)}
                          className="ml-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-right mt-8">
                <p className="text-2xl font-bold text-pink-300 font-serif">
                  Total: S./ {calculateTotal()}
                  {Object.keys(pendingUpdates).length > 0 && (
                    <span className="block text-sm text-orange-500 animate-pulse">
                      Calculando total actualizado...
                    </span>
                  )}
                </p>
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={Object.keys(pendingUpdates).length > 0}
                  className="mt-4 px-8 py-3 bg-pink-300 text-white rounded-lg hover:bg-pink-400 transition-colors duration-200 font-serif tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {Object.keys(pendingUpdates).length > 0 ? 'Procesando cambios...' : 'Proceder al Pago'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-gray-600">
              <img
                src={noProductsImage}
                alt="Carrito vacío"
                className="w-64 max-w-xs mb-6 opacity-80"
              />
              <p className="text-lg font-serif">Tu carrito está vacío. ¡Añade algunos productos!</p>
              <button
                onClick={() => navigate('/products')}
                className="mt-6 px-8 py-3 bg-pink-300 text-white rounded-lg hover:bg-pink-400 transition-colors duration-200 font-serif tracking-wide"
              >
                Volver a la Tienda
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartDetail;