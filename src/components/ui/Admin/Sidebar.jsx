import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, LogOut } from 'lucide-react';
import { logout } from '../../../js/logout';

const Sidebar = () => {

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Usuarios' },
    { to: '/admin/products', icon: Package, label: 'Productos' },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg">
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
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors ${
                isActive ? 'bg-pink-50 text-pink-500' : ''
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-6">
        <button
          onClick={logout}
          className="flex items-center w-full px-6 py-3 text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;