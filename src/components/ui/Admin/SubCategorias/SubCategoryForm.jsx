import React from 'react';

const SubCategoryForm = ({ newSubCategory, setNewSubCategory, handleAddSubCategory, categories }) => {
  return (
    <form onSubmit={handleAddSubCategory} className="mb-6 p-4 bg-pink-50 rounded-md">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="subCategoryName">
          Subcategory Name
        </label>
        <input
          id="subCategoryName"
          type="text"
          value={newSubCategory.name}
          onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter subcategory name"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="categorySelect">
          Category
        </label>
        <select
          id="categorySelect"
          value={newSubCategory.idCategoria}
          onChange={(e) => setNewSubCategory({ ...newSubCategory, idCategoria: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        >
          <option value="">Select a Category</option>
          {categories.map((category) => (
            <option key={category.idCategoria} value={category.idCategoria}>
              {category.nombreCategoria}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition duration-200"
      >
        Add Subcategory
      </button>
    </form>
  );
};

export default SubCategoryForm;
