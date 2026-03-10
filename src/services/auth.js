import api from './api';

const authService = {
  login: async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    
    if (response.data) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userData', JSON.stringify(response.data));
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error('Error detallado:', error);
    console.error('Respuesta del servidor:', error.response);
    
    let mensajeError = 'Error al conectar con el servidor';
    
    // Si el servidor responde con un mensaje personalizado
    if (error.response) {
      // Si la respuesta es texto plano
      if (typeof error.response.data === 'string') {
        mensajeError = error.response.data;
      } 
      // Si la respuesta es un objeto con mensaje
      else if (error.response.data?.message) {
        mensajeError = error.response.data.message;
      }
      // Si es un error 401 (no autorizado)
      else if (error.response.status === 401) {
        mensajeError = error.response.data || 'Credenciales incorrectas';
      }
    }
    
    return { 
      success: false, 
      error: mensajeError
    };
  }
},

  logout: () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'ADMIN';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('userEmail');
  }
};

export default authService;