import React from 'react';

const Header = ({ title, description }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow mb-6">
      <h1 className="text-2xl font-bold mb-4 font-serif text-gray-800">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Header;