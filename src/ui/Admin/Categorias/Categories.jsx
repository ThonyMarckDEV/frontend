import React, { useState, useEffect } from 'react';
import { Loader2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../js/urlHelper';
import { fetchWithAuth } from '../../../js/authToken';
import LoadingScreen from '../../../components/LoadingScreen';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', image: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error fetching categories');
      }
      setCategories(data.data);
    } catch (error) {
      toast.error('Error fetching categories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoadingScreen(true);
    try {
      const formData = new FormData();
      formData.append('nombreCategoria', newCategory.name);
      if (newCategory.image) {
        formData.append('imagen', newCategory.image);
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error adding category');
      }

      toast.success('Category added successfully');
      setNewCategory({ name: '', image: null });
      fetchCategories();
    } catch (error) {
      toast.error('Error adding category');
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleEditCategory = async (idCategoria) => {
    setLoadingScreen(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${idCategoria}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreCategoria: editName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error updating category');
      }

      toast.success('Category updated successfully');
      setEditingCategory(null);
      setEditName('');
      fetchCategories();
    } catch (error) {
      toast.error('Error updating category');
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleToggleStatus = async (idCategoria, currentStatus) => {
    setLoadingScreen(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${idCategoria}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error toggling status');
      }

      toast.success('Category status updated');
      fetchCategories();
    } catch (error) {
      toast.error('Error toggling status');
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {loadingScreen && <LoadingScreen />}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Categories</h2>

      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="mb-8 p-4 bg-pink-50 rounded-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="categoryName">
            Category Name
          </label>
          <input
            id="categoryName"
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter category name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="categoryImage">
            Category Image
          </label>
          <input
            id="categoryImage"
            type="file"
            accept="image/*"
            onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files[0] })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition duration-200"
        >
          Add Category
        </button>
      </form>

      {/* Categories Table */}
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 text-center">No categories found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-gray-700">Image</th>
                <th className="px-4 py-2 text-left text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.idCategoria} className="border-b">
                  <td className="px-4 py-2">
                    {editingCategory === category.idCategoria ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      category.nombreCategoria
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {category.imagen ? (
                      <img
                        // src={`${API_BASE_URL}/storage/${category.imagen}`}
                        src={`${category.imagen}`}
                        alt={category.nombreCategoria}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      'No image'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {category.estado ? (
                      <ToggleRight
                        className="h-5 w-5 text-green-500 cursor-pointer"
                        onClick={() => handleToggleStatus(category.idCategoria, category.estado)}
                      />
                    ) : (
                      <ToggleLeft
                        className="h-5 w-5 text-red-500 cursor-pointer"
                        onClick={() => handleToggleStatus(category.idCategoria, category.estado)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingCategory === category.idCategoria ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category.idCategoria)}
                          className="text-pink-500 hover:text-pink-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCategory(category.idCategoria);
                          setEditName(category.nombreCategoria);
                        }}
                        className="text-pink-500 hover:text-pink-600"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Categories;