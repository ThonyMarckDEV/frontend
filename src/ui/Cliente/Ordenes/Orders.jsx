import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';
import { toast } from 'react-toastify';
import FetchWithGif from '../../../components/Reutilizables/FetchWithGif';
import NetworkError from '../../../components/Reutilizables/NetworkError';
import { QRCodeCanvas } from 'qrcode.react';
import noProductImage from '../../../img/utilidades/noproduct.webp';
import CollapsibleOrderDetails from '../../../components/ui/Cliente/Ordenes/OrderDetails';

// Import status GIFs
import pendingPayment from '../../../img/states/pending_payment.gif';
import approvingPayment from '../../../img/states/approving_payment.gif';
import inPreparation from '../../../img/states/in_preparation.gif';
import shipped from '../../../img/states/shipped.gif';
import readyForPickup from '../../../img/states/ready_for_pickup.gif';
import cancelled from '../../../img/states/cancelled.gif';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Map status strings to names and GIFs, matching backend getEstadoText
  const statusConfig = {
    'Pendiente de pago': { name: 'Pendiente de Pago', gif: pendingPayment },
    'Aprobando pago': { name: 'Aprobando Pago', gif: approvingPayment },
    'En preparación': { name: 'En Preparación', gif: inPreparation },
    'Enviado': { name: 'Enviado', gif: shipped },
    'Listo para recoger': { name: 'Listo para Recoger', gif: readyForPickup },
    'Cancelado': { name: 'Cancelado', gif: cancelled }
  };

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
                  className="bg-white rounded-lg border border-pink-100 shadow-lg overflow-hidden relative"
                >
                  {/* Status badge with larger GIF in top-right corner */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <img
                      src={statusConfig[order.estado]?.gif || noProductImage}
                      alt={statusConfig[order.estado]?.name || 'Estado desconocido'}
                      className="w-16 h-16 object-cover rounded-md" // Changed to object-cover for uniform size
                    />
                    <span className="text-sm font-light text-pink-400 bg-pink-50 px-3 py-1 rounded-full shadow-sm">
                      {statusConfig[order.estado]?.name || 'Estado desconocido'}
                    </span>
                  </div>

                  <div
                    className="p-6 cursor-pointer hover:bg-pink-50 transition-all duration-200"
                    onClick={() => toggleOrderDetails(order.idPedido)}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex-grow space-y-2">
                        <h3 className="text-lg font-thin text-gray-800 tracking-widest uppercase">
                          Pedido #{order.idPedido}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-6 8h6m-9 4h12m-6 4h6" />
                            </svg>
                            <p className="text-sm text-gray-600 font-light">
                              Fecha: {order.fecha_pedido}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m4-4H8m-4 8h16M4 4h16v4H4z" />
                            </svg>
                            <p className="text-sm text-gray-600 font-light">
                              Total: S./ {order.total}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L12 21m0 0l-5.657-4.343M12 21V3m5.657 13.657l3.536-3.536m-12.728 0l3.536 3.536M12 3h9m-9 0H3" />
                            </svg>
                            <p className="text-sm text-gray-600 font-light">
                              {order.direccion}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* QR Code and Arrow moved below order details */}
                      <div className="flex justify-end items-center gap-4 mt-4">
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
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click from triggering
                            toggleOrderDetails(order.idPedido);
                          }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <CollapsibleOrderDetails
                    order={order}
                    isExpanded={expandedOrder === order.idPedido}
                  />
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