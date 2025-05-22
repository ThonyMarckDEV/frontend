// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const ProductCard = ({ product }) => {
  const [selectedModel, setSelectedModel] = useState(product.modelos[0]); // Default to first model

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
      {/* Carousel for Images */}
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop
        useKeyboardArrows
        autoPlay
        interval={5000}
        showIndicators={true}
        dynamicHeight={false}
        className="relative"
      >
        {selectedModel.imagenes.map((image) => (
          <div key={image.idImagen} className="h-64">
            <img
              src={image.urlImagen}
              alt={product.nombreProducto}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = 'https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled.png')}
            />
          </div>
        ))}
      </Carousel>

      {/* Product Details */}
      <div className="p-6">
        <h2 className="text-2xl font-serif text-pink-800 mb-2">{product.nombreProducto}</h2>
        <p className="text-gray-600 mb-4">{product.descripcion}</p>
        <p className="text-lg font-bold text-gold-600 mb-4">${product.precio.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mb-4">{product.caracteristicas}</p>

        {/* Model Selection */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-pink-800">Select Model:</h3>
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

        {/* Stock Information */}
        <p className="text-sm text-gray-600">
          Stock: {selectedModel.stock.cantidad} units
        </p>
      </div>
    </div>
  );
};

export default ProductCard;