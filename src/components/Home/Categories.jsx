import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../js/urlHelper';
import LoadingScreen from '../../components/LoadingScreen';

const Categories = ({ isVisible }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        const result = response.data;
        console.log('Categories API response:', result);
        if (result.success) {
          setCategories(
            result.data.map((cat) => ({
              id: cat.idCategoria,
              name: cat.nombreCategoria,
              image: cat.imagen || 'https://via.placeholder.com/300x400',
            }))
          );
        } else {
          setError(result.message || 'Error fetching categories');
        }
      } catch (err) {
        console.error('Fetch categories error:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when a category is clicked
  const handleCategoryClick = async (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null); // Toggle off if clicked again
      return;
    }
    setLoadingSubcategories(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/subcategories?category_id=${categoryId}`
      );
      const result = response.data;
      console.log(`Subcategories API response for category ${categoryId}:`, result);
      if (result.success) {
        setSubcategories((prev) => ({
          ...prev,
          [categoryId]: result.data,
        }));
        setSelectedCategory(categoryId);
      } else {
        setError(result.message || 'Error fetching subcategories');
      }
    } catch (err) {
      console.error('Fetch subcategories error:', err);
      setError('Failed to load subcategories. Please try again later.');
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Navigate to subcategory page
  const handleSubcategoryClick = (categoryId, subcategoryId, subcategoryName) => {
    navigate(`/subcategory/${categoryId}/${subcategoryId}`, {
      state: { subcategoryName },
    });
  };

  // Close sidebar
  const closeSidebar = () => {
    setSelectedCategory(null);
  };

  // Determine the number of skeleton loaders (default to 4, or match categories length if known)
  const skeletonCount = categories.length > 0 ? categories.length : 4;

  return (
    <>
      {loadingSubcategories && <LoadingScreen />}
      <div
        className={`transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Nuestras Categorías
          </h2>
          {error ? (
            <p className="text-center text-red-500 text-lg">{error}</p>
          ) : categories.length === 0 ? (
            <div
              className={`flex flex-wrap justify-center gap-6 sm:gap-8 ${
                skeletonCount === 1 ? 'max-w-xs mx-auto' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {[...Array(skeletonCount)].map((_, index) => (
                <div
                  key={index}
                  className="w-full h-64 sm:h-80 bg-gray-200 animate-pulse rounded-lg max-w-xs"
                />
              ))}
            </div>
          ) : (
            <div
              className={`flex flex-wrap justify-center gap-6 sm:gap-8 ${
                categories.length === 1 ? 'max-w-xs mx-auto' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {categories.map((category) => (
                <div key={category.id} className="relative max-w-xs">
                  <div
                    className="group relative overflow-hidden rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-64 sm:h-80 object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: ${category.image}`);
                        e.target.src = 'https://via.placeholder.com/300x400';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{category.name}</h3>
                        <button className="mt-2 text-white hover:text-pink-300 transition flex items-center">
                          Explorar <span className="ml-2">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sidebar for Subcategories */}
          {selectedCategory && (
            <div className="fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-bold text-gray-800">
                    {categories.find((cat) => cat.id === selectedCategory)?.name}
                  </h3>
                  <button
                    onClick={closeSidebar}
                    className="text-gray-600 hover:text-gray-800 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {subcategories[selectedCategory]?.length > 0 ? (
                    <ul className="space-y-2">
                      {subcategories[selectedCategory].map((subcategory) => (
                        <li
                          key={subcategory.idSubCategoria}
                          className="text-gray-800 hover:text-pink-500 cursor-pointer transition text-sm sm:text-base"
                          onClick={() =>
                            handleSubcategoryClick(
                              selectedCategory,
                              subcategory.idSubCategoria,
                              subcategory.nombreSubCategoria
                            )
                          }
                        >
                          {subcategory.nombreSubCategoria}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-sm sm:text-base">
                      No subcategories available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Overlay for mobile when sidebar is open */}
          {selectedCategory && (
            <div
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={closeSidebar}
            ></div>
          )}
        </div>
      </div>
    </>
  );
};

export default Categories;