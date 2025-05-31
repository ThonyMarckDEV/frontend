import React from 'react';

const CartSummary = ({ cartDetails, calculateTotal, pendingUpdates, navigate, isOpen, toggleSummary }) => {
  const isPending = Object.keys(pendingUpdates).length > 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-pink-200 shadow-2xl transition-transform duration-300 ease-in-out z-[9999] ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2rem)]'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="relative w-full">
          {/* Toggle Handle with Chevron Arrow */}
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
          {/* Summary Content */}
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
                onClick={() => navigate('/checkout')}
                disabled={isPending}
                className="w-full py-3 bg-pink-300 hover:bg-pink-400 text-white font-light tracking-[0.15em] uppercase text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isPending ? 'Procesando...' : 'Finalizar Compra'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
