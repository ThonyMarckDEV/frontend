import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ProductDetails from './ProductDetails';

const ProductCard = ({ product }) => {
  const [selectedModel, setSelectedModel] = useState(product.modelos[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCarouselClick = (e) => {
    e.stopPropagation(); 
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 cursor-pointer"
        onClick={openModal}
      >
        <div onClick={handleCarouselClick}>
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
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found')}
                />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-serif text-pink-800 mb-2">{product.nombreProducto}</h2>
          <p className="text-gray-600 mb-4">{product.descripcion}</p>
          <p className="text-lg font-bold text-gold-600 mb-4">S./ {product.precio.toFixed(2)}</p>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-pink-800">Select Model:</h3>
            <div className="flex space-x-2 mt-2">
              {product.modelos.map((model) => (
                <button
                  key={model.idModelo}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModelChange(model);
                  }}
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

          <p className="text-sm text-gray-600">
            Stock: {selectedModel.stock.cantidad} units
          </p>
        </div>
      </div>

      <ProductDetails
        product={{ ...product, selectedModel }} // Pass product with selected model
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default ProductCard;