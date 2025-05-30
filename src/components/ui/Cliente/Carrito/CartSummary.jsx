import React from 'react';

const CartSummary = ({ cartDetails, calculateTotal, pendingUpdates, navigate }) => {
  return (
    <div className="lg:w-1/3">
      <div className="bg-white rounded-2xl border border-pink-100 shadow-lg p-6 sticky top-4">
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
              {Object.keys(pendingUpdates).length > 0 && (
                <div className="text-xs text-pink-300 animate-pulse mt-1">
                  Actualizando...
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            disabled={Object.keys(pendingUpdates).length > 0}
            className="w-full py-3 bg-pink-300 hover:bg-pink-400 text-white font-light tracking-[0.15em] uppercase text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {Object.keys(pendingUpdates).length > 0 ? 'Procesando...' : 'Finalizar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;