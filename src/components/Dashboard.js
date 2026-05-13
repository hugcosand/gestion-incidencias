import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

const Dashboard = () => {
  const [ultimasIncidencias, setUltimasIncidencias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [notificaciones, setNotificaciones] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [incRes, notifRes] = await Promise.all([
        api.get('/incidencias'),
        api.get('/notificaciones/contar-no-leidas'),
      ]);

      // Últimas 5 incidencias
      const todas = incRes.data || [];
      setUltimasIncidencias(todas.slice(0, 5));
      setNotificaciones(notifRes.data || 0);

      // Estadísticas solo para ADMIN
      if (isAdmin) {
        const statsRes = await api.get('/estadisticas');
        setEstadisticas(statsRes.data);
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeTipo = (tipo) => {
    switch (tipo) {
      case 'LEVE':      return 'bg-success-subtle text-success-emphasis';
      case 'GRAVE':     return 'bg-warning-subtle text-warning-emphasis';
      case 'MUY_GRAVE': return 'bg-danger-subtle text-danger-emphasis';
      default:          return 'bg-secondary-subtle text-secondary-emphasis';
    }
  };

  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'PENDIENTE':   return 'bg-warning-subtle text-warning-emphasis';
      case 'EN_REVISION': return 'bg-info-subtle text-info-emphasis';
      case 'RESUELTA':    return 'bg-success-subtle text-success-emphasis';
      default:            return 'bg-secondary-subtle text-secondary-emphasis';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2 text-muted">Cargando...</p>
    </div>
  );

  return (
    <div className="container-fluid mt-4 px-4">

      {/* Saludo */}
      <div className="mb-4">
        <h2 className="page-title mb-1">
          {saludo}, <strong>{user?.nombre}</strong> 👋
        </h2>
        <p className="text-muted mb-0">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="badge bg-secondary-subtle text-secondary-emphasis ms-2">{user?.rol}</span>
        </p>
      </div>

      {/* Tarjetas de acceso rápido */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Link to="/incidencias/nueva" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #2c3e50' }}>
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 48, height: 48, minWidth: 48 }}>
                  <i className="bi bi-plus-circle fs-4 text-primary"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark small">Nueva</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Incidencia</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <Link to="/incidencias" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #3498db' }}>
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div className="bg-info-subtle rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 48, height: 48, minWidth: 48 }}>
                  <i className="bi bi-journal-text fs-4 text-info"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark small">Ver todas</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Incidencias</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <Link to="/mis-incidencias" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #27ae60' }}>
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div className="bg-success-subtle rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 48, height: 48, minWidth: 48 }}>
                  <i className="bi bi-person-lines-fill fs-4 text-success"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark small">Las mías</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Mis incidencias</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="card-body d-flex align-items-center gap-3 py-3">
              <div className="bg-danger-subtle rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: 48, height: 48, minWidth: 48 }}>
                <i className="bi bi-bell fs-4 text-danger"></i>
              </div>
              <div>
                <div className="fw-bold text-dark small">{notificaciones}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Sin leer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">

        {/* Últimas incidencias */}
        <div className={isAdmin ? 'col-md-7' : 'col-12'}>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <span className="fw-semibold">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                Últimas incidencias
              </span>
              <Link to="/incidencias" className="btn btn-sm btn-outline-primary">Ver todas</Link>
            </div>
            <div className="card-body p-0">
              {ultimasIncidencias.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-journal-x fs-1"></i>
                  <p className="mt-2">No hay incidencias registradas</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {ultimasIncidencias.map(inc => (
                    <li key={inc.id} className="list-group-item px-3 py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="fw-semibold">{inc.alumnoNombre}</span>
                          <span className="text-muted small ms-2">{inc.profesor?.nombre}</span>
                          <div className="mt-1 d-flex gap-1">
                            <span className={`badge ${getBadgeTipo(inc.tipoIncidencia)} small`}>
                              {inc.tipoIncidencia?.replace('_', ' ')}
                            </span>
                            <span className={`badge ${getBadgeEstado(inc.estado)} small`}>
                              {inc.estado?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {formatFecha(inc.fechaHoraIncidente)}
                          </div>
                          <Link to={`/incidencias/${inc.id}`}
                                className="btn btn-sm bg-primary-subtle text-primary-emphasis border-0 mt-1"
                                style={{ fontSize: '0.75rem' }}>
                            Ver
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas — solo ADMIN */}
        {isAdmin && estadisticas && (
          <div className="col-md-5">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  <i className="bi bi-bar-chart-line me-2 text-warning"></i>
                  Resumen
                </span>
                <Link to="/estadisticas" className="btn btn-sm btn-outline-warning">Detalle</Link>
              </div>
              <div className="card-body">

                {/* Total */}
                <div className="text-center mb-3">
                  <div className="fw-bold" style={{ fontSize: '2.5rem', color: '#2c3e50' }}>
                    {estadisticas.totalIncidencias}
                  </div>
                  <div className="text-muted small">incidencias totales</div>
                </div>

                {/* Por estado */}
                <div className="mb-3">
                  <div className="text-muted small fw-semibold mb-2">POR ESTADO</div>
                  {estadisticas.porEstado && Object.entries(estadisticas.porEstado).map(([estado, n]) => (
                    <div key={estado} className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small">{estado.replace('_', ' ')}</span>
                      <span className="fw-bold small">{n}</span>
                    </div>
                  ))}
                </div>

                {/* Por tipo */}
                <div className="mb-3">
                  <div className="text-muted small fw-semibold mb-2">POR TIPO</div>
                  {estadisticas.porTipo && Object.entries(estadisticas.porTipo).map(([tipo, n]) => (
                    <div key={tipo} className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small">{tipo.replace('_', ' ')}</span>
                      <span className="fw-bold small">{n}</span>
                    </div>
                  ))}
                </div>

                {/* Profesor más activo */}
                {estadisticas.profesorMasActivo && (
                  <div className="alert alert-info py-2 px-3 mb-0 small">
                    <i className="bi bi-trophy me-1"></i>
                    Más activo: <strong>{estadisticas.profesorMasActivo}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;