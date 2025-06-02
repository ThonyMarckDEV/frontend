import React, { useState, useEffect, useRef } from 'react';
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
  const [editingCategory, setEditingCategory] = useState(null); // For name editing
  const [editingImageCategory, setEditingImageCategory] = useState(null); // For image editing
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef(null);

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
      console.log('Fetched categories:', data.data);
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
      const fileInput = document.getElementById('categoryImage');
      if (fileInput) fileInput.value = '';
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
      if (!editName.trim()) {
        toast.error('Category name cannot be empty');
        return;
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${idCategoria}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreCategoria: editName.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error updating category name');
      }

      toast.success('Category name updated successfully');
      setEditingCategory(null);
      setEditName('');
      fetchCategories();
    } catch (error) {
      toast.error(`Error updating category name: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleImageClick = (idCategoria) => {
    setEditingImageCategory(idCategoria); // Set image editing state
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingScreen(true);
    try {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid image format. Use JPEG, JPG, or GIF.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be under 2MB.');
        return;
      }

      console.log('Selected image:', {
        name: file.name,
        type: file.type,
        size: file.size / 1024 + 'KB',
      });

      const formData = new FormData();
      formData.append('fileImage', file);

      const formDataEntries = [];
      for (let [key, value] of formData.entries()) {
        formDataEntries.push({
          key,
          value: value instanceof File ? `${value.name} (${value.type}, ${value.size} bytes)` : value,
        });
      }
      console.log('FormData contents:', formDataEntries);

      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${editingImageCategory}/image`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error updating category image');
      }

      toast.success('Category image updated successfully');
      fetchCategories();
    } catch (error) {
      toast.error(`Error updating category image: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
      setEditingImageCategory(null); // Reset image editing state
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const startEditing = (category) => {
    setEditingCategory(category.idCategoria);
    setEditName(category.nombreCategoria);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const isUrl = (string) => {
    return string && (string.startsWith('http://') || string.startsWith('https://'));
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
            accept="image/jpeg,image/jpg,image/gif"
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

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/gif"
        onChange={handleImageChange}
        className="hidden"
        ref={fileInputRef}
      />

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
                        placeholder="Category name"
                      />
                    ) : (
                      category.nombreCategoria
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {category.imagen ? (
                      <img
                        src={isUrl(category.imagen) ? category.imagen : `${API_BASE_URL}/storage/${category.imagen}`}
                        alt={category.nombreCategoria}
                        className="h-12 w-12 object-cover rounded cursor-pointer"
                        onClick={() => handleImageClick(category.idCategoria)}
                      />
                    ) : (
                      <span
                        className="text-gray-400 text-sm cursor-pointer"
                        onClick={() => handleImageClick(category.idCategoria)}
                      >
                        No image
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleStatus(category.idCategoria, category.estado)}
                      className="focus:outline-none"
                    >
                      {category.estado ? (
                        <ToggleRight className="h-5 w-5 text-green-500 hover:text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-red-500 hover:text-red-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {editingCategory === category.idCategoria ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category.idCategoria)}
                          className="text-green-500 hover:text-green-600 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-500 hover:text-gray-600 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(category)}
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
