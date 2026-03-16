import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';
import IncidenciaFiltros from './IncidenciaFiltros';

const IncidenciaList = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(
    new URLSearchParams(window.location.search).get('filtros') === 'true'
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isProfesor = user?.rol === 'PROFESOR';

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarIncidencias();
  }, []);

  const cargarIncidencias = async (filtros = {}) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (filtros.alumno?.trim()) params.append('alumno', filtros.alumno.trim());
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.hora) params.append('hora', filtros.hora);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.sensacion) params.append('sensacion', filtros.sensacion);
      if (filtros.solucion) params.append('solucion', filtros.solucion);
      if (filtros.profesor) params.append('profesor', filtros.profesor);
      
      const queryString = params.toString();
      const url = `/incidencias/filtrar${queryString ? '?' + queryString : ''}`;
      
      const response = await api.get(url);
      
      // Ordenar por fecha descendente (más nuevas primero)
      const incidenciasOrdenadas = [...response.data].sort((a, b) => 
        new Date(b.fechaHoraIncidente) - new Date(a.fechaHoraIncidente)
      );
      
      setIncidencias(incidenciasOrdenadas);
      setError('');
    } catch (err) {
      setError('Error al cargar las incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, alumno) => {
    if (window.confirm(`¿Está seguro de eliminar la incidencia de ${alumno}?`)) {
      try {
        await api.delete(`/incidencias/${id}`);
        cargarIncidencias();
      } catch (err) {
        alert('Error al eliminar la incidencia');
      }
    }
  };

  const puedeEditar = (incidencia) => {
    if (isAdmin) return true;
    if (isProfesor && incidencia.profesor?.id === user?.id) return true;
    return false;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerDetalle = (id) => {
    navigate(`/incidencias/${id}`);
  };

  if (loading && incidencias.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando incidencias...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4 px-2 px-md-4">
      {/* Cabecera */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <h2 className="page-title h4 h2-md mb-0">
          <i className="bi bi-journal-text me-2"></i>
          Gestión de Incidencias
        </h2>
        <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
          <button 
            className="btn btn-outline-primary flex-fill flex-md-grow-0"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <i className={`bi bi-chevron-${mostrarFiltros ? 'up' : 'down'} me-1`}></i>
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          <Link to="/incidencias/nueva" className="btn btn-primary flex-fill flex-md-grow-0">
            <i className="bi bi-plus-circle me-2"></i>
            {!isMobile && 'Nueva Incidencia'}
            {isMobile && 'Nueva'}
          </Link>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <IncidenciaFiltros onFiltrar={cargarIncidencias} />
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Listado de incidencias */}
      {incidencias.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay incidencias que coincidan con los filtros
        </div>
      ) : (
        <>
          {/* VISTA MÓVIL: Tarjetas */}
          {isMobile ? (
            <div className="row g-3">
              {incidencias.map((inc) => (
                <div key={inc.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      {/* Cabecera de la tarjeta */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{inc.alumnoNombre}</h5>
                        <div>
                          <span className={`badge ${getTipoBadge(inc.tipoIncidencia)} me-1`}>
                            {inc.tipoIncidencia}
                          </span>
                          <span className={`badge ${getEstadoBadge(inc.estado)}`}>
                            {inc.estado.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Fecha */}
                      <p className="text-muted small mb-2">
                        <i className="bi bi-clock me-1"></i>
                        {formatFechaCorta(inc.fechaHoraIncidente)}
                      </p>

                      {/* Descripción (truncada) */}
                      <p className="card-text mb-2">
                        {inc.descripcion.length > 100 
                          ? inc.descripcion.substring(0, 100) + '...' 
                          : inc.descripcion}
                      </p>

                      {/* Solución y Sensación (si existen) */}
                      <div className="mb-2 small">
                        {inc.solucion && (
                          <span className="badge bg-light text-dark me-1">
                            <i className="bi bi-check-circle me-1"></i>
                            {inc.solucion.nombre}
                          </span>
                        )}
                        {inc.sensacion && (
                          <span className="badge bg-light text-dark">
                            <i className="bi bi-emoji-neutral me-1"></i>
                            {inc.sensacion.nombre}
                          </span>
                        )}
                      </div>

                      {/* Profesor */}
                      <p className="text-muted small mb-3">
                        <i className="bi bi-person me-1"></i>
                        {inc.profesor?.nombre || 'N/A'}
                      </p>

                      {/* Botones de acción */}
                      <div className="d-flex gap-2">
                        <button 
                          onClick={() => handleVerDetalle(inc.id)}
                          className="btn btn-sm bg-info-subtle text-info-emphasis border-0 flex-fill"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver
                        </button>
                        
                        {puedeEditar(inc) && (
                          <>
                            <Link 
                              to={`/incidencias/editar/${inc.id}`} 
                              className="btn btn-sm bg-warning-subtle text-warning-emphasis border-0 flex-fill"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Editar
                            </Link>
                            
                            <button 
                              onClick={() => handleDelete(inc.id, inc.alumnoNombre)}
                              className="btn btn-sm bg-danger-subtle text-danger-emphasis border-0 flex-fill"
                            >
                              <i className="bi bi-trash me-1"></i>
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VISTA ESCRITORIO: Tabla */
            <div className="table-responsive" style={{ 
              overflowX: 'auto',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <table className="table table-hover align-middle mb-0" style={{ minWidth: '1200px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '12%' }}>Alumno/a</th>
                    <th style={{ width: '22%' }}>Descripción</th>
                    <th style={{ width: '12%' }}>Fecha/Hora</th>
                    <th style={{ width: '8%' }}>Tipo</th>
                    <th style={{ width: '10%' }}>Estado</th>
                    <th style={{ width: '10%' }}>Solución</th>
                    <th style={{ width: '10%' }}>Sensación</th>
                    <th style={{ width: '10%' }}>Profesor/a</th>
                    <th style={{ width: '18%' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {incidencias.map((inc) => (
                    <tr key={inc.id}>
                      <td className="fw-bold">{inc.alumnoNombre}</td>
                      <td>
                        <span title={inc.descripcion}>
                          {inc.descripcion.length > 60 
                            ? inc.descripcion.substring(0, 60) + '...' 
                            : inc.descripcion}
                        </span>
                      </td>
                      <td>{formatFecha(inc.fechaHoraIncidente)}</td>
                      <td>
                        <span className={`badge ${getTipoBadge(inc.tipoIncidencia)} px-3 py-2`}>
                          {inc.tipoIncidencia}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadge(inc.estado)} px-3 py-2`}>
                          {inc.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{inc.solucion?.nombre || <span className="text-muted">—</span>}</td>
                      <td>{inc.sensacion?.nombre || <span className="text-muted">—</span>}</td>
                      <td>{inc.profesor?.nombre || 'N/A'}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button 
                            onClick={() => handleVerDetalle(inc.id)}
                            className="btn btn-sm bg-info-subtle text-info-emphasis border-0"
                            title="Ver detalle"
                            style={{ transition: 'all 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9eeaf9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Ver
                          </button>
                          
                          {puedeEditar(inc) && (
                            <>
                              <Link 
                                to={`/incidencias/editar/${inc.id}`} 
                                className="btn btn-sm bg-warning-subtle text-warning-emphasis border-0"
                                title="Editar"
                                style={{ transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe69c'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Editar
                              </Link>
                              
                              <button 
                                onClick={() => handleDelete(inc.id, inc.alumnoNombre)}
                                className="btn btn-sm bg-danger-subtle text-danger-emphasis border-0"
                                title="Eliminar"
                                style={{ transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1aeb5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total de incidencias */}
          {incidencias.length > 0 && (
            <div className="mt-3 text-muted small d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-info-circle me-1"></i>
                Total: <strong>{incidencias.length}</strong> incidencias
              </span>
              {!isMobile && (
                <span className="text-secondary">
                  <i className="bi bi-arrow-left-right me-1"></i>
                  Usa scroll horizontal para ver más columnas
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Funciones auxiliares para badges
const getTipoBadge = (tipo) => {
  switch(tipo) {
    case 'LEVE': 
      return 'bg-success-subtle text-success-emphasis';
    case 'GRAVE': 
      return 'bg-warning-subtle text-warning-emphasis';
    case 'MUY_GRAVE': 
      return 'bg-danger-subtle text-danger-emphasis';
    default: 
      return 'bg-secondary-subtle text-secondary-emphasis';
  }
};

const getEstadoBadge = (estado) => {
  switch(estado) {
    case 'PENDIENTE': 
      return 'bg-warning-subtle text-warning-emphasis';
    case 'EN_REVISION': 
      return 'bg-info-subtle text-info-emphasis';
    case 'RESUELTA': 
      return 'bg-success-subtle text-success-emphasis';
    default: 
      return 'bg-secondary-subtle text-secondary-emphasis';
  }
};

export default IncidenciaList;