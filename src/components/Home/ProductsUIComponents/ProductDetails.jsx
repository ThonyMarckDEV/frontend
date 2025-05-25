import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import API_BASE_URL from '../../../js/urlHelper';
import jwtUtils from '../../../utilities/jwtUtils';
import { fetchWithAuth } from '../../../js/authToken';
import { toast } from 'react-toastify';
import LoadingScreen from '../../../components/LoadingScreen';
import { CartContext } from '../../../context/CartContext';

const ProductDetails = ({ product, isOpen, onClose }) => {
  const { updateCartCount } = useContext(CartContext);
  const [selectedModel, setSelectedModel] = useState(product.selectedModel || {});
  const [quantity, setQuantity] = useState(1);
  const [showFullCharacteristics, setShowFullCharacteristics] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow style
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Cleanup: Restore original overflow when modal closes or component unmounts
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const handleModelChange = (model) => {
    setSelectedModel(model);
    setQuantity(1);
  };

  const handleQuantityIncrement = () => {
    const stockCantidad = selectedModel.stock?.cantidad || 0;
    if (quantity < stockCantidad) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleModalBodyClick = (e) => {
    e.stopPropagation();
  };

  const toggleCharacteristics = () => {
    setShowFullCharacteristics(!showFullCharacteristics);
  };

  const handleAddToCart = async () => {
    const refreshToken = jwtUtils.getRefreshTokenFromCookie();
    if (!refreshToken) {
      setErrorMessage('Por favor, inicia sesión para agregar productos al carrito.');
      setShowLoginModal(true);
      return;
    }

    const idUsuario = jwtUtils.getUserID(refreshToken);
    const idCarrito = jwtUtils.getIdCarrito(refreshToken);

    if (!idUsuario) {
      setErrorMessage('Error: No se pudo obtener la información del usuario desde el refresh token.');
      setShowLoginModal(true);
      return;
    }

    if (!idCarrito) {
      toast.error('No se encontró un carrito asociado al usuario. Por favor, intenta de nuevo.');
      return;
    }

    if (!product.idProducto) {
      toast.error('Error: No se encontró el producto.');
      return;
    }

    if (!selectedModel.idModelo) {
      toast.error('Error: No se seleccionó un modelo válido.');
      return;
    }

    if (!quantity || quantity < 1) {
      toast.error('Error: La cantidad debe ser mayor a 0.');
      return;
    }

    const stockCantidad = selectedModel.stock?.cantidad || 0;
    if (stockCantidad <= 0) {
      toast.error('Error: No hay stock disponible para este modelo.');
      return;
    }

    const requestBody = {
      idCarrito,
      idProducto: product.idProducto,
      idModelo: selectedModel.idModelo,
      cantidad: quantity,
    };

    try {
      setIsLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/carrito/detalles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      toast.success('Producto agregado al carrito exitosamente');
      setQuantity(1);
      await updateCartCount();
      onClose();
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error(`Error al agregar el producto al carrito: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  const totalPrice = (product.precio * quantity).toFixed(2);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg w-full h-full sm:max-w-2xl sm:h-auto sm:max-h-[90vh] flex flex-col"
          onClick={handleModalBodyClick}
        >
          {/* Fixed Header */}
          <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 p-6 sm:static sm:border-b sm:z-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-pink-800">{product.nombreProducto}</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pt-20 sm:pt-6 px-6 pb-20 sm:pb-6">
            <Carousel
              showThumbs={false}
              showStatus={false}
              infiniteLoop
              useKeyboardArrows
              autoPlay
              interval={5000}
              showIndicators={true}
              dynamicHeight={false}
              className="relative mb-6"
            >
              {selectedModel.imagenes?.map((image) => (
                <div key={image.idImagen} className="h-80">
                  <img
                    src={image.urlImagen}
                    alt={product.nombreProducto}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found')}
                  />
                </div>
              )) || <div className="h-80 bg-gray-200 flex items-center justify-center">No hay imágenes</div>}
            </Carousel>

            <div>
              <p className="text-gray-600 mb-4">{product.descripcion}</p>
              <p className="text-lg font-bold text-gold-600 mb-4">S./ {totalPrice}</p>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-pink-800">Selecciona Modelo:</h3>
                <div className="flex space-x-2 mt-2">
                  {product.modelos?.map((model) => (
                    <button
                      key={model.idModelo}
                      onClick={() => handleModelChange(model)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedModel.idModelo === model.idModelo
                          ? 'bg-pink-600 text-white'
                          : 'bg-pink-200 text-pink-800 hover:bg-pink-300'
                      } transition`}
                    >
                      {model.nombreModelo}
                    </button>
                  )) || <p className="text-sm text-gray-600">No hay modelos disponibles</p>}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Stock: {selectedModel.stock?.cantidad || 0} unidades
              </p>

              <div className="mb-4 flex items-center">
                <label className="text-sm font-semibold text-pink-800 mr-4">Cantidad:</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleQuantityDecrement}
                    disabled={quantity <= 1 || isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium text-gray-700 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleQuantityIncrement}
                    disabled={quantity >= (selectedModel.stock?.cantidad || 0) || isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-pink-800 mb-2">Características:</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {showFullCharacteristics
                    ? product.caracteristicas
                    : `${product.caracteristicas?.substring(0, 100)}${
                        product.caracteristicas?.length > 100 ? '...' : ''
                      }` || 'No hay características disponibles'}
                </p>
                {product.caracteristicas?.length > 100 && (
                  <button
                    onClick={toggleCharacteristics}
                    className="text-sm text-pink-600 hover:text-pink-800 underline"
                  >
                    {showFullCharacteristics ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Add to Cart Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 sm:static sm:border-t-0 sm:p-0 sm:mt-4">
            <button
              onClick={handleAddToCart}
              disabled={selectedModel.stock?.cantidad <= 0 || isLoading}
              className={`w-full py-2 rounded text-white transition ${
                selectedModel.stock?.cantidad <= 0 || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              {isLoading ? 'Agregando...' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          onClick={handleCloseLoginModal}
        >
          <div
            className="bg-white rounded-lg w-full mx-4 max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-pink-800">Iniciar sesión requerido</h3>
              <button
                onClick={handleCloseLoginModal}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;