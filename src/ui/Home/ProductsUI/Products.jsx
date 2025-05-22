// src/components/Products.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../../components/Home/ProductsUIComponents/ProductCard';
import API_BASE_URL from '../../../js/urlHelper';
import Footer from '../../../components/Home/Footer';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products?page=${page}`);
      if (response.data.success) {
        setProducts(response.data.data.data);
        setCurrentPage(response.data.data.current_page);
        setLastPage(response.data.data.last_page);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="text-center text-pink-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-pink-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif text-pink-800 text-center mb-10">Our Luxurious Collection</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.idProducto} product={product} />
          ))}
        </div>
        {/* Pagination */}
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-pink-200 text-pink-800 rounded disabled:opacity-50 hover:bg-pink-300 transition"
          >
            Previous
          </button>
          {[...Array(lastPage).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => handlePageChange(page + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === page + 1
                  ? 'bg-pink-600 text-white'
                  : 'bg-pink-200 text-pink-800 hover:bg-pink-300'
              } transition`}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="px-4 py-2 bg-pink-200 text-pink-800 rounded disabled:opacity-50 hover:bg-pink-300 transition"
          >
            Next
          </button>
        </div>
      </div>

            <Footer />
    </div>
  );
};

export default Products;