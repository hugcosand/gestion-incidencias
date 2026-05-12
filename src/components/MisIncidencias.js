import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

const MisIncidencias = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    cargarMisIncidencias();
  }, []);

  const cargarMisIncidencias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/incidencias/mis-incidencias');
      setIncidencias(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar tus incidencias.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta incidencia?')) return;
    try {
      await api.delete(`/incidencias/${id}`);
      cargarMisIncidencias();
    } catch (err) {
      alert('Error al eliminar la incidencia.');
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

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando tus incidencias...</p>
    </div>
  );

  return (
    <div className="container-fluid mt-4 px-4">

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title mb-0">
            <i className="bi bi-person-lines-fill me-2"></i>
            Mis Incidencias
          </h2>
          <small className="text-muted">
            Incidencias registradas por <strong>{user?.nombre}</strong>
          </small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={cargarMisIncidencias}>
            <i className="bi bi-arrow-repeat me-1"></i>
            Actualizar
          </button>
          <Link to="/incidencias/nueva" className="btn bg-primary-subtle text-primary-emphasis border-0 px-3 py-2">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Incidencia
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      )}

      {/* Resumen rápido */}
      {incidencias.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Total',       value: incidencias.length,                                                         color: 'primary', icon: 'bi-journal-text' },
            { label: 'Pendientes',  value: incidencias.filter(i => i.estado === 'PENDIENTE').length,                   color: 'warning', icon: 'bi-clock' },
            { label: 'En revisión', value: incidencias.filter(i => i.estado === 'EN_REVISION').length,                 color: 'info',    icon: 'bi-eye' },
            { label: 'Resueltas',   value: incidencias.filter(i => i.estado === 'RESUELTA').length,                    color: 'success', icon: 'bi-check-circle' },
          ].map(({ label, value, color, icon }) => (
            <div className="col-6 col-md-3" key={label}>
              <div className={`card border-0 shadow-sm bg-${color}-subtle`}>
                <div className="card-body py-3 px-3 d-flex align-items-center gap-3">
                  <i className={`bi ${icon} fs-3 text-${color}-emphasis`}></i>
                  <div>
                    <div className={`fw-bold fs-4 text-${color}-emphasis`}>{value}</div>
                    <div className={`small text-${color}-emphasis`}>{label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista */}
      {incidencias.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-x text-muted" style={{ fontSize: '4rem' }}></i>
          <p className="mt-3 text-muted fs-5">No tienes incidencias registradas todavía.</p>
          <Link to="/incidencias/nueva" className="btn btn-primary mt-2">
            <i className="bi bi-plus-circle me-2"></i>
            Crear primera incidencia
          </Link>
        </div>
      ) : (
        <div className="table-responsive" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
            <thead className="table-light">
              <tr>
                <th>Alumno/a</th>
                <th>Fecha incidente</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Solución</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.map((inc) => (
                <tr key={inc.id}>
                  <td className="fw-semibold">{inc.alumnoNombre}</td>
                  <td className="text-muted small">{formatFecha(inc.fechaHoraIncidente)}</td>
                  <td>
                    <span className={`badge ${getBadgeTipo(inc.tipoIncidencia)} px-2 py-1`}>
                      {inc.tipoIncidencia?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeEstado(inc.estado)} px-2 py-1`}>
                      {inc.estado?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-muted small">
                    {inc.solucion?.nombre || <span className="fst-italic">Sin solución</span>}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link
                        to={`/incidencias/${inc.id}`}
                        className="btn btn-sm bg-primary-subtle text-primary-emphasis border-0"
                        title="Ver detalle"
                      >
                        <i className="bi bi-eye me-1"></i>Ver
                      </Link>
                      <Link
                        to={`/incidencias/editar/${inc.id}`}
                        className="btn btn-sm bg-warning-subtle text-warning-emphasis border-0"
                        title="Editar"
                      >
                        <i className="bi bi-pencil me-1"></i>Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(inc.id)}
                        className="btn btn-sm bg-danger-subtle text-danger-emphasis border-0"
                        title="Eliminar"
                      >
                        <i className="bi bi-trash me-1"></i>Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-3 py-2 text-muted small text-end bg-light border-top">
            Total: <strong>{incidencias.length}</strong> incidencias tuyas
          </div>
        </div>
      )}
    </div>
  );
};

export default MisIncidencias;