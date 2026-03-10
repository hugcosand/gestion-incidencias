import api from './api';

const notificacionService = {
  // Obtener notificaciones no leídas
  obtenerNoLeidas: async () => {
    try {
      const response = await api.get('/notificaciones/no-leidas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  },

  // Contar notificaciones no leídas
  contarNoLeidas: async () => {
    try {
      const response = await api.get('/notificaciones/contar-no-leidas');
      return response.data;
    } catch (error) {
      console.error('Error al contar notificaciones:', error);
      return 0;
    }
  },

  // Marcar todas como leídas
  marcarComoLeidas: async () => {
    try {
      await api.post('/notificaciones/marcar-leidas');
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
    }
  }
};

export default notificacionService;