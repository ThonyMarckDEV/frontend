import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Edit, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../../js/urlHelper';
import jwtUtils from '../../../../utilities/jwtUtils';
import { fetchWithAuth } from '../../../../js/authToken';
import LoadingScreen from '../../../LoadingScreen';

 const peruData = {
    Amazonas: {
      Chachapoyas: ['Chachapoyas', 'Asunción', 'Balsas'],
      Bagua: ['Bagua', 'Aramango', 'Copallín'],
      Bongará: ['Jumbilla', 'Chisquilla', 'Florida'],
      Condorcanqui: ['Nieva', 'El Cenepa', 'Río Santiago'],
      Luya: ['Lamud', 'Camporredondo', 'Luya'],
      Rodríguez_de_Mendoza: ['San Nicolás', 'Chirimoto', 'Cochamal'],
      Utcubamba: ['Bagua Grande', 'Cajaruro', 'Cumba'],
    },
    Áncash: {
      Huaraz: ['Huaraz', 'Independencia', 'Jangas'],
      Aija: ['Aija', 'Coris', 'La Merced'],
      Antonio_Raymondi: ['Llamellín', 'Aczo', 'Chaccho'],
      Asunción: ['Chacas', 'Acochaca'],
      Bolognesi: ['Chiquián', 'Abelardo Pardo', 'Aquia'],
      Carhuaz: ['Carhuaz', 'Acopampa', 'Amashca'],
      Carlos_Fermín_Fitzcarrald: ['San Luis', 'San Nicolás', 'Yauya'],
      Casma: ['Casma', 'Buena Vista Alta', 'Comandante Noel'],
      Corongo: ['Corongo', 'Aco', 'Bambas'],
      Huari: ['Huari', 'Anra', 'Cajay'],
      Huarmey: ['Huarmey', 'Cochapeti', 'Culebras'],
      Huaylas: ['Caraz', 'Huallanca', 'Huata'],
      Mariscal_Luzuriaga: ['Piscobamba', 'Casca', 'Eleazar Guzmán'],
      Ocros: ['Acas', 'Cajamarquilla', 'Ocros'],
      Pallasca: ['Cabana', 'Bolognesi', 'Conchucos'],
      Pomabamba: ['Pomabamba', 'Huayllán', 'Parobamba'],
      Recuay: ['Recuay', 'Cotaparaco', 'Huayllapampa'],
      Santa: ['Chimbote', 'Coishco', 'Nepeña'],
      Sihuas: ['Sihuas', 'Acobamba', 'Alfonso Ugarte'],
      Yungay: ['Yungay', 'Cascapara', 'Mancos'],
    },
    Apurímac: {
      Abancay: ['Abancay', 'Circa', 'Chacoche'],
      Andahuaylas: ['Andahuaylas', 'Andarapa', 'Chiara'],
      Antabamba: ['Antabamba', 'El Oro', 'Huaquirca'],
      Aymaraes: ['Chalhuanca', 'Capaya', 'Caraybamba'],
      Cotabambas: ['Tambobamba', 'Cotabambas', 'Coyllurqui'],
      Chincheros: ['Chincheros', 'Anco-Huallo', 'Cocharcas'],
      Grau: ['Chuquibambilla', 'Curasco', 'Curpahuasi'],
    },
    Arequipa: {
      Arequipa: ['Arequipa', 'Cayma', 'Cerro Colorado', 'Yanahuara', 'Miraflores'],
      Camaná: ['Camaná', 'José María Quimper', 'Mariscal Cáceres'],
      Caravelí: ['Caravelí', 'Acarí', 'Atico'],
      Castilla: ['Aplao', 'Andagua', 'Chachas'],
      Caylloma: ['Chivay', 'Achoma', 'Cabanaconde'],
      Condesuyos: ['Chuquibamba', 'Andaray', 'Iray'],
      Islay: ['Mollendo', 'Cocachacra', 'Dean Valdivia'],
      La_Unión: ['Cotahuasi', 'Alca', 'Charcana'],
    },
    Ayacucho: {
      Huamanga: ['Ayacucho', 'Acocro', 'Jesús Nazareno'],
      Cangallo: ['Cangallo', 'Chuschi', 'Los Morochucos'],
      Huanca_Sancos: ['Sancos', 'Carapo', 'Sacsamarca'],
      Huanta: ['Huanta', 'Ayahuanco', 'Iguaín'],
      La_Mar: ['San Miguel', 'Anco', 'Chungui'],
      Lucanas: ['Puquio', 'Aucará', 'Carmen Salcedo'],
      Parinacochas: ['Coracora', 'Chumpi', 'Puyusca'],
      Páucar_del_Sara_Sara: ['Pausa', 'Colta', 'Lampa'],
      Sucre: ['Querobamba', 'Belén', 'Chalcos'],
      Víctor_Fajardo: ['Huancapi', 'Alcamenca', 'Apongo'],
      Vilcas_Huamán: ['Vilcas Huamán', 'Accomarca', 'Concepción'],
    },
    Cajamarca: {
      Cajamarca: ['Cajamarca', 'Asunción', 'Chetilla'],
      Cajabamba: ['Cajabamba', 'Cachachi', 'Condebamba'],
      Celendín: ['Celendín', 'Chumuch', 'Cortegana'],
      Chota: ['Chota', 'Anguía', 'Chadin'],
      Contumazá: ['Contumazá', 'Chilete', 'Cupisnique'],
      Cutervo: ['Cutervo', 'Callayuc', 'Choros'],
      Hualgayoc: ['Bambamarca', 'Chugur', 'Hualgayoc'],
      Jaén: ['Jaén', 'Bellavista', 'Colasay'],
      San_Ignacio: ['San Ignacio', 'Chirinos', 'Huayabal'],
      San_Marcos: ['Pedro Gálvez', 'Chancay', 'Eduardo Villanueva'],
      San_Miguel: ['San Miguel', 'Bolívar', 'Calquis'],
      San_Pablo: ['San Pablo', 'San Bernardino', 'Tumbadén'],
      Santa_Cruz: ['Santa Cruz', 'Andabamba', 'Catache'],
    },
    Callao: {
      Callao: ['Callao', 'Bellavista', 'Carmen de la Legua', 'La Perla', 'La Punta', 'Ventanilla', 'Mi Perú'],
    },
    Cusco: {
      Cusco: ['Cusco', 'Ccorca', 'Poroy', 'San Jerónimo', 'San Sebastián'],
      Acomayo: ['Acomayo', 'Acopía', 'Mosoc Llacta'],
      Anta: ['Anta', 'Ancahuasi', 'Chinchaypujio'],
      Calca: ['Calca', 'Coya', 'Lamay'],
      Canas: ['Yanaoca', 'Checca', 'Kunturkanki'],
      Canchis: ['Sicuani', 'Combapata', 'San Pablo'],
      Chumbivilcas: ['Santo Tomás', 'Capacmarca', 'Colquemarca'],
      Espinar: ['Espinar', 'Condoroma', 'Ocoruro'],
      La_Convención: ['Santa Ana', 'Echarate', 'Huayopata'],
      Paruro: ['Paruro', 'Accha', 'Ccapi'],
      Paucartambo: ['Paucartambo', 'Caicay', 'Challabamba'],
      Quispicanchi: ['Urcos', 'Andahuaylillas', 'Camanti'],
      Urubamba: ['Urubamba', 'Chinchero', 'Machu Picchu'],
    },
    Huancavelica: {
      Huancavelica: ['Huancavelica', 'Acobambilla', 'Acoria'],
      Acobamba: ['Acobamba', 'Andabamba', 'Anta'],
      Angaraes: ['Lircay', 'Anchonga', 'Callanmarca'],
      Castrovirreyna: ['Castrovirreyna', 'Arma', 'Aurahuá'],
      Churcampa: ['Churcampa', 'Anco', 'Chinchihuasi'],
      Huaytará: ['Huaytará', 'Ayaví', 'Córdova'],
      Tayacaja: ['Pampas', 'Acostambo', 'Acraquía'],
    },
    Huánuco: {
      Huánuco: ['Huánuco', 'Amarilis', 'Pillco Marca'],
      Ambo: ['Ambo', 'Cayna', 'Colpas'],
      Dos_de_Mayo: ['La Unión', 'Chuquis', 'Marías'],
      Huacaybamba: ['Huacaybamba', 'Canchabamba', 'Pinra'],
      Huamalíes: ['Llata', 'Arancay', 'Chavín de Pariarca'],
      Leoncio_Prado: ['Rupa-Rupa', 'Castillo Grande', 'Daniel Alomía'],
      Marañón: ['Huacrachuco', 'Cholón', 'San Buenaventura'],
      Pachitea: ['Panao', 'Chaglla', 'Molino'],
      Puerto_Inca: ['Puerto Inca', 'Codo del Pozuzo', 'Honoria'],
      Lauricocha: ['Jesús', 'Baños', 'Jivia'],
      Yarowilca: ['Chavinillo', 'Cahuac', 'Choras'],
    },
    Ica: {
      Ica: ['Ica', 'La Tinguiña', 'Los Aquijes'],
      Chincha: ['Chincha Alta', 'Alto Larán', 'Chavín'],
      Nazca: ['Nazca', 'Changuillo', 'Marcona'],
      Palpa: ['Palpa', 'Llipata', 'Río Grande'],
      Pisco: ['Pisco', 'Huancano', 'Independencia'],
    },
    Junín: {
      Huancayo: ['Huancayo', 'Carhuacallanga', 'Chilca'],
      Chanchamayo: ['Perené', 'Pichanaqui', 'San Luis de Shuaro'],
      Chupaca: ['Chupaca', 'Ahuac', 'Huachac'],
      Concepción: ['Concepción', 'Aco', 'Andamarca'],
      Jauja: ['Jauja', 'Acolla', 'Apata'],
      Junín: ['Junín', 'Carhuamayo', 'Ondores'],
      Satipo: ['Satipo', 'Coviriali', 'Llaylla'],
      Tarma: ['Tarma', 'Acobamba', 'Huaricolca'],
      Yauli: ['La Oroya', 'Chacapalpa', 'Morococha'],
    },
    La_Libertad: {
      Trujillo: ['Trujillo', 'El Porvenir', 'Huanchaco', 'La Esperanza', 'Víctor Larco'],
      Ascope: ['Ascope', 'Casa Grande', 'Chicama'],
      Bolívar: ['Bolívar', 'Bambamarca', 'Condormarca'],
      Chepén: ['Chepén', 'Pacanga', 'Pueblo Nuevo'],
      Gran_Chimú: ['Cascas', 'Lucma', 'Marmot'],
      Julcán: ['Julcán', 'Calamarca', 'Carabamba'],
      Otuzco: ['Otuzco', 'Agallpampa', 'Charat'],
      Pacasmayo: ['San Pedro de Lloc', 'Guadalupe', 'Jequetepeque'],
      Pataz: ['Tayabamba', 'Buldibuyo', 'Chillia'],
      Sánchez_Carrión: ['Huamachuco', 'Chugay', 'Cochorco'],
      Santiago_de_Chuco: ['Santiago de Chuco', 'Angasmarca', 'Cachicadan'],
      Virú: ['Virú', 'Chao', 'Guadalupito'],
    },
    Lambayeque: {
      Chiclayo: ['Chiclayo', 'Etén', 'La Victoria'],
      Ferreñafe: ['Ferreñafe', 'Cañaris', 'Incahuasi'],
      Lambayeque: ['Lambayeque', 'Illimo', 'Mochumí'],
    },
    Lima: {
      Lima: ['Lima', 'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'San Borja', 'La Molina'],
      Barranca: ['Barranca', 'Paramonga', 'Pativilca'],
      Cajatambo: ['Cajatambo', 'Copa', 'Gorgor'],
      Canta: ['Canta', 'Arahuay', 'Huamantanga'],
      Cañete: ['San Vicente de Cañete', 'Asia', 'Mala'],
      Huaral: ['Huaral', 'Atavillos Alto', 'Aucallama'],
      Huarochirí: ['Matucana', 'Antioquía', 'San Bartolomé'],
      Huaura: ['Huacho', 'Hualmay', 'Vegueta'],
      Oyón: ['Oyón', 'Andajes', 'Caujul'],
      Yauyos: ['Yauyos', 'Alis', 'Ayavirí'],
    },
    Loreto: {
      Maynas: ['Iquitos', 'Belén', 'Punchana'],
      Alto_Amazonas: ['Yurimaguas', 'Balsapuerto', 'Jeberos'],
      Datem_del_Marañón: ['San Lorenzo', 'Barranca', 'Manseriche'],
      Loreto: ['Nauta', 'Parinari', 'Trompeteros'],
      Mariscal_Ramón_Castilla: ['Ramón Castilla', 'Pebas', 'Yavari'],
      Putumayo: ['Putumayo', 'Rosa Panduro', 'Teniente Manuel Clavero'],
      Requena: ['Requena', 'Capelo', 'Emilio San Martín'],
      Ucayali: ['Contamana', 'Inahuaya', 'Vargas Guerra'],
    },
    Madre_de_Dios: {
      Tambopata: ['Puerto Maldonado', 'Inambari', 'Las Piedras'],
      Manu: ['Manu', 'Fitzcarrald', 'Madre de Dios'],
      Tahuamanu: ['Iñapari', 'Iberia', 'Tahuamanu'],
    },
    Moquegua: {
      Mariscal_Nieto: ['Moquegua', 'Carumas', 'Cuchumbaya'],
      General_Sánchez_Cerro: ['Omate', 'Chojata', 'Coalaque'],
      Ilo: ['Ilo', 'El Algarrobal', 'Pacocha'],
    },
    Pasco: {
      Pasco: ['Chaupimarca', 'Huariaca', 'Huayllay'],
      Daniel_Alcides_Carrión: ['Yanahuanca', 'Chacayan', 'Goyllarisquizga'],
      Oxapampa: ['Oxapampa', 'Chontabamba', 'Puerto Bermúdez'],
    },
    Piura: {
      Piura: ['Piura', 'Castilla', 'Catacaos', 'Veintiséis de Octubre'],
      Ayabaca: ['Ayabaca', 'Jililí', 'Lagunas'],
      Huancabamba: ['Huancabamba', 'Canchaque', 'El Carmen de la Frontera'],
      Morropón: ['Chulucanas', 'Buenos Aires', 'Chalaco'],
      Paita: ['Paita', 'Amotape', 'Colán'],
      Sullana: ['Sullana', 'Bellavista', 'Querecotillo'],
      Talara: ['Pariñas', 'El Alto', 'La Brea'],
      Sechura: ['Sechura', 'Bellavista de la Unión', 'Bernal'],
    },
    Puno: {
      Puno: ['Puno', 'Acora', 'Amantaní'],
      Azángaro: ['Azángaro', 'Achaya', 'Arapa'],
      Carabaya: ['Macusani', 'Ajoyani', 'Ayapata'],
      Chucuito: ['Juli', 'Desaguadero', 'Huacullani'],
      El_Collao: ['Ilave', 'Capazo', 'Pilcuyo'],
      Huancané: ['Huancané', 'Cojata', 'Huatasani'],
      Lampa: ['Lampa', 'Cabanilla', 'Calapuja'],
      Melgar: ['Ayaviri', 'Antauta', 'Cupi'],
      Moho: ['Moho', 'Conima', 'Huayrapata'],
      San_Antonio_de_Putina: ['Putina', 'Ananea', 'Pedro Vilca Apaza'],
      San_Román: ['Juliaca', 'Cabana', 'Cabanillas'],
      Sandia: ['Sandia', 'Cuyocuyo', 'Limbani'],
      Yunguyo: ['Yunguyo', 'Anapia', 'Copani'],
    },
    San_Martín: {
      Moyobamba: ['Moyobamba', 'Calzada', 'Habana'],
      Bellavista: ['Bellavista', 'Alto Biavo', 'Bajo Biavo'],
      El_Dorado: ['San José de Sisa', 'Agua Blanca', 'San Martín'],
      Huallaga: ['Saposoa', 'Alto Saposoa', 'El Eslabón'],
      Lamas: ['Lamas', 'Alonso de Alvarado', 'Barranquita'],
      Mariscal_Cáceres: ['Juanjuí', 'Campanilla', 'Pachiza'],
      Picota: ['Picota', 'Buenos Aires', 'Caspisapa'],
      Rioja: ['Rioja', 'Awajún', 'Elías Soplin Vargas'],
      San_Martín: ['Tarapoto', 'Alberto Leveau', 'Cacatachi'],
      Tocache: ['Tocache', 'Nuevo Progreso', 'Pólvora'],
    },
    Tacna: {
      Tacna: ['Tacna', 'Alto de la Alianza', 'Calana'],
      Candarave: ['Candarave', 'Cairani', 'Curibaya'],
      Jorge_Basadre: ['Locumba', 'Ilabaya', 'Ite'],
      Tarata: ['Tarata', 'Chucatamani', 'Estique'],
    },
    Tumbes: {
      Tumbes: ['Tumbes', 'Corrales', 'San Jacinto'],
      Contralmirante_Villar: ['Zorritos', 'Casitas', 'Canoas de Punta Sal'],
      Zarumilla: ['Zarumilla', 'Aguas Verdes', 'Matapalo'],
    },
    Ucayali: {
      Coronel_Portillo: ['Callería', 'Campoverde', 'Yarinacocha'],
      Atalaya: ['Raymondi', 'Sepahua', 'Tahuania'],
      Padre_Abad: ['Irázola', 'Curimaná', 'Neshuya'],
      Purús: ['Purus'],
    },
  };

const MyDirections = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [formData, setFormData] = useState({
    departamento: '',
    provincia: '',
    distrito: '',
    direccion_shalom: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/directions`, {
        method: 'GET'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener las direcciones');
      }
      setAddresses(data.directions);
    } catch (error) {
      toast.error('Error al obtener las direcciones');
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDepartamentoChange = (e) => {
    const departamento = e.target.value;
    setFormData((prev) => ({
      ...prev,
      departamento,
      provincia: '',
      distrito: '',
    }));
  };

  const handleProvinciaChange = (e) => {
    const provincia = e.target.value;
    setFormData((prev) => ({
      ...prev,
      provincia,
      distrito: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLoadingScreen(true);

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/directions/${editingId}`
        : `${API_BASE_URL}/api/directions`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la dirección');
      }

      toast.success(editingId ? 'Dirección actualizada' : 'Dirección agregada');
      setFormData({
        departamento: '',
        provincia: '',
        distrito: '',
        direccion_shalom: '',
      });
      setEditingId(null);
      fetchAddresses();
    } catch (error) {
      toast.error('Error al guardar la dirección');
      console.error('Error saving address:', error);
    } finally {
      setSubmitting(false);
      setLoadingScreen(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.idDireccion);
    setFormData({
      departamento: address.departamento,
      provincia: address.provincia,
      distrito: address.distrito,
      direccion_shalom: address.direccion_shalom,
    });
  };

  const handleDelete = async (idDireccion) => {
    setDeleting(idDireccion);
    setLoadingScreen(true);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/directions/${idDireccion}`, {
        method: 'DELETE',
        headers: {
          'X-Refresh-Token-ID': jwtUtils.getRefreshTokenIDFromCookie() || '',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la dirección');
      }

      toast.success('Dirección eliminada');
      setAddresses(addresses.filter((addr) => addr.idDireccion !== idDireccion));
    } catch (error) {
      toast.error('Error al eliminar la dirección');
      console.error('Error deleting address:', error);
    } finally {
      setDeleting(null);
      setLoadingScreen(false);
    }
  };

  const handleSelect = async (idDireccion) => {
    setLoadingScreen(true);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/directions/${idDireccion}/select`, {
        method: 'PATCH'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al seleccionar la dirección');
      }

      toast.success('Dirección seleccionada');
      fetchAddresses();
    } catch (error) {
      toast.error('Error al seleccionar la dirección');
      console.error('Error selecting address:', error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const departamentos = Object.keys(peruData);
  const provincias = formData.departamento ? Object.keys(peruData[formData.departamento]) : [];
  const distritos = formData.departamento && formData.provincia ? peruData[formData.departamento][formData.provincia] : [];

  return (
    <div>
      {loadingScreen && <LoadingScreen />}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mis Direcciones</h2>

      {/* Formulario para agregar/editar dirección */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Departamento</label>
            <select
              name="departamento"
              value={formData.departamento}
              onChange={handleDepartamentoChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">Selecciona un departamento</option>
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Provincia</label>
            <select
              name="provincia"
              value={formData.provincia}
              onChange={handleProvinciaChange}
              required
              disabled={!formData.departamento}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 disabled:opacity-50"
            >
              <option value="">Selecciona una provincia</option>
              {provincias.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Distrito</label>
            <select
              name="distrito"
              value={formData.distrito}
              onChange={handleInputChange}
              required
              disabled={!formData.provincia}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 disabled:opacity-50"
            >
              <option value="">Selecciona un distrito</option>
              {distritos.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección Detallada</label>
            <input
              type="text"
              name="direccion_shalom"
              value={formData.direccion_shalom}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              placeholder="Ej. Av. Principal 123"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50 flex items-center"
        >
          {submitting && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
          {editingId ? 'Actualizar Dirección' : 'Agregar Dirección'}
        </button>
      </form>

      {/* Lista de direcciones */}
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500">No hay direcciones registradas.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.idDireccion}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {address.departamento}, {address.provincia}, {address.distrito}
                  {address.estado && ' (Activa)'}
                </p>
                <p className="text-sm text-gray-500">{address.direccion_shalom}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(address.idDireccion)}
                  disabled={deleting === address.idDireccion}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                {!address.estado && (
                  <button
                    onClick={() => handleSelect(address.idDireccion)}
                    className="text-green-500 hover:text-green-600"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDirections;