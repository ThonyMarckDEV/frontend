import jwtUtils from '../utilities/jwtUtils.jsx';

export async function logout() {
  // Eliminar el token de localStorage
  jwtUtils.removeTokensFromCookie();

  // Redirigir a la página de inicio de sesión en el dominio raíz
  window.location.href = `/`;
}


window.logout = logout;