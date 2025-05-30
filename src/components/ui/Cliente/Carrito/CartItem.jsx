import React from 'react';
import noProductsImage from '../../../../img/utilidades/noproduct.webp';

const CartItem = ({ detail, index, handleQuantityChange, handleQuantityInputChange, handleRemoveItem, pendingUpdates }) => {
  return (
    <div
      className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-pink-50 p-4 animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
  );
};

export default CartItem;