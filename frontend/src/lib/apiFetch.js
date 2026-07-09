const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let refrescando = false;
let colaEspera = [];

const procesarCola = (exito) => {
  colaEspera.forEach((cb) => cb(exito));
  colaEspera = [];
};

export async function apiFetch(ruta, opciones = {}) {
  const url = ruta.startsWith('http') ? ruta : `${API_URL}${ruta}`;

  const config = {
    ...opciones,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opciones.headers },
  };

  // Si se envía FormData el navegador pone el Content-Type con boundary automáticamente
  if (opciones.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  let respuesta = await fetch(url, config);

  if (respuesta.status !== 401) return respuesta;


  if (refrescando) {
    // Hay otro refresh en curso; encolar y esperar
    return new Promise((resolve, reject) => {
      colaEspera.push(async (exito) => {
        if (!exito) return reject(new Error('Sesión expirada'));
        resolve(await fetch(url, config));
      });
    });
  }

  refrescando = true;

  const refreshRespuesta = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  refrescando = false;

  if (!refreshRespuesta.ok) {
    procesarCola(false);
    // Redirigir al home para que el modal de login aparezca
    window.location.href = '/';
    return respuesta;
  }

  procesarCola(true);
  // Reintentar la petición original con el nuevo access token en cookie
  respuesta = await fetch(url, config);
  return respuesta;
}
