import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import noProductImage from '../../../../img/utilidades/noproduct.webp';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure this import is present
import yapeQR from '../../../../img/payment/ThonyMarckQR.jpg';

const CheckOrder = ({ orderId, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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
        onClose();
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-pink-100"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light text-gray-800 tracking-wide">
            Subir Comprobante - Pedido #{orderId}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Método de Pago
            </label>
            <div className="flex flex-wrap gap-4">
              {['Depósito Bancario', 'Yape'].map((method) => (
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
                    className="form-radio text-pink-500 focus:ring-pink-400 h-5 w-5"
                  />
                  <span className="text-sm text-gray-700 font-medium">{method}</span>
                </motion.label>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {paymentMethod === 'Yape' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-pink-50 rounded-xl"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pagar con Yape</h3>
                <p className="text-sm text-gray-600">Destinatario: Anthony Marck Mendoza Sanchez</p>
                <img
                  src={yapeQR}
                  alt="Yape QR Code"
                  className="w-32 h-32 mx-auto mt-2 rounded-lg shadow-sm"
                />
              </motion.div>
            )}
            {paymentMethod === 'Depósito Bancario' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-pink-50 rounded-xl"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Datos Bancarios</h3>
                <p className="text-sm text-gray-600">Titular: Anthony Marck Mendoza Sanchez</p>
                <p className="text-sm text-gray-600">Banco: BCP</p>
                <p className="text-sm text-gray-600">Cuenta: 123-456-789-012</p>
                <p className="text-sm text-gray-600">CCI: 002-123-456789012-34</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Comprobante de Pago
            </label>
            <motion.div
              whileHover={{ borderColor: '#f472b6' }}
              className="border-2 border-dashed border-pink-300 rounded-xl p-4 text-center cursor-pointer bg-pink-50/50 transition-colors duration-200"
              onClick={() => fileInputRef.current.click()}
            >
              {previewUrl ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={previewUrl}
                  alt="Vista previa del comprobante"
                  className="w-full h-48 object-contain rounded-lg shadow-sm"
                  onError={(e) => (e.target.src = noProductImage)}
                />
              ) : (
                <div className="text-gray-400 font-light">
                  <motion.svg
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-10 h-10 mx-auto mb-2 text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </motion.svg>
                  <span>Haz clic para subir una imagen del comprobante</span>
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

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-gradient-to-r from-pink-400 to-pink-600 text-white font-light rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Comprobante'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CheckOrder;