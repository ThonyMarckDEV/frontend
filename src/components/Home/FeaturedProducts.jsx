import React from 'react';
import { ShoppingBag, Heart, Search } from 'lucide-react';

const FeaturedProducts = ({ isVisible }) => {
  const products = [
    { name: "Vestido Floral", price: "149.99", image: "/api/placeholder/300/400", isNew: true, discount: null },
    { name: "Set de Maquillaje", price: "79.99", image: "/api/placeholder/300/400", isNew: false, discount: "20%" },
    { name: "Bolso Elegante", price: "89.99", image: "/api/placeholder/300/400", isNew: true, discount: null },
    { name: "Zapatos de Tacón", price: "129.99", image: "/api/placeholder/300/400", isNew: false, discount: "15%" }
  ];

  return (
    <div className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="bg-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Productos Destacados</h2>
            <a href="#" className="text-pink-500 hover:text-pink-600 transition flex items-center">
              Ver Todo <span className="ml-2">→</span>
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden group">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-64 object-cover"
                  />
                  {product.isNew && (
                    <span className="absolute top-4 left-4 bg-pink-500 text-white px-2 py-1 text-xs rounded">Nuevo</span>
                  )}
                  {product.discount && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 text-xs rounded">-{product.discount}</span>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white p-2 rounded-full mx-1 hover:bg-pink-100 transition">
                      <ShoppingBag size={18} className="text-gray-800" />
                    </button>
                    <button className="bg-white p-2 rounded-full mx-1 hover:bg-pink-100 transition">
                      <Heart size={18} className="text-gray-800" />
                    </button>
                    <button className="bg-white p-2 rounded-full mx-1 hover:bg-pink-100 transition">
                      <Search size={18} className="text-gray-800" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                  <p className="text-pink-500 font-bold mt-1">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;