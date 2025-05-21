import React from 'react';

const Categories = ({ isVisible }) => {
  const categories = [
    { name: "Vestidos", image: "/api/placeholder/300/400" },
    { name: "Maquillaje", image: "/api/placeholder/300/400" },
    { name: "Accesorios", image: "/api/placeholder/300/400" },
    { name: "Calzado", image: "/api/placeholder/300/400" }
  ];

  return (
    <div className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nuestras Categorías</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg shadow-md transition-transform transform hover:scale-105">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 w-full">
                  <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  <button className="mt-2 text-white hover:text-pink-300 transition flex items-center">
                    Explorar <span className="ml-2">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;