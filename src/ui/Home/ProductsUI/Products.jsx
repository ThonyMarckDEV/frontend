// src/components/Home/ProductsUIComponents/ProductsUI.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../../components/Home/ProductsUIComponents/ProductCard';
import API_BASE_URL from '../../../js/urlHelper';
import Footer from '../../../components/Home/Footer';
import FetchWithGif from '../../../components/Reutilizables/FetchWithGif';
import NetworkError from '../../../components/Reutilizables/NetworkError'; // Import NetworkError
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import noProductsImage from '../../../img/utilidades/noproduct.png';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false); // New state for network errors
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: '',
    subcategoryId: '',
    name: '',
    minPrice: '',
    maxPrice: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId, subcategoryId } = useParams();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        if (response.data.success) {
          setCategories(response.data.data);
          setIsNetworkError(false);
        } else {
          setError('Error fetching categories');
          setIsNetworkError(false);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (err.message.includes('Network Error') || !err.response) {
          setIsNetworkError(true);
        } else {
          setError('Failed to load categories. Please try again later.');
          setIsNetworkError(false);
        }
      }
    };
    fetchCategories();
  }, []);

  // Sync filters with URL parameters and fetch products on mount or URL change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      categoryId: categoryId || '',
      subcategoryId: subcategoryId || '',
      name: params.get('name') || '',
      minPrice: params.get('min_price') || '',
      maxPrice: params.get('max_price') || '',
    };
    setFilters(newFilters);
    setProducts([]); // Clear products to prevent stale data
    setLoading(true); // Ensure loading state
    if (newFilters.categoryId) {
      fetchSubcategories(newFilters.categoryId);
    } else {
      setSubcategories([]);
      setSubcategoriesLoading(false);
    }
    fetchProducts(1, newFilters);
  }, [categoryId, subcategoryId, location.search]);

  // Fetch subcategories when category changes
  const fetchSubcategories = async (categoryId) => {
    try {
      setSubcategoriesLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/subcategories?category_id=${categoryId}`);
      if (response.data.success) {
        setSubcategories(response.data.data);
        setIsNetworkError(false);
      } else {
        setSubcategories([]);
        setError('Error fetching subcategories');
        setIsNetworkError(false);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      if (err.message.includes('Network Error') || !err.response) {
        setIsNetworkError(true);
      } else {
        setError('Failed to load subcategories. Please try again later.');
        setIsNetworkError(false);
      }
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  // Fetch products based on provided filters and page
  const fetchProducts = async (page = 1, appliedFilters = filters) => {
    try {
      setLoading(true);
      const { categoryId, subcategoryId, name, minPrice, maxPrice } = appliedFilters;
      const query = new URLSearchParams();
      if (name) query.set('name', name);
      if (minPrice) query.set('min_price', minPrice);
      if (maxPrice) query.set('max_price', maxPrice);
      const url = `${API_BASE_URL}/api/products?page=${page}${categoryId ? `&category_id=${categoryId}` : ''}${subcategoryId ? `&subcategory_id=${subcategoryId}` : ''}&${query.toString()}`;
      const response = await axios.get(url);
      if (response.data.success) {
        setProducts(response.data.data.data);
        setCurrentPage(response.data.data.current_page);
        setLastPage(response.data.data.last_page);
        setIsNetworkError(false);
      } else {
        setError('No se pudieron cargar los productos');
        setProducts([]);
        setIsNetworkError(false);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      if (err.message.includes('Network Error') || !err.response) {
        setIsNetworkError(true);
      } else {
        setError('Error al cargar los productos');
        setProducts([]);
        setIsNetworkError(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when page changes
  useEffect(() => {
    if (!loading) {
      fetchProducts(currentPage);
    }
  }, [currentPage]);

  // Handle filter changes (update state without fetching)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'categoryId') {
        newFilters.subcategoryId = '';
        if (value) {
          fetchSubcategories(value);
        } else {
          setSubcategories([]);
          setSubcategoriesLoading(false);
        }
      }
      return newFilters;
    });
  };

  // Apply filters, update URL, and fetch products
  const applyFilters = () => {
    const { categoryId, subcategoryId, name, minPrice, maxPrice } = filters;
    const query = new URLSearchParams();
    if (name) query.set('name', name);
    if (minPrice) query.set('min_price', minPrice);
    if (maxPrice) query.set('max_price', maxPrice);
    const subcategoryName = subcategories.find((sub) => sub.idSubCategoria === parseInt(subcategoryId))?.nombreSubCategoria || '';
    let path = '/products';
    if (categoryId) {
      path += `/${categoryId}`;
      if (subcategoryId) {
        path += `/${subcategoryId}`;
      }
    }
    navigate(`${path}?${query.toString()}`, { state: { subcategoryName }, replace: false });
    setCurrentPage(1);
    setIsFilterOpen(false);
    setProducts([]);
    fetchProducts(1, filters);
  };

  // Clear filters
  const clearFilters = () => {
    const newFilters = {
      categoryId: '',
      subcategoryId: '',
      name: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(newFilters);
    setSubcategories([]);
    setSubcategoriesLoading(false);
    navigate('/products', { replace: false });
    setCurrentPage(1);
    setIsFilterOpen(false);
    setProducts([]);
    fetchProducts(1, newFilters);
  };

  // Toggle filter sidebar
  const toggleFilterSidebar = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  if (loading) return <FetchWithGif />;
  if (isNetworkError) return <NetworkError />; // Use NetworkError component
  if (error) return <div className="text-center text-red-600">{error}</div>; // Fallback for other errors

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <div className="flex-grow py-10 relative">
        <div className="container mx-auto px-4">
          <button
            onClick={toggleFilterSidebar}
            className="fixed top-[80px] right-4 z-50 p-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
            aria-label="Toggle filter sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>

          <h1 className="text-4xl font-serif text-pink-400 text-center mb-10">Nuestra Colección</h1>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.idProducto} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-pink-600">
              <img
                src={noProductsImage}
                alt="No products found"
                className="w-64 max-w-xs mb-4"
              />
              <p>No se encontraron productos con los filtros seleccionados, prueba con otra cosa o algo así.</p>
            </div>
          )}

          {products.length > 0 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-pink-200 text-pink-800 rounded disabled:opacity-50 hover:bg-pink-300 transition"
              >
                Anterior
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
                Siguiente
              </button>
            </div>
          )}
        </div>

        {isFilterOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleFilterSidebar}></div>
            <div className="fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-bold text-pink-800">Filtros</h3>
                  <button
                    onClick={toggleFilterSidebar}
                    className="text-gray-600 hover:text-gray-800 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-pink-800">Categoría</label>
                    <select
                      name="categoryId"
                      value={filters.categoryId}
                      onChange={handleFilterChange}
                      className="w-full mt-2 p-2 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-600"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map((category) => (
                        <option key={category.idCategoria} value={category.idCategoria}>
                          {category.nombreCategoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-pink-800">Subcategoría</label>
                    <select
                      name="subcategoryId"
                      value={filters.subcategoryId}
                      onChange={handleFilterChange}
                      className="w-full mt-2 p-2 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-600"
                      disabled={subcategoriesLoading || !filters.categoryId}
                    >
                      {subcategoriesLoading ? (
                        <option value="">Cargando...</option>
                      ) : (
                        <>
                          <option value="">Todas las subcategorías</option>
                          {subcategories.map((subcategory) => (
                            <option key={subcategory.idSubCategoria} value={subcategory.idSubCategoria}>
                              {subcategory.nombreSubCategoria}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-pink-800">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={filters.name}
                      onChange={handleFilterChange}
                      placeholder="Buscar por nombre..."
                      className="w-full mt-2 p-2 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-pink-800">Rango de Precio</label>
                    <div className="flex space-x-2 mt-2">
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Mínimo"
                        min="0"
                        className="w-1/2 p-2 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-600"
                      />
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Máximo"
                        min="0"
                        className="w-1/2 p-2 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-600"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={applyFilters}
                      className="w-1/2 bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={clearFilters}
                      className="w-1/2 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;