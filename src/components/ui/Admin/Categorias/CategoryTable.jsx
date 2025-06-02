import React, { useState } from 'react';
import { Loader2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import API_BASE_URL from '../../../../js/urlHelper';
import Pagination from '../../../Reutilizables/Pagination'; // Adjust the path as needed

const CategoryTable = ({
  categories,
  loading,
  editingCategory,
  setEditingCategory,
  editingImageCategory,
  setEditingImageCategory,
  editName,
  setEditName,
  editImageUrl,
  setEditImageUrl,
  useEditImageUrl,
  setUseEditImageUrl,
  fileInputRef,
  handleEditCategory,
  handleImageChange,
  handleToggleStatus,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const isUrl = (string) => string && (string.startsWith('http://') || string.startsWith('https://'));

  const startEditing = (category) => {
    setEditingCategory(category.idCategoria);
    setEditName(category.nombreCategoria ?? '');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const startEditingImage = (category) => {
    setEditingImageCategory(category.idCategoria);
    setEditImageUrl(category.imagen ?? '');
    setUseEditImageUrl(category.imagen && isUrl(category.imagen));
  };

  const cancelImageEditing = () => {
    setEditingImageCategory(null);
    setEditImageUrl('');
    setUseEditImageUrl(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/gif"
        onChange={handleImageChange}
        className="hidden"
        ref={fileInputRef}
      />
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 text-center">No categories found.</p>
      ) : (
        <>
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
                {currentCategories.map((category) => (
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
          <Pagination
            currentPage={currentPage}
            totalItems={categories.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
};

export default CategoryTable;