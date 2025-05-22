import React, { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActiveSessions from '../../../components/ui/Cliente/ConfigComponents/ActiveSessions';

const Config = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const navigate = useNavigate();

  const tabs = [
    { id: 'sessions', label: 'Sesiones Activas', component: <ActiveSessions /> },
    // Otros tabs (e.g., perfil, seguridad) pueden añadirse aquí
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-300 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Settings className="h-8 w-8 text-pink-500 mr-2" />
            Configuración
          </h1>
          <button
            onClick={() => navigate('/')}
            className="text-pink-500 hover:text-pink-600 flex items-center"
          >
            <LogOut className="h-5 w-5 mr-1" />
            Volver
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default Config;