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
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al conectar con el servidor' 
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