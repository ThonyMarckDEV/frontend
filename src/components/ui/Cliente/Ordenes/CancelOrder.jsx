import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const CancelOrder = ({ orderId, onClose, onOrderCancelled }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro de cancelar tu pedido?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f472b6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener pedido',
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/cancel-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          toast.success('Pedido cancelado exitosamente');
          onOrderCancelled(); // Refresh orders
          setTimeout(() => {
            onClose();
          }, 300);
        } else {
          toast.error(data?.message || 'Error al cancelar el pedido');
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
        toast.error('Error al cancelar el pedido');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
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
        className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl border border-pink-100 max-sm:h-full max-sm:rounded-none max-sm:m-0"
      >
        <div className="flex flex-col h-full max-sm:h-full">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-3xl pt-6 px-6 max-sm:border-b max-sm:border-pink-100">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <motion.h2
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-light text-gray-800 tracking-wide"
                >
                  Cancelar Pedido #{orderId}
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
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-sm text-gray-600 text-center">
              ¿Estás seguro de cancelar el pedido #{orderId}? Esta acción marcará el pedido como cancelado y no se puede deshacer.
            </p>
          </div>
          <div className="sticky bottom-0 z-10 bg-white rounded-b-3xl pt-4 pb-6 px-6 max-sm:border-t max-sm:border-pink-100">
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelOrder}
                disabled={isSubmitting}
                className={`px-6 py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white font-light rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-light rounded-full transition-all duration-300"
              >
                Mantener Pedido
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CancelOrder;