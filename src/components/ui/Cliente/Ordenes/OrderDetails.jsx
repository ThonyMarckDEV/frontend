import React from 'react';
import noProductImage from '../../../../img/utilidades/noproduct.webp';

const OrderDetails = ({ order, isExpanded }) => {
  // Ensure order.detalles is an array to prevent errors
  const detalles = Array.isArray(order?.detalles) ? order.detalles : [];

  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[1000px]' : 'max-h-0'
      }`}
    >
      <div className="bg-gradient-to-br from-white via-rose-40 to-purple-50 border-t-2 border-pink-100">
        <div className="p-6">
          {/* Header elegante */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
              </svg>
            </div>
            <h3 className="text-lg font-light text-gray-700 tracking-[0.15em] uppercase">
              Productos
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent"></div>
          </div>

          {/* Lista de productos con scroll si hay más de 2 */}
          <div
            className={`space-y-4 ${
              detalles.length > 2
                ? 'max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-rose-50 scrollbar-thumb-rounded-full'
                : ''
            }`}
          >
            {detalles.map((detail, detailIndex) => (
              <div
                key={detail.idDetallePedido}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-pink-100 shadow-md hover:shadow-lg transition-all duration-300 hover:border-pink-200"
                style={{
                  animationDelay: `${detailIndex * 100}ms`,
                  animation: isExpanded ? 'slideInUp 0.6s ease-out forwards' : 'none',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Imagen del producto */}
                  <div className="relative">
                    <img
                      src={detail.modelo?.imagen || noProductImage}
                      alt={detail.producto?.nombreProducto || 'Producto'}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-pink-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.target.src = noProductImage)}
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">{detail.cantidad}</span>
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-base font-medium text-gray-800 leading-tight">
                      {detail.producto?.nombreProducto || 'Sin nombre'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-xs font-medium rounded-full border border-pink-200">
                        {detail.modelo?.nombreModelo || 'Sin modelo'}
                      </span>
                    </div>

                    {/* Precios en layout horizontal */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">S./ {detail.producto?.precio || '0.00'}</span>
                        <span className="text-gray-400 ml-1">× {detail.cantidad}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-800">
                          S./ {detail.subtotal || '0.00'}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Subtotal
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Separador decorativo */}
          <div className="flex items-center justify-center mt-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-300 rounded-full opacity-60"></div>
              <div className="w-1 h-1 bg-rose-300 rounded-full opacity-40"></div>
              <div className="w-2 h-2 bg-purple-300 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed style tag with jsx="true" */}
      <style jsx="true">{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;