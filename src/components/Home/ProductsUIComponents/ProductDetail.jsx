import React, { useState } from 'react';
import { X, Heart, ShoppingCart, Plus, Minus, Star, Share2 } from 'lucide-react';

const ProductDetail = ({ product, onClose }) => {
  const [selectedModel, setSelectedModel] = useState(product.modelos[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleModelChange = (model) => {
    setSelectedModel(model);
    setImageLoading(true);
    setQuantity(1); // Reset quantity when changing model
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= selectedModel.stock.cantidad) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log('Agregado al carrito:', {
      product,
      model: selectedModel,
      quantity
    });
    // Aquí iría la lógica para agregar al carrito
    onClose();
  };

  const getStockStatus = (cantidad) => {
    if (cantidad === 0) return { text: 'Agotado', color: 'text-red-500', bg: 'bg-red-100' };
    if (cantidad < 10) return { text: 'Pocas unidades', color: 'text-orange-500', bg: 'bg-orange-100' };
    return { text: 'Disponible', color: 'text-green-500', bg: 'bg-green-100' };
  };

  const stockStatus = getStockStatus(selectedModel.stock.cantidad);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-pink-100 p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-800">Detalles del Producto</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-full hover:bg-pink-50 transition-colors duration-200"
            >
              <Heart 
                className={`w-6 h-6 transition-colors duration-200 ${
                  isLiked ? 'text-pink-600 fill-pink-600' : 'text-pink-400'
                }`} 
              />
            </button>
            <button className="p-2 rounded-full hover:bg-pink-50 transition-colors duration-200">
              <Share2 className="w-6 h-6 text-pink-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-pink-50 transition-colors duration-200"
            >
              <X className="w-6 h-6 text-pink-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-50">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-pink-50">
                    <div className="w-12 h-12 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={selectedModel.urlModelo || "/api/placeholder/500/500"}
                  alt={product.nombreProducto}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                />
                
                {/* Stock badge */}
                <div className={`absolute top-4 left-4 px-3 py-2 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                  {stockStatus.text}
                </div>
              </div>

              {/* Model thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {product.modelos.map((model) => (
                  <button
                    key={model.idModelo}
                    onClick={() => handleModelChange(model)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedModel.idModelo === model.idModelo
                        ? 'border-pink-500 ring-2 ring-pink-200'
                        : 'border-pink-200 hover:border-pink-300'
                    }`}
                  >
                    <img
                      src={model.urlModelo || "/api/placeholder/100/100"}
                      alt={model.nombreModelo}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {product.nombreProducto}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.8) • 127 reseñas</span>
                </div>

                <p className="text-xl font-bold text-pink-600 mb-4">
                  ${product.precio}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.descripcion}
                </p>
              </div>

              {/* Characteristics */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Características</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.caracteristicas}
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Modelo: {selectedModel.nombreModelo}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.modelos.map((model) => (
                    <button
                      key={model.idModelo}
                      onClick={() => handleModelChange(model)}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedModel.idModelo === model.idModelo
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-pink-200 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                    >
                      <div className="font-medium">{model.nombreModelo}</div>
                      <div className="text-sm text-gray-600">
                        Stock: {model.stock.cantidad}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Cantidad</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-pink-200 rounded-xl">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl transition-colors duration-200"
                    >
                      <Minus className="w-5 h-5 text-pink-600" />
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-800 min-w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= selectedModel.stock.cantidad}
                      className="p-2 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl transition-colors duration-200"
                    >
                      <Plus className="w-5 h-5 text-pink-600" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Disponible: {selectedModel.stock.cantidad} unidades
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-pink-600">
                    ${(product.precio * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={selectedModel.stock.cantidad === 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>
                    {selectedModel.stock.cantidad === 0 ? 'Agotado' : 'Agregar al carrito'}
                  </span>
                </button>
                
                <button className="w-full bg-white border-2 border-pink-500 text-pink-600 hover:bg-pink-50 font-medium py-4 px-6 rounded-xl transition-all duration-200">
                  Comprar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;