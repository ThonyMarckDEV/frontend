import React from 'react';

const CategoryForm = ({ newCategory, setNewCategory, handleAddCategory }) => {
  return (
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
  );
};

export default CategoryForm;
