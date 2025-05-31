import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';
import { toast } from 'react-toastify';
import FetchWithGif from '../../../components/Reutilizables/FetchWithGif';
import NetworkError from '../../../components/Reutilizables/NetworkError';
import { QRCodeCanvas } from 'qrcode.react';
import noProductImage from '../../../img/utilidades/noproduct.webp';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/orders`);
      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(data.data);
        setIsNetworkError(false);
        setError(null);
      } else {
        setError(data?.message || 'Error al cargar los pedidos');
        setIsNetworkError(false);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.message.includes('Network Error') || err.name === 'TypeError') {
        setIsNetworkError(true);
      } else {
        setError('No se pudieron cargar los pedidos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrderDetails = (idPedido) => {
    setExpandedOrder(expandedOrder === idPedido ? null : idPedido);
  };

  if (loading) return <FetchWithGif />;
  if (isNetworkError) return <NetworkError />;
  if (error)
    return (
      <div className="text-center p-6 bg-white border border-pink-200 text-gray-800 rounded-xl shadow-lg mx-auto max-w-md">
        <div className="font-light tracking-wide">{error}</div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 text-gray-900">
      <div className="bg-white border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-thin text-gray-800 tracking-[0.2em] uppercase">
              Mis Pedidos
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent mx-auto mt-2"></div>
          </div>
        </div>
      </div>
      <div className="flex-grow py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-sm mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-thin text-gray-600 tracking-wide mb-3">
                  No tienes pedidos
                </h2>
                <p className="text-gray-400 font-light tracking-wide mb-6">
                  Explora nuestra colección para realizar tu primer pedido
                </p>
                <button
                  onClick={() => window.location.href = '/products'}
                  className="px-6 py-2.5 bg-pink-300 hover:bg-pink-400 text-white font-light tracking-[0.15em] uppercase text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Explorar Colección
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div
                  key={order.idPedido}
                  className="bg-white rounded-lg border border-pink-100 shadow-lg overflow-hidden"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-pink-50 transition-all duration-200"
                    onClick={() => toggleOrderDetails(order.idPedido)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-grow">
                        <h3 className="text-lg font-thin text-gray-800 tracking-widest uppercase">
                          Pedido #{order.idPedido}
                        </h3>
                        <p className="text-sm text-gray-600 font-light mt-1">
                          Fecha: {order.fecha_pedido}
                        </p>
                        <p className="text-sm text-gray-600 font-light">
                          Estado: <span className="text-pink-400">{order.estado}</span>
                        </p>
                        <p className="text-sm text-gray-600 font-light">
                          Total: S./ {order.total}
                        </p>
                        <p className="text-sm text-gray-600 font-light mt-2">
                          {order.direccion}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <QRCodeCanvas
                          value={String(order.idPedido)}
                          size={96}
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                          level="M"
                          className="rounded-lg border border-pink-200 shadow-sm"
                        />
                        <svg
                          className={`w-6 h-6 text-pink-400 transform transition-transform duration-300 ${
                            expandedOrder === order.idPedido ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      expandedOrder === order.idPedido ? 'max-h-[1000px]' : 'max-h-0'
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;