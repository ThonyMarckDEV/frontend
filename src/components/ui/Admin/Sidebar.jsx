import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, LogOut, Menu, X } from 'lucide-react';
import { logout } from '../../../js/logout';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true }, // Added end: true
    { to: '/admin/users', icon: Users, label: 'Usuarios' },
    { to: '/admin/categories', icon: Package, label: 'Categorias' },
    { to: '/admin/subcategories', icon: Package, label: 'SubCategorias' },
    { to: '/admin/products', icon: Package, label: 'Productos' },
  ];

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close sidebar when navigating
  const handleNavLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger Button (Visible on Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <LayoutDashboard className="h-6 w-6 text-pink-400 mr-2" />
            Panel de Admin
          </h2>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end} // Apply end prop conditionally
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors ${
                  isActive ? 'bg-pink-50 text-pink-500' : ''
                }`
              }
              onClick={handleNavLinkClick}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={() => {
              logout();
              handleNavLinkClick();
            }}
            className="flex items-center w-full px-6 py-3 text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Backdrop (Visible on Mobile when Sidebar is Open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;