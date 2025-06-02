import axios from 'axios';
import API_BASE_URL from './urlHelper';
import jwtUtils from '../utilities/jwtUtils';

// Callback para notificar a la UI sobre el modo mantenimiento
let onMaintenanceDetected = null;

// Establecer callback para detección de mantenimiento
export function setMaintenanceCallback(callback) {
  onMaintenanceDetected = callback;
}

// Verificar si el error indica modo mantenimiento
function isMaintenanceError(error) {
  if (error.response) {
    // HTTP 503 Service Unavailable o respuesta personalizada
    if (error.response.status === 503 || error.response.data?.maintenance) {
      return true;
    }
  }
  // Errores de red (servidor fuera de línea, por ejemplo, contenedor Docker detenido)
  return error.message.includes('Network Error') || !error.response;
}

async function validateRefreshTokenID() {
  let refresh_token, refresh_token_id, userID; // Declare variables

  try {
    refresh_token = jwtUtils.getRefreshTokenFromCookie();
    refresh_token_id = jwtUtils.getRefreshTokenIDFromCookie();
    userID = jwtUtils.getUserID(refresh_token);
  } catch (e) {
    console.log('[Token] Error al obtener datos del refresh token:', e.message);
    return false;
  }

  if (!refresh_token_id || !userID) {
    console.log('[Token] No se encontró ID de refresh token o ID de usuario');
    return false;
  }

  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/validate-refresh-token`, {
      refresh_token_id,
      userID,
    });
    return data.valid;
  } catch (error) {
    if (isMaintenanceError(error)) {
      console.log('[Token] Servidor en mantenimiento, evitando validación');
      if (onMaintenanceDetected) {
        onMaintenanceDetected(true, error.response?.data?.message || 'El servidor está trabajando');
      }
      return true; // Evita el logout durante el mantenimiento
    }
    console.error('[Token] Error al validar ID de refresh token:', error.message);
    return false;
  }
}

async function refreshAccessToken() {
  let refresh_token; // Declare variable

  try {
    refresh_token = jwtUtils.getRefreshTokenFromCookie();
  } catch (e) {
    console.error('[Token] Error al obtener refresh token:', e.message);
    logout();
    throw new Error('No refresh token válido');
  }

  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/refresh`, { refresh_token });
    const newAccessToken = data.access_token;
    jwtUtils.setAccessTokenInCookie(newAccessToken);
    return newAccessToken;
  } catch (error) {
    if (isMaintenanceError(error)) {
      console.log('[Token] Servidor en mantenimiento, evitando logout');
      if (onMaintenanceDetected) {
        onMaintenanceDetected(true, error.response?.data?.message || 'El servidor está trabajando');
      }
      throw new Error('Servidor en mantenimiento');
    }
    console.error('[Token] Error al refrescar el token:', error.message);
    logout();
    throw error;
  }
}

function isTokenExpired(token) {
  if (!token) {
    return true;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('[Token] Error al decodificar token:', error.message);
    return true;
  }
}

async function verificarYRenovarToken() {
  try {
    const access_token = jwtUtils.getAccessTokenFromCookie();
    
    // Si el access token no está expirado, usarlo directamente
    if (!isTokenExpired(access_token)) {
      return access_token;
    }

    // Verificar el refresh token
    const isValidRefreshTokenID = await validateRefreshTokenID();
    if (!isValidRefreshTokenID) {
      console.log('[Token] ID de refresh token no válido. Posible inicio de sesión en otro dispositivo.');
      logout();
      throw new Error('Sesión cerrada por inicio de sesión en otro dispositivo');
    }

    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    if (isTokenExpired(refresh_token)) {
      console.log('[Token] Refresh token también expirado. Sesión finalizada');
      logout();
      throw new Error('Sesión expirada');
    }

    // Renovar el access token
    return await refreshAccessToken();
  } catch (error) {
    if (error.message === 'Servidor en mantenimiento') {
      throw error; // Permitir que el llamador maneje el mantenimiento
    }
    throw error;
  }
}

async function fetchWithAuth(url, options = {}) {
  //console.log(`[API] Solicitud a: ${url}`);
  const access_token = await verificarYRenovarToken();
  
  // console.log('[API] Enviando solicitud con token:', access_token?.substring(0, 15) + '...');
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${access_token}`
  };
  
  return fetch(url, { ...options, headers });
}

function logout() {
  jwtUtils.removeTokensFromCookie();
  window.location.href = '/'; // Redirigir a la página de login
}

export { fetchWithAuth, verificarYRenovarToken, logout, validateRefreshTokenID };