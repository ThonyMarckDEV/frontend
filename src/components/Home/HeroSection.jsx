import React from 'react';

const HeroSection = ({ isVisible }) => {
  return (
    <div className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="relative bg-pink-50">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Descubre Tu Estilo</h2>
            <p className="text-lg text-gray-600 mb-6">Encuentra las últimas tendencias en ropa y maquillaje para expresar tu belleza única.</p>
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition">Comprar Ahora</button>
              <button className="px-6 py-2 border border-pink-500 text-pink-500 rounded hover:bg-pink-50 transition">Colección</button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/api/placeholder/600/400" 
                alt="Modelo con ropa de colección" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded shadow-md">
              <p className="text-xl font-bold text-pink-500">Nueva Colección</p>
              <p className="text-gray-600">Primavera 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;