import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import markerIcon from '../../../../img/utilidades/shop.png';

const PickupMethodCard = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pickupMethod, setPickupMethod] = useState('delivery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const storePosition = [-5.1732944, -80.6596824]; // Piura store coordinates

  // Custom Leaflet marker icon
  const customIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [40, 41], // Adjusted size as per your code
    iconAnchor: [20, 41], // Adjusted anchor to center the wider icon
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/directions`);
      const data = await response.json();
      if (response.ok && data.message === 'Direcciones obtenidas correctamente') {
        setAddresses(data.directions);
        const activeAddress = data.directions.find((addr) => addr.estado === 1);
        setSelectedAddress(activeAddress?.idDireccion || data.directions[0]?.idDireccion || null);
        setError(null);
      } else {
        setError(data?.message || 'Error al cargar las direcciones');
      }
    } catch (err) {
      setError('Error al cargar las direcciones: ' + err.message);
      toast.error('Error al cargar las direcciones');
    } finally {
      setLoading(false);
    }
  };

  const setActiveAddress = async (addressId) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/directions/${addressId}/select`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAddresses((prevAddresses) =>
          prevAddresses.map((addr) => ({
            ...addr,
            estado: addr.idDireccion === addressId ? 1 : 0,
          }))
        );
        setSelectedAddress(addressId);
        toast.success('Dirección seleccionada correctamente');
        setError(null);
      } else {
        setError(data?.message || 'Error al seleccionar la dirección');
        toast.error('Error al seleccionar la dirección');
      }
    } catch (err) {
      setError('Error al seleccionar la dirección: ' + err.message);
      toast.error('Error al seleccionar la dirección');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (pickupMethod === 'store' && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(storePosition, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
      L.marker(storePosition, { icon: customIcon })
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
    setActiveAddress(addressId); // Update active address on selection
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
            <div className="text-center text-gray-500 font-light flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-pink-300 border-t-transparent rounded-full animate-spin mr-2"></div>
              Cargando direcciones...
            </div>
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
                  key={address.idDireccion}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedAddress === address.idDireccion
                      ? 'border-pink-300 bg-pink-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleAddressSelect(address.idDireccion)}
                >
                  <p className="text-sm font-light text-gray-800">
                    {address.direccion_shalom}
                  </p>
                  <p className="text-xs text-gray-500">
                    {address.distrito}, {address.provincia}, {address.departamento}
                  </p>
                  <p className="text-xs text-gray-500">
                    {address.estado === 1 ? 'Activa' : 'Inactiva'}
                  </p>
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
            MelyMarckStore - Urb. Los Educadores Calle 7 A-12, Piura, Perú
          </p>
        </div>
      )}
    </div>
  );
};

export default PickupMethodCard;