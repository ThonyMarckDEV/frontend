import React, { useState, useEffect, useMemo } from 'react';
import { fetchWithAuth } from '../../../js/authToken';
import API_BASE_URL from '../../../js/urlHelper';
import SECRET_KEY from '../../../js/qrHelper';
import { toast } from 'react-toastify';
import FetchWithGif from '../../../components/Reutilizables/FetchWithGif';
import NetworkError from '../../../components/Reutilizables/NetworkError';
import { QRCodeCanvas } from 'qrcode.react';
import noProductImage from '../../../img/utilidades/noproduct.webp';
import CryptoJS from 'crypto-js';
import jwtUtils from '../../../utilities/jwtUtils';
import OrderDetails from '../../../components/ui/Cliente/Ordenes/OrderDetails';
import CheckOrder from '../../../components/ui/Cliente/Ordenes/CheckOrder'; // Import CheckOrder

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQRContent, setModalQRContent] = useState('');
  const [isCheckOrderOpen, setIsCheckOrderOpen] = useState(false); // State for CheckOrder modal
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Track selected order for payment

  // Map status strings to names, GIFs, and colors
  const statusConfig = {
    'Pendiente de pago': { name: 'Pendiente de Pago', gif: pendingPayment, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'Aprobando pago': { name: 'Aprobando Pago', gif: approvingPayment, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'En preparación': { name: 'En Preparación', gif: inPreparation, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    'Enviado': { name: 'Enviado', gif: shipped, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    'Listo para recoger': { name: 'Listo para Recoger', gif: readyForPickup, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    'Cancelado': { name: 'Cancelado', gif: cancelled, color: 'bg-rose-100 text-rose-700 border-rose-200' },
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

  const userId = useMemo(() => {
    try {
      const token = jwtUtils.getAccessTokenFromCookie();
      return jwtUtils.getUserID(token) || 'unknown-user';
    } catch (err) {
      console.error('Error getting userId from JWT:', err);
      return 'unknown-user';
    }
  }, []);

  // Generate secure QR code content
  const generateSecureQRContent = (order) => {
    if (!SECRET_KEY) {
      return String(order.idPedido);
    }

    const payload = {
      idPedido: order.idPedido,
      userId,
      timestamp: order.fecha_pedido,
    };

    const payloadString = JSON.stringify(payload);
    try {
      const hash = CryptoJS.HmacSHA256(payloadString, SECRET_KEY).toString(CryptoJS.enc.Hex);
      return JSON.stringify({ payload: payloadString, hash });
    } catch (err) {
      return String(order.idPedido); // Fallback
    }
  };

  // Memoize QR content for each order
  const qrContentMap = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      if (order.recojo_local === 1) {
        map[order.idPedido] = generateSecureQRContent(order);
      }
    });
    return map;
  }, [orders, userId]);

  const openQRModal = (qrContent) => {
    setModalQRContent(qrContent);
    setIsModalOpen(true);
  };

  const closeQRModal = () => {
    setIsModalOpen(false);
    setModalQRContent('');
  };

  const openCheckOrderModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsCheckOrderOpen(true);
  };

  const closeCheckOrderModal = () => {
    setIsCheckOrderOpen(false);
    setSelectedOrderId(null);
    fetchOrders(); // Refresh orders after submission
  };

  if (loading) return <FetchWithGif />;
  if (isNetworkError) return <NetworkError />;
  if (error)
    return (
      <div className="text-center p-8 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 text-gray-700 rounded-3xl shadow-xl mx-auto max-w-md">
        <div className="font-medium text-lg mb-2">¡Oops!</div>
        <div className="font-light tracking-wide text-gray-600">{error}</div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-rose-50 text-gray-800">
      <div className="bg-white border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-light text-gray-700 tracking-wide mb-2">
              Mis Pedidos
            </h1>
            <div className="w-16 h-px bg-pink-300 mx-auto"></div>
          </div>
        </div>
      </div>

      <div className="flex-grow py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-sm mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-light text-gray-600 mb-3">
                  No tienes pedidos
                </h2>
                <p className="text-gray-400 font-light mb-6">
                  Explora nuestra colección para realizar tu primer pedido
                </p>
                <button
                  onClick={() => (window.location.href = '/products')}
                  className="px-6 py-3 bg-pink-300 hover:bg-pink-400 text-white font-light rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Explorar Colección
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.idPedido}
                  className="bg-white rounded-2xl border border-pink-100 shadow-lg hover:shadow-xl overflow-hidden relative min-h-[240px] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-3">
                    <img
                      src={statusConfig[order.estado]?.gif || noProductImage}
                      alt={statusConfig[order.estado]?.name || 'Estado desconocido'}
                      className="w-12 h-12 object-cover rounded-lg shadow-sm"
                    />
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        statusConfig[order.estado]?.color || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {statusConfig[order.estado]?.name || 'Estado desconocido'}
                    </span>
                  </div>

                  <div
                    className="p-6 pt-20 cursor-pointer hover:bg-pink-50 transition-colors duration-200"
                    onClick={() => toggleOrderDetails(order.idPedido)}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex-grow space-y-3">
                        <h3 className="text-lg font-light text-gray-700 tracking-wide">
                          Pedido #{order.idPedido}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-6 8h6m-9 4h12m-6 4h6" />
                            </svg>
                            <p className="text-sm text-gray-600">Fecha: {order.fecha_pedido}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <p className="text-sm text-gray-600">
                              Total: <span className="font-semibold text-gray-700">S./ {order.total}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm text-gray-600">{order.direccion}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-pink-100">
                        <div className="flex items-center gap-4">
                          {order.recojo_local === 1 && (
                            <div
                              className="bg-pink-50 p-3 rounded-xl cursor-pointer hover:bg-pink-100 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                openQRModal(qrContentMap[order.idPedido]);
                              }}
                            >
                              <QRCodeCanvas
                                value={qrContentMap[order.idPedido]}
                                size={80}
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                level="M"
                                className="rounded-lg"
                              />
                            </div>
                          )}
                          {order.estado === 'Pendiente de pago' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCheckOrderModal(order.idPedido);
                              }}
                              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white font-light rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-pink-400 hover:text-pink-500 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderDetails(order.idPedido);
                          }}
                        >
                          <span className="text-sm font-medium">
                            {expandedOrder === order.idPedido ? 'Ocultar' : 'Ver'} detalles
                          </span>
                          <svg
                            className={`w-4 h-4 transform transition-transform duration-300 ${
                              expandedOrder === order.idPedido ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <OrderDetails order={order} isExpanded={expandedOrder === order.idPedido} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-light text-gray-700">Código QR</h2>
              <button
                onClick={closeQRModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center">
              <QRCodeCanvas
                value={modalQRContent}
                size={200}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="M"
                className="rounded-lg"
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={closeQRModal}
                className="px-4 py-2 bg-pink-300 hover:bg-pink-400 text-white font-light rounded-full transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCheckOrderOpen && (
        <CheckOrder orderId={selectedOrderId} onClose={closeCheckOrderModal} />
      )}
    </div>
  );
};

export default Orders;