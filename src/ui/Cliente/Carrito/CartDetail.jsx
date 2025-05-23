import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../context/CartContext';
import API_BASE_URL from '../../../js/urlHelper';
import FetchWithGif from '../../../components/Reutilizables/FetchWithGif';
import NetworkError from '../../../components/Reutilizables/NetworkError';
import Footer from '../../../components/Home/Footer';
import noProductsImage from '../../../img/utilidades/noproduct.png';
import { fetchWithAuth } from '../../../js/authToken';
import jwtUtils from '../../../utilities/jwtUtils';
import Swal from 'sweetalert2'; // Import SweetAlert2

const CartDetail = () => {
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const token = jwtUtils.getRefreshTokenFromCookie();
  const idCarrito = jwtUtils.getIdCarrito(token);
  const { updateCartCount } = useContext(CartContext);

  useEffect(() => {
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

    fetchCartDetails();
  }, [idCarrito]);

  const handleQuantityChange = async (idDetalle, newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/cart/details/${idDetalle}`, {
        method: 'PUT',
        body: JSON.stringify({ cantidad: newQuantity }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCartDetails((prevDetails) =>
          prevDetails.map((detail) =>
            detail.idDetalle === idDetalle
              ? { ...detail, ...data.data, subtotal: parseFloat(data.data.subtotal) }
              : detail
          )
        );
        await updateCartCount();
        setError(null);
      } else {
        setError(data?.message || 'Error al actualizar la cantidad');
      }
    } catch (err) {
      setError('Error al actualizar la cantidad: ' + err.message);
      if (err.message.includes('Network Error') || err.name === 'TypeError') {
        setIsNetworkError(true);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (idDetalle) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB6CE', // pink-300
      cancelButtonColor: '#6B7280', // gray-500
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'font-serif text-2xl text-pink-300',
        content: 'text-gray-600',
        confirmButton: 'font-serif tracking-wide',
        cancelButton: 'font-serif tracking-wide',
      },
      background: '#FFF', // white background
      buttonsStyling: true,
    });

    if (!result.isConfirmed) return;

    setIsUpdating(true);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartDetails
      .reduce((total, detail) => total + (parseFloat(detail.subtotal) || 0), 0)
      .toFixed(2);
  };

  // Custom loader component
  const UpdateLoader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-pink-100 bg-opacity-75 z-50">
      <div className="w-12 h-12 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
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
                      </p>
                      <div className="flex items-center mt-4 space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(detail.idDetalle, detail.cantidad - 1)
                          }
                          disabled={detail.cantidad <= 1 || isUpdating}
                          className="px-3 py-1 bg-pink-300 text-white rounded-l-lg hover:bg-pink-400 disabled:opacity-50 transition-colors duration-200"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 bg-pink-50 text-gray-900 rounded">{detail.cantidad}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(detail.idDetalle, detail.cantidad + 1)
                          }
                          disabled={detail.cantidad >= (detail.modelo?.stock?.cantidad || 0) || isUpdating}
                          className="px-3 py-1 bg-pink-300 text-white rounded-r-lg hover:bg-pink-400 disabled:opacity-50 transition-colors duration-200"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveItem(detail.idDetalle)}
                          disabled={isUpdating}
                          className="ml-4 px-4 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
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
                </p>
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={isUpdating}
                  className="mt-4 px-8 py-3 bg-pink-300 text-white rounded-lg hover:bg-pink-400 transition-colors duration-200 font-serif tracking-wide disabled:opacity-50"
                >
                  Proceder al Pago
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