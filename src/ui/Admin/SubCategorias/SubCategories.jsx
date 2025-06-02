import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../js/urlHelper';
import { fetchWithAuth } from '../../../js/authToken';
import SubCategoryForm from '../../../components/ui/Admin/SubCategorias/SubCategoryForm';
import SubCategoryTable from '../../../components/ui/Admin/SubCategorias/SubCategoryTable';
import LoadingScreen from '../../../components/LoadingScreen';

const SubCategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState({ name: '', idCategoria: '' });
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIdCategoria, setEditIdCategoria] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, [filterCategoryId]);

  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, { method: 'GET' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error fetching categories');
      setCategories(data.data.map(category => ({
        ...category,
        nombreCategoria: category.nombreCategoria ?? ''
      })));
    } catch (error) {
      toast.error('Error fetching categories');
      console.error('Error:', error);
    }
  };

  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const url = filterCategoryId
        ? `${API_BASE_URL}/api/subcategories/admin?category_id=${filterCategoryId}`
        : `${API_BASE_URL}/api/subcategories/admin`;
      const response = await fetchWithAuth(url, { method: 'GET' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error fetching subcategories');
      setSubcategories(data.data.map(subcategory => ({
        ...subcategory,
        nombreSubCategoria: subcategory.nombreSubCategoria ?? '',
        nombreCategoria: subcategory.nombreCategoria ?? ''
      })));
    } catch (error) {
      toast.error('Error fetching subcategories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    setLoadingScreen(true);
    try {
      if (!newSubCategory.idCategoria) {
        toast.error('Please select a category');
        return;
      }
      const response = await fetchWithAuth(`${API_BASE_URL}/api/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreSubCategoria: newSubCategory.name.trim(),
          idCategoria: newSubCategory.idCategoria
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error adding subcategory');

      toast.success('Subcategory added successfully');
      setNewSubCategory({ name: '', idCategoria: '' });
      await fetchSubCategories();
    } catch (error) {
      toast.error('Error adding subcategory');
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleEditSubCategory = async (idSubCategoria) => {
    setLoadingScreen(true);
    try {
      if (!editName.trim()) {
        toast.error('Subcategory name cannot be empty');
        return;
      }
      if (!editIdCategoria) {
        toast.error('Please select a category');
        return;
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/subcategories/${idSubCategoria}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreSubCategoria: editName.trim(),
          idCategoria: editIdCategoria
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error updating subcategory');

      toast.success('Subcategory updated successfully');
      setEditingSubCategory(null);
      setEditName('');
      setEditIdCategoria('');
      await fetchSubCategories();
    } catch (error) {
      toast.error(`Error updating subcategory: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleToggleStatus = async (idSubCategoria, currentStatus) => {
    setLoadingScreen(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/subcategories/${idSubCategoria}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error toggling status');

      toast.success('Subcategory status updated');
      await fetchSubCategories();
    } catch (error) {
      toast.error('Error toggling subcategory status');
      console.error('Error:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {loadingScreen && <LoadingScreen />}
      <h2 className="text-2xl font-bold text-gray-800 mb-6"> Manage SubCategories </h2>
     <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="categoryFilter">
          Filter by Category
        </label>
        <select
          id="categoryFilter"
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.idCategoria} value={category.idCategoria}>
              {category.nombreCategoria}
            </option>
          ))}
        </select>
      </div>

      <SubCategoryForm
        newSubCategory={newSubCategory}
        setNewSubCategory={setNewSubCategory}
        categories={categories}
        handleAddSubCategory={handleAddSubCategory}
      />
  
      <SubCategoryTable
        subcategories={subcategories}
        categories={categories}
        loading={loading}
        editingSubCategory={editingSubCategory}
        setEditingSubCategory={setEditingSubCategory}
        editName={editName}
        setEditName={setEditName}
        editIdCategoria={editIdCategoria}
        setEditIdCategoria={setEditIdCategoria}
        handleEditSubCategory={handleEditSubCategory}
        handleToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default SubCategories;
