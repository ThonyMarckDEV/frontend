// src/components/Reutilizables/NetworkError.jsx
import React from 'react';
import { WifiOff } from 'lucide-react';

const NetworkError = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <WifiOff className="w-16 h-16 text-gray-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        No hay conexión con el servidor
      </h3>
      <p className="text-gray-600 max-w-md">
        Por favor, verifica tu conexión a internet e intenta de nuevo.
      </p>
    </div>
  );
};

export default NetworkError;