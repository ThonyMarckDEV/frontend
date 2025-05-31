import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../../context/CartContext';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import jwtUtils from '../../../../utilities/jwtUtils';
import { toast } from 'react-toastify';
import FetchWithGif from '../../../../components/Reutilizables/FetchWithGif';

const CartSummary = ({ cartDetails, calculateTotal, pendingUpdates, isOpen, toggleSummary, pickupMethod, selectedAddress }) => {
  const navigate = useNavigate();
  const { updateCartCount } = useContext(CartContext);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const isPending = Object.keys(pendingUpdates).length > 0;
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const idCarrito = jwtUtils.getIdCarrito(refresh_token);

  const handleCheckout = async () => {
    if (pickupMethod === 'delivery' && !selectedAddress) {
      toast.error('Por favor, seleccione una dirección para el envío.');
      return;
    }

    setIsLoading(true); // Show loading GIF

    try {
      const idDireccion = pickupMethod === 'delivery' ? selectedAddress : null;

      const response = await fetchWithAuth(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCarrito,
          pickupMethod,
          idDireccion: pickupMethod === 'delivery' ? idDireccion : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('¡Pedido creado exitosamente!');
        await updateCartCount(); // Update cart count to reflect empty cart
      //  navigate('/order-confirmation', { state: { order: data.data } });
      } else {
        toast.error(data.message || 'Error al crear el pedido');
      }
    } catch (err) {
      toast.error('Error al procesar el pedido: ' + err.message);
    } finally {
      setIsLoading(false); // Hide loading GIF
    }
  };

  return (
    <>
      {isLoading && <FetchWithGif />}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-pink-200 shadow-2xl transition-transform duration-300 ease-in-out z-[9999] ${
          isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2rem)]'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="relative w-full">
            <button
              onClick={toggleSummary}
              className="w-full py-2 flex justify-center items-center bg-pink-400 border-b border-pink-100"
              aria-label={isOpen ? 'Ocultar resumen' : 'Mostrar resumen'}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}
                />
              </svg>
            </button>
            <div className="p-6">
              <h3 className="text-lg font-thin text-gray-800 tracking-widest uppercase mb-4 text-center">
                Resumen
              </h3>
              <div className="border-t border-pink-100 pt-4">
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-base font-light text-gray-600">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-thin text-pink-400">
                      S./ {calculateTotal()}
                    </div>
                    {isPending && (
                      <div className="text-xs text-pink-300 animate-pulse mt-1">
                        Actualizando...
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isPending || (pickupMethod === 'delivery' && !selectedAddress)}
                  className="w-full py-3 bg-pink-300 hover:bg-pink-400 text-white font-light tracking-[0.15em] uppercase text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isPending ? 'Procesando...' : 'Finalizar Compra'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSummary;