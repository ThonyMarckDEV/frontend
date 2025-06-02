import React from 'react';
import { Loader2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

const SubCategoryTable = ({
  subcategories,
  categories,
  loading,
  editingSubCategory,
  setEditingSubCategory,
  editName,
  setEditName,
  editIdCategoria,
  setEditIdCategoria,
  handleEditSubCategory,
  handleToggleStatus,
}) => {
  const startEditing = (subcategory) => {
    setEditingSubCategory(subcategory.idSubCategoria);
    setEditName(subcategory.nombreSubCategoria ?? '');
    setEditIdCategoria(subcategory.idCategoria ?? '');
  };

  const cancelEditing = () => {
    setEditingSubCategory(null);
    setEditName('');
    setEditIdCategoria('');
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : subcategories.length === 0 ? (
        <p className="text-gray-500 text-center">No subcategories found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((subcategory) => (
                <tr key={subcategory.idSubCategoria} className="border-b">
                  <td className="px-4 py-2">
                    {editingSubCategory === subcategory.idSubCategoria ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Subcategory name"
                      />
                    ) : (
                      subcategory.nombreSubCategoria
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingSubCategory === subcategory.idSubCategoria ? (
                      <select
                        value={editIdCategoria}
                        onChange={(e) => setEditIdCategoria(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">Select a Category</option>
                        {categories.map((category) => (
                          <option key={category.idCategoria} value={category.idCategoria}>
                            {category.nombreCategoria}
                          </option>
                        ))}
                      </select>
                    ) : (
                      subcategory.nombreCategoria
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleStatus(subcategory.idSubCategoria, subcategory.estado)}
                      className="focus:outline-none"
                    >
                      {subcategory.estado ? (
                        <ToggleRight className="h-5 w-5 text-green-500 hover:text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-red-500 hover:text-red-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {editingSubCategory === subcategory.idSubCategoria ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSubCategory(subcategory.idSubCategoria)}
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
                        onClick={() => startEditing(subcategory)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default SubCategoryTable;
