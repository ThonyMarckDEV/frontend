import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../../components/Home/ProductsUIComponents/ProductCard';
import ProductDetail from '../../../components/Home/ProductsUIComponents/ProductDetail';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../../../js/urlHelper';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/products?page=${page}`;
      console.log('Fetching from:', url);
      const response = await axios.get(url, { timeout: 5000 });
      console.log('API response:', response.data);
      const result = response.data;
      if (result.success) {
        setProducts(
          result.data.data.map((prod) => ({
            idProducto: prod.idProducto,
            nombreProducto: prod.nombreProducto,
            descripcion: prod.descripcion,
            precio: prod.precio,
            caracteristicas: prod.caracteristicas,
            models: prod.modelos.map((model) => ({
              idModelo: model.idModelo,
              nombreModelo: model.nombreModelo,
              urlModelo: model.urlModelo || 'https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled.png',
              stock: model.stock || { cantidad: 0 },
            })),
          }))
        );
        setCurrentPage(result.data.current_page);
        setTotalPages(result.data.last_page);
      } else {
        setError(result.message || 'Error fetching products');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      console.log('Fetch complete, loading:', false);
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  console.log('Rendering products:', products);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <header className="bg-white shadow-lg border-b-4 border-pink-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
              ✨ MELYMARCKSTORE ✨
            </h1>
            <p className="text-pink-600 mt-2 text-lg">Descubre tu belleza natural</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.idProducto}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))
          ) : (
            <p className="text-center text-gray-600">No products to display</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 rounded-lg bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 rounded-lg bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Siguiente
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Products;