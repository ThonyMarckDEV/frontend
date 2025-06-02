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
  const [newCategory, setNewCategory] = useState({ name: '', image: null, imageUrl: '', useImageUrl: false });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingImageCategory, setEditingImageCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [useEditImageUrl, setUseEditImageUrl] = useState(false);
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
      if (!response.ok) throw new Error(data.message || 'Error fetching categories');
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
      formData.append('useImageUrl', newCategory.useImageUrl);
      if (newCategory.useImageUrl) {
        if (!newCategory.imageUrl.trim()) {
          toast.error('Image URL cannot be empty');
          return;
        }
        formData.append('imageUrl', newCategory.imageUrl);
      } else if (newCategory.image) {
        formData.append('imagen', newCategory.image);
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error adding category');

      toast.success('Category added successfully');
      setNewCategory({ name: '', image: null, imageUrl: '', useImageUrl: false });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreCategoria: editName.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error updating category name');

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

  const startEditingImage = (category) => {
    setEditingImageCategory(category.idCategoria);
    setEditImageUrl(category.imagen || '');
    setUseEditImageUrl(category.imagen && isUrl(category.imagen));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file && !useEditImageUrl) return;

    setLoadingScreen(true);
    try {
      const formData = new FormData();
      formData.append('useImageUrl', useEditImageUrl);
      if (useEditImageUrl) {
        if (!editImageUrl.trim()) {
          toast.error('Image URL cannot be empty');
          return;
        }
        formData.append('imageUrl', editImageUrl.trim());
      } else {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          toast.error('Invalid image format. Use JPEG, JPG, or GIF.');
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Image size must be under 2MB.');
          return;
        }
        formData.append('fileImage', file);
      }
      formData.append('_method', 'PUT');

      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${editingImageCategory}/image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error updating category image');

      toast.success('Category image updated successfully');
      fetchCategories();
    } catch (error) {
      toast.error(`Error updating category image: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
      setEditingImageCategory(null);
      setEditImageUrl('');
      setUseEditImageUrl(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleStatus = async (idCategoria, currentStatus) => {
    setLoadingScreen(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${idCategoria}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error toggling status');

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

  const cancelImageEditing = () => {
    setEditingImageCategory(null);
    setEditImageUrl('');
    setUseEditImageUrl(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
            <input
              type="checkbox"
              checked={newCategory.useImageUrl}
              onChange={(e) => setNewCategory({ ...newCategory, useImageUrl: e.target.checked, image: null, imageUrl: '' })}
              className="mr-2"
            />
            Use Image URL
          </label>
          {newCategory.useImageUrl ? (
            <input
              type="url"
              value={newCategory.imageUrl}
              onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter image URL"
            />
          ) : (
            <input
              id="categoryImage"
              type="file"
              accept="image/jpeg,image/jpg,image/gif"
              onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files[0], imageUrl: '' })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          )}
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
                    {editingImageCategory === category.idCategoria ? (
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center text-gray-700 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={useEditImageUrl}
                            onChange={(e) => setUseEditImageUrl(e.target.checked)}
                            className="mr-2"
                          />
                          Use Image URL
                        </label>
                        {useEditImageUrl ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="url"
                              value={editImageUrl}
                              onChange={(e) => setEditImageUrl(e.target.value)}
                              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                              placeholder="Enter image URL"
                            />
                            <button
                              onClick={() => handleImageChange({ target: { files: [] } })}
                              className="text-green-500 hover:text-green-600 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelImageEditing}
                              className="text-gray-500 hover:text-gray-600 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">Select file...</span>
                            <button
                              onClick={() => fileInputRef.current.click()}
                              className="text-green-500 hover:text-green-600 font-medium"
                            >
                              Upload
                            </button>
                            <button
                              onClick={cancelImageEditing}
                              className="text-gray-500 hover:text-gray-600 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ) : category.imagen ? (
                      <div className="flex items-center space-x-2">
                        <img
                          src={isUrl(category.imagen) ? category.imagen : `${API_BASE_URL}/storage/${category.imagen}`}
                          alt={category.nombreCategoria}
                          className="h-12 w-12 object-cover rounded cursor-pointer"
                          onClick={() => startEditingImage(category)}
                        />
                        {isUrl(category.imagen) && (
                          <a
                            href={category.imagen}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm truncate max-w-xs"
                          >
                            {category.imagen}
                          </a>
                        )}
                      </div>
                    ) : (
                      <span
                        className="text-gray-400 text-sm cursor-pointer"
                        onClick={() => startEditingImage(category)}
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