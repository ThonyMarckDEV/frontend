import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../js/urlHelper';
import { fetchWithAuth } from '../../../js/authToken';
import CategoryForm from '../../../components/ui/Admin/Categorias/CategoryForm';
import CategoryTable from '../../../components/ui/Admin/Categorias/CategoryTable';
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
      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, { method: 'GET' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error fetching categories');
      setCategories(data.data.map(category => ({
        ...category,
        nombreCategoria: category.nombreCategoria ?? '',
        imagen: category.imagen ?? ''
      })));
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
      await fetchCategories();
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
      await fetchCategories();
    } catch (error) {
      toast.error(`Error updating category name: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
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
      await fetchCategories();
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
      await fetchCategories();
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
      <CategoryForm
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        handleAddCategory={handleAddCategory}
      />
      <CategoryTable
        categories={categories}
        loading={loading}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        editingImageCategory={editingImageCategory}
        setEditingImageCategory={setEditingImageCategory}
        editName={editName}
        setEditName={setEditName}
        editImageUrl={editImageUrl}
        setEditImageUrl={setEditImageUrl}
        useEditImageUrl={useEditImageUrl}
        setUseEditImageUrl={setUseEditImageUrl}
        fileInputRef={fileInputRef}
        handleEditCategory={handleEditCategory}
        handleImageChange={handleImageChange}
        handleToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default Categories;
