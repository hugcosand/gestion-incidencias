import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificacionService from '../services/notificaciones';

const NotificacionesDropdown = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [contador, setContador] = useState(0);
  const [mostrar, setMostrar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarNotificaciones();
    
    // Actualizar cada 30 segundos
    const intervalo = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarNotificaciones = async () => {
    const noLeidas = await notificacionService.obtenerNoLeidas();
    setNotificaciones(noLeidas);
    setContador(noLeidas.length);
  };

  const handleVerNotificaciones = async () => {
    setMostrar(!mostrar);
    if (!mostrar) {
      await notificacionService.marcarComoLeidas();
      setContador(0);
    }
  };

  // ✅ Función corregida - maneja correctamente null
  const irAIncidencia = (incidenciaId) => {
    setMostrar(false);
    if (incidenciaId && incidenciaId !== 'null') {
      navigate(`/incidencias/editar/${incidenciaId}`);
    } else {
      navigate('/incidencias');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const ahora = new Date();
    const diffHoras = Math.floor((ahora - date) / (1000 * 60 * 60));
    
    if (diffHoras < 1) {
      return 'Hace unos minutos';
    } else if (diffHoras < 24) {
      return `Hace ${diffHoras} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="dropdown d-inline-block">
      <button 
        className="btn btn-link text-white position-relative"
        onClick={handleVerNotificaciones}
        style={{ textDecoration: 'none' }}
      >
        <i className="bi bi-bell fs-5"></i>
        {contador > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {contador}
          </span>
        )}
      </button>

      {mostrar && (
        <div className="dropdown-menu dropdown-menu-end show" style={{ width: '380px', maxWidth: '90vw' }}>
          {/* Cabecera */}
          <div className="dropdown-header d-flex justify-content-between align-items-center bg-light">
            <span><strong>Notificaciones</strong></span>
            <span className="badge bg-primary">{notificaciones.length} nuevas</span>
          </div>
          
          <div className="dropdown-divider"></div>
          
          {/* Lista de notificaciones */}
          {notificaciones.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="bi bi-check-circle fs-1"></i>
              <p className="mb-0 mt-2">No tienes notificaciones</p>
              <small>Todo está al día</small>
            </div>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notificaciones.map((notif) => (
                <div 
                  key={notif.id}
                  className="dropdown-item border-bottom p-3"
                  onClick={() => irAIncidencia(notif.incidenciaId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                        <i className="bi bi-exclamation-circle text-warning"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1 fw-bold">{notif.mensaje}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {formatFecha(notif.fechaCreacion)}
                        </small>
                        {!notif.leida && (
                          <span className="badge bg-primary rounded-pill">Nueva</span>
                        )}
                      </div>
                      {notif.alumnoNombre && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-person me-1"></i>
                          {notif.alumnoNombre}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="dropdown-divider"></div>
          
          {/* Pie con acciones */}
          <div className="p-2 d-flex justify-content-between">
            <button 
              className="btn btn-sm btn-outline-primary flex-grow-1 me-1"
              onClick={() => irAIncidencia(null)}
            >
              <i className="bi bi-list me-1"></i>
              Ver todas
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setMostrar(false);
                cargarNotificaciones();
              }}
            >
              <i className="bi bi-arrow-repeat"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesDropdown;