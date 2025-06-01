import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import noProductImage from '../../../../img/utilidades/noproduct.webp';
import { motion, AnimatePresence } from 'framer-motion';
import yapeQR from '../../../../img/payment/ThonyMarckQR.jpg';
import CancelOrder from '../../../../components/ui/Cliente/Ordenes/CancelOrder';

const CheckOrder = ({ orderId, order, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('Depósito Bancario');
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setReceiptFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        toast.error('Por favor, sube una imagen válida (JPG, PNG, etc.)');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      toast.error('Por favor, selecciona un método de pago');
      return;
    }
    if (!receiptFile) {
      toast.error('Por favor, adjunta el comprobante de pago');
      return;
    }

    if (!formRef.current) {
      console.warn('Form is not connected to the DOM');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('paymentMethod', paymentMethod);
      formData.append('receipt', receiptFile);

      const response = await fetchWithAuth(`${API_BASE_URL}/api/upload-receipt`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Comprobante enviado exitosamente');
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        toast.error(data?.message || 'Error al enviar el comprobante');
      }
    } catch (err) {
      console.error('Error uploading receipt:', err);
      toast.error('Error al enviar el comprobante');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm max-sm:items-stretch"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-white rounded-3xl max-w-4xl w-full mx-4 shadow-2xl border border-pink-100 max-sm:h-full max-sm:rounded-none max-sm:m-0"
        >
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full max-sm:h-full">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-3xl pt-8 px-8 max-sm:border-b max-sm:border-pink-100">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <motion.h2
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl font-light text-gray-800 tracking-wide"
                  >
                    Subir Comprobante - Pedido #{orderId}
                  </motion.h2>
                  <div className="w-16 h-px bg-pink-300 mx-auto mt-2"></div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeCap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <p className="text-lg font-medium text-gray-700">
                  Total: <span className="text-pink-600">S/ {order?.total ? parseFloat(order.total).toFixed(2) : '0.00'}</span>
                </p>
              </motion.div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 max-sm:pb-20">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 mb-3">
                    Método de Pago
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['Depósito', 'Yape'].map((method) => (
                      <motion.label
                        key={method}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio text-pink-600 focus:ring-pink-500 h-5 w-5"
                        />
                        <span className="text-sm text-gray-700 font-medium">{method}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <AnimatePresence>
                    {paymentMethod === 'Yape' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-pink-50 rounded-xl"
                      >
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Pagar con Yape</h3>
                        <p className="text-sm text-gray-600">Destinatario: Anthony Marck Mendoza Sanchez</p>
                        <img
                          src={yapeQR}
                          alt="Yape QR Code"
                          className="w-32 h-24 mx-auto mt-2 rounded-lg"
                        />
                      </motion.div>
                    )}
                    {paymentMethod === 'Depósito' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-gray-50 rounded-xl"
                      >
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Datos Bancarios</h3>
                        <p className="text-sm text-gray-600">Titular: Anthony Marck Mendoza Sanchez</p>
                        <p className="text-sm text-gray-600">Banco: BCP</p>
                        <p className="text-sm text-gray-600">Cuenta: 123-456-789</p>
                        <p className="text-sm text-gray-600">CCI: 002-123-4567890123-45</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 mb-3">
                    Comprobante de Pago
                  </label>
                  <motion.div
                    whileHover={{ borderColor: '#f472b6' }}
                    className="border-2 border-dashed border-pink-300 rounded-xl p-4 text-center cursor-pointer bg-pink-50/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded-lg"
                        onError={(e) => (e.target.src = noProductImage)}
                      />
                    ) : (
                      <div className="text-gray-400 font-light">
                        <motion.svg
                          initial={{ y: 0 }}
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-8 h-8 mx-auto mb-2 text-pink-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeCap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 12m4-8l4 8m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </motion.svg>
                        <span>Sube una imagen del comprobante</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
              >
                <p className="font-medium">
                  Advertencia: Subir comprobantes falsos o alterados resultará en la cancelación del pedido y posibles acciones legales. Un administrador verificará el pago.
                </p>
              </motion.div>
            </div>

            <div className="sticky bottom-0 z-10 bg-white rounded-b-3xl pt-4 pb-4 px-6 sm:px-8">
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Comprobante'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCancelModal(true)}
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancelar Pedido
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {showCancelModal && (
          <CancelOrder
            orderId={orderId}
            onClose={() => {
              setShowCancelModal(false);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

export default CheckOrder;