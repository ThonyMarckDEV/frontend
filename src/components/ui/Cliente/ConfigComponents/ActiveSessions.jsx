import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../../js/urlHelper';
import jwtUtils from '../../../../utilities/jwtUtils';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../../js/authToken';
import LoadingScreen from '../../../LoadingScreen';

const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  const [loadingScreen, setLoadingScreen] = useState(false);
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const SesionID = jwtUtils.getRefreshTokenIDFromCookie(refresh_token);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/sessions`, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener las sesiones');
      }
      // Map sessions to set is_current based on SesionID comparison
      const updatedSessions = data.sessions.map((session) => ({
        ...session,
        is_current: session.idRefreshToken === SesionID,
      }));
      setSessions(updatedSessions);
    } catch (error) {
      toast.error('Error al obtener las sesiones activas');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (idRefreshToken) => {
    setDeleting(idRefreshToken);
    setLoadingScreen(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/sessions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idRefreshToken }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la sesión');
      }

      toast.success('Sesión eliminada correctamente');
      if (idRefreshToken === SesionID) {
        jwtUtils.removeTokensFromCookie();
        navigate('/login');
        window.location.reload();
      } else {
        setSessions(sessions.filter((session) => session.idRefreshToken !== idRefreshToken));
      }
    } catch (error) {
      toast.error('Error al eliminar la sesión');
      console.error('Error deleting session:', error);
    } finally {
      setDeleting(null);
      setLoadingScreen(false);
    }
  };

  return (
    <div>
      {loadingScreen && <LoadingScreen />}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Sesiones Activas</h2>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No hay sesiones activas.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.idRefreshToken}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {session.device} {session.is_current && '(Sesión Actual)'}
                </p>
                <p className="text-sm text-gray-500">IP: {session.ip_address}</p>
                <p className="text-sm text-gray-500">
                  Iniciada: {new Date(session.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Expira: {new Date(session.expires_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteSession(session.idRefreshToken)}
                disabled={deleting === session.idRefreshToken}
                className="text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveSessions;