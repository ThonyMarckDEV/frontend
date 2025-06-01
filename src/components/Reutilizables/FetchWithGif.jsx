import React from 'react';
import loadingGif from '../../img/utilidades/loading.gif';

const FetchWithGif = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <img
        src={loadingGif}
        alt="Loading..."
        className="w-32 h-32 object-contain"
      />
    </div>
  );
};

export default FetchWithGif;