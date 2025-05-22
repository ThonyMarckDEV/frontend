import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const ProductDetails = ({ product, isOpen, onClose }) => {
  const [selectedModel, setSelectedModel] = useState(product.selectedModel);
  const [quantity, setQuantity] = useState(1);
  const [showFullCharacteristics, setShowFullCharacteristics] = useState(false);

  const handleModelChange = (model) => {
    setSelectedModel(model);
    setQuantity(1);
  };

  const handleQuantityIncrement = () => {
    if (quantity < selectedModel.stock.cantidad) {
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

  if (!isOpen) return null;

  // Calculate total price based on quantity
  const totalPrice = (product.precio * quantity).toFixed(2);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 sm:items-center sm:justify-center"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg w-full mx-4 max-h-[90vh] sm:max-w-2xl sm:mx-auto ${
          showFullCharacteristics ? 'h-full sm:h-auto' : 'h-auto'
        } overflow-y-auto sm:overflow-y-auto relative`}
        onClick={handleModalBodyClick}
      >
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 sm:static sm:border-b sm:z-auto">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-2xl font-serif text-pink-800">{product.nombreProducto}</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 pt-20 sm:pt-6">
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
            {selectedModel.imagenes.map((image) => (
              <div key={image.idImagen} className="h-80">
                <img
                  src={image.urlImagen}
                  alt={product.nombreProducto}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found')}
                />
              </div>
            ))}
          </Carousel>

          <div>
            <p className="text-gray-600 mb-4">{product.descripcion}</p>
            <p className="text-lg font-bold text-gold-600 mb-4">${totalPrice}</p>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-pink-800">Selecciona Modelo:</h3>
              <div className="flex space-x-2 mt-2">
                {product.modelos.map((model) => (
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
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Stock: {selectedModel.stock.cantidad} unidades
            </p>

            <div className="mb-4 flex items-center">
              <label className="text-sm font-semibold text-pink-800 mr-4">Cantidad:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleQuantityDecrement}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  −
                </button>
                <span className="text-lg font-medium text-gray-700 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleQuantityIncrement}
                  disabled={quantity >= selectedModel.stock.cantidad}
                  className="w-10 h-10 flex items-center justify-center bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Características Section */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-pink-800 mb-2">Características:</h3>
              <p className="text-sm text-gray-500 mb-2">
                {showFullCharacteristics
                  ? product.caracteristicas
                  : `${product.caracteristicas.substring(0, 100)}${
                      product.caracteristicas.length > 100 ? '...' : ''
                    }`}
              </p>
              {product.caracteristicas.length > 100 && (
                <button
                  onClick={toggleCharacteristics}
                  className="text-sm text-pink-600 hover:text-pink-800 underline"
                >
                  {showFullCharacteristics ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>

            <button className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;