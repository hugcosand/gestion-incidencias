import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Estadisticas = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/estadisticas');
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las estadísticas. Comprueba que tienes permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':   return { bg: 'bg-warning-subtle', text: 'text-warning-emphasis', icon: 'bi-clock' };
      case 'EN_REVISION': return { bg: 'bg-info-subtle',    text: 'text-info-emphasis',    icon: 'bi-eye' };
      case 'RESUELTA':    return { bg: 'bg-success-subtle', text: 'text-success-emphasis', icon: 'bi-check-circle' };
      default:            return { bg: 'bg-secondary-subtle', text: 'text-secondary-emphasis', icon: 'bi-question-circle' };
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'LEVE':      return { bg: 'bg-success-subtle', text: 'text-success-emphasis', icon: 'bi-exclamation-circle' };
      case 'GRAVE':     return { bg: 'bg-warning-subtle', text: 'text-warning-emphasis', icon: 'bi-exclamation-triangle' };
      case 'MUY_GRAVE': return { bg: 'bg-danger-subtle',  text: 'text-danger-emphasis',  icon: 'bi-exclamation-octagon' };
      default:          return { bg: 'bg-secondary-subtle', text: 'text-secondary-emphasis', icon: 'bi-question' };
    }
  };

  const getPorcentaje = (valor, total) => {
    if (!total || total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando estadísticas...</p>
    </div>
  );

  if (error) return (
    <div className="container mt-4">
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
      <Link to="/incidencias" className="btn btn-outline-secondary">
        <i className="bi bi-arrow-left me-2"></i>Volver
      </Link>
    </div>
  );

  const totalEstado = stats?.porEstado ? Object.values(stats.porEstado).reduce((a, b) => a + b, 0) : 0;
  const totalTipo   = stats?.porTipo   ? Object.values(stats.porTipo).reduce((a, b) => a + b, 0)   : 0;

  return (
    <div className="container-fluid mt-4 px-4">

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-bar-chart-line me-2"></i>
          Estadísticas generales
        </h2>
        <button className="btn btn-outline-primary btn-sm" onClick={cargarEstadisticas}>
          <i className="bi bi-arrow-repeat me-1"></i>
          Actualizar
        </button>
      </div>

      {/* Tarjeta total */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderLeft: '5px solid #2c3e50', borderRadius: '8px' }}>
            <div className="card-body d-flex align-items-center gap-4 py-3">
              <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: 64, height: 64, minWidth: 64 }}>
                <i className="bi bi-journal-text fs-2 text-primary"></i>
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase letter-spacing-1">
                  Total de incidencias registradas
                </div>
                <div className="fw-bold" style={{ fontSize: '2.5rem', lineHeight: 1.1, color: '#2c3e50' }}>
                  {stats?.totalIncidencias ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">

        {/* Por estado */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-toggles me-2 text-primary"></i>
              Incidencias por estado
            </div>
            <div className="card-body">
              {stats?.porEstado && Object.keys(stats.porEstado).length > 0 ? (
                Object.entries(stats.porEstado)
                  .sort((a, b) => b[1] - a[1])
                  .map(([estado, cantidad]) => {
                    const { bg, text, icon } = getEstadoColor(estado);
                    const pct = getPorcentaje(cantidad, totalEstado);
                    return (
                      <div key={estado} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className={`badge ${bg} ${text} px-2 py-1`}>
                            <i className={`bi ${icon} me-1`}></i>
                            {estado.replace('_', ' ')}
                          </span>
                          <span className="fw-bold text-dark">{cantidad} <span className="text-muted fw-normal small">({pct}%)</span></span>
                        </div>
                        <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                          <div
                            className={`progress-bar ${estado === 'RESUELTA' ? 'bg-success' : estado === 'EN_REVISION' ? 'bg-info' : 'bg-warning'}`}
                            style={{ width: `${pct}%`, borderRadius: 4 }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-muted">Sin datos</p>
              )}
            </div>
          </div>
        </div>

        {/* Por tipo */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
              Incidencias por tipo
            </div>
            <div className="card-body">
              {stats?.porTipo && Object.keys(stats.porTipo).length > 0 ? (
                Object.entries(stats.porTipo)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tipo, cantidad]) => {
                    const { bg, text, icon } = getTipoColor(tipo);
                    const pct = getPorcentaje(cantidad, totalTipo);
                    return (
                      <div key={tipo} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className={`badge ${bg} ${text} px-2 py-1`}>
                            <i className={`bi ${icon} me-1`}></i>
                            {tipo.replace('_', ' ')}
                          </span>
                          <span className="fw-bold text-dark">{cantidad} <span className="text-muted fw-normal small">({pct}%)</span></span>
                        </div>
                        <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                          <div
                            className={`progress-bar ${tipo === 'LEVE' ? 'bg-success' : tipo === 'GRAVE' ? 'bg-warning' : 'bg-danger'}`}
                            style={{ width: `${pct}%`, borderRadius: 4 }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-muted">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">

        {/* Profesor más activo */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-person-badge me-2 text-primary"></i>
              Profesor más activo
            </div>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: 56, height: 56, minWidth: 56 }}>
                <i className="bi bi-person-fill fs-3 text-primary"></i>
              </div>
              <div>
                <div className="fw-bold fs-5" style={{ color: '#2c3e50' }}>
                  {stats?.profesorMasActivo ?? 'Sin datos'}
                </div>
                <div className="text-muted small">Mayor número de incidencias registradas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top alumnos */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-semibold">
              <i className="bi bi-trophy me-2 text-warning"></i>
              Alumnos con más incidencias
            </div>
            <div className="card-body p-0">
              {stats?.alumnosConMasIncidencias?.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {stats.alumnosConMasIncidencias.map((alumno, index) => (
                    <li key={index} className="list-group-item d-flex align-items-center gap-3 px-3 py-2">
                      <span className={`badge rounded-circle d-flex align-items-center justify-content-center fw-bold
                        ${index === 0 ? 'bg-warning text-dark' : index === 1 ? 'bg-secondary' : 'bg-light text-dark border'}`}
                        style={{ width: 28, height: 28, minWidth: 28, fontSize: '0.8rem' }}>
                        {index + 1}
                      </span>
                      <span className="fw-medium">{alumno}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted p-3">Sin datos</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Nota al pie */}
      <div className="text-muted small mt-4 text-end">
        <i className="bi bi-info-circle me-1"></i>
        Los datos se calculan en tiempo real sobre todas las incidencias del sistema.
      </div>

    </div>
  );
};

export default Estadisticas;