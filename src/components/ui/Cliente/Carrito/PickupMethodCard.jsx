import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PickupMethodCard = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pickupMethod, setPickupMethod] = useState('delivery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = React.useRef(null);
  const mapContainerRef = React.useRef(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/user/addresses`);
      const data = await response.json();
      if (response.ok && data.success) {
        setAddresses(data.data);
        setSelectedAddress(data.data[0]?.id || null);
        setError(null);
      } else {
        setError(data?.message || 'Error al cargar las direcciones');
      }
    } catch (err) {
      setError('Error al cargar las direcciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (pickupMethod === 'store' && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-5.1732944, -80.6596824], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
      L.marker([-5.1732944, -80.6596824])
        .addTo(mapRef.current)
        .bindPopup('MelyMarckStore - Piura')
        .openPopup();
    } else if (pickupMethod !== 'store' && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [pickupMethod]);

  const handleMethodChange = (method) => {
    setPickupMethod(method);
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-lg p-6">
      <h3 className="text-lg font-thin text-gray-800 tracking-widest uppercase mb-4 text-center">
        Método de Recojo
      </h3>
      <div className="flex justify-center mb-4">
        <div className="flex bg-pink-50 rounded-full p-1 border border-pink-200">
          <button
            className={`px-4 py-2 text-sm font-light uppercase tracking-widest rounded-full transition-all duration-200 ${
              pickupMethod === 'delivery' ? 'bg-pink-300 text-white' : 'text-gray-600'
            }`}
            onClick={() => handleMethodChange('delivery')}
          >
            Envio
          </button>
          <button
            className={`px-4 py-2 text-sm font-light uppercase tracking-widest rounded-full transition-all duration-200 ${
              pickupMethod === 'store' ? 'bg-pink-300 text-white' : 'text-gray-600'
            }`}
            onClick={() => handleMethodChange('store')}
          >
            En Tienda
          </button>
        </div>
      </div>

      {pickupMethod === 'delivery' ? (
        <div>
          <h4 className="text-base font-light text-gray-600 tracking-wide mb-3">
            Mis Direcciones
          </h4>
          {loading ? (
            <div className="text-center text-gray-500 font-light">Cargando direcciones...</div>
          ) : error ? (
            <div className="text-center text-red-500 font-light">{error}</div>
          ) : addresses.length === 0 ? (
            <div className="text-center text-gray-500 font-light">
              No hay direcciones registradas
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedAddress === address.id
                      ? 'border-pink-300 bg-pink-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleAddressSelect(address.id)}
                >
                  <p className="text-sm font-light text-gray-800">
                    {address.street}, {address.city}, {address.country}
                  </p>
                  <p className="text-xs text-gray-500">{address.reference}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h4 className="text-base font-light text-gray-600 tracking-wide mb-3">
            Recojo en Tienda
          </h4>
          <div
            ref={mapContainerRef}
            className="w-full h-64 rounded-lg overflow-hidden shadow-inner"
          ></div>
          <p className="text-sm text-gray-600 font-light mt-3 text-center">
            MelyMarckStore - Urb. Los Educadores Calle 7 A-12
          </p>
        </div>
      )}
    </div>
  );
};

export default PickupMethodCard;