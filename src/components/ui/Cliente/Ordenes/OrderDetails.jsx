import React from 'react';
import noProductImage from '../../../../img/utilidades/noproduct.webp';

const OrderDetails = ({ order, isExpanded }) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[1000px]' : 'max-h-0'
      }`}
    >
      <div className="p-6 bg-pink-50 border-t border-pink-200">
        <h3 className="text-lg font-thin text-gray-700 tracking-widest uppercase mb-4">
          Productos
        </h3>
        {order.detalles.map((detail, detailIndex) => (
          <div
            key={detail.idDetallePedido}
            className="flex items-center gap-4 bg-white rounded-lg p-4 mb-3 border border-pink-100 shadow-sm animate-slideIn"
            style={{ animationDelay: `${detailIndex * 100}ms` }}
          >
            <img
              src={detail.modelo.imagen || noProductImage}
              alt={detail.producto.nombreProducto}
              className="w-16 h-16 object-cover rounded-lg border border-pink-200"
              onError={(e) => (e.target.src = noProductImage)}
            />
            <div className="flex-grow">
              <p className="text-sm font-light text-gray-800">
                {detail.producto.nombreProducto}
              </p>
              <p className="text-xs text-gray-600 font-light">
                Modelo: {detail.modelo.nombreModelo}
              </p>
              <p className="text-xs text-gray-600 font-light">
                Cantidad: {detail.cantidad}
              </p>
              <p className="text-xs text-gray-600 font-light">
                Precio Unitario: S./ {detail.producto.precio}
              </p>
              <p className="text-sm text-pink-400 font-light mt-1">
                Subtotal: S./ {detail.subtotal}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetails;