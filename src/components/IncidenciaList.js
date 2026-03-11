import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';  // Añadido useNavigate
import api from '../services/api';
import authService from '../services/auth';
import IncidenciaFiltros from './IncidenciaFiltros';

const IncidenciaList = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(  // NUEVO: estado para filtros
    new URLSearchParams(window.location.search).get('filtros') === 'true'
  );
  
  const navigate = useNavigate();  // NUEVO: para navegación
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isProfesor = user?.rol === 'PROFESOR';

  useEffect(() => {
    cargarIncidencias();
  }, []);

  const cargarIncidencias = async (filtros = {}) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (filtros.alumno?.trim()) params.append('alumno', filtros.alumno.trim());
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.hora) params.append('hora', filtros.hora);  // NUEVO: filtro por hora
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.sensacion) params.append('sensacion', filtros.sensacion);
      if (filtros.solucion) params.append('solucion', filtros.solucion);
      if (filtros.profesor) params.append('profesor', filtros.profesor);
      
      const queryString = params.toString();
      const url = `/incidencias/filtrar${queryString ? '?' + queryString : ''}`;
      
      const response = await api.get(url);
      setIncidencias(response.data);
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerDetalle = (id) => {  // NUEVO: función para navegar al detalle
    navigate(`/incidencias/${id}`);
  };

  if (loading && incidencias.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando incidencias...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-journal-text me-2"></i>
          Gestión de Incidencias
        </h2>
        <div>  {/* NUEVO: contenedor para botones */}
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <i className={`bi bi-chevron-${mostrarFiltros ? 'up' : 'down'} me-1`}></i>
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          <Link to="/incidencias/nueva" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Incidencia
          </Link>
        </div>
      </div>

      {/* NUEVO: filtros condicionales */}
      {mostrarFiltros && (
        <IncidenciaFiltros onFiltrar={cargarIncidencias} />
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {incidencias.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay incidencias que coincidan con los filtros
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Alumno/a</th>
                <th>Descripción</th>
                <th>Fecha/Hora</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Solución</th>
                <th>Sensación</th>
                <th>Profesor/a</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <strong>{inc.alumnoNombre}</strong>
                  </td>
                  <td>
                    {inc.descripcion.length > 50 
                      ? inc.descripcion.substring(0, 50) + '...' 
                      : inc.descripcion}
                  </td>
                  <td>{formatFecha(inc.fechaHoraIncidente)}</td>
                  <td>
                    <span className={`badge ${getTipoBadge(inc.tipoIncidencia)}`}>
                      {inc.tipoIncidencia}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getEstadoBadge(inc.estado)}`}>
                      {inc.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{inc.solucion?.nombre || <span className="text-muted">-</span>}</td>
                  <td>{inc.sensacion?.nombre || <span className="text-muted">-</span>}</td>
                  <td>{inc.profesor?.nombre || 'N/A'}</td>
                  <td>
                    <div className="btn-group" role="group">
                      {/* NUEVO: botón Ver */}
                      <button 
                        onClick={() => handleVerDetalle(inc.id)}
                        className="btn btn-action btn-info me-1"
                        title="Ver detalle de incidencia"
                      >
                        <i className="bi bi-eye me-1"></i>
                        Ver
                      </button>
                      
                      {puedeEditar(inc) && (
                        <>
                          <Link 
                            to={`/incidencias/editar/${inc.id}`} 
                            className="btn btn-action btn-action-edit me-1"
                            title="Editar incidencia"
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Editar
                          </Link>
                          <button 
                            onClick={() => handleDelete(inc.id, inc.alumnoNombre)}
                            className="btn btn-action btn-action-delete"
                            title="Eliminar incidencia"
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
          
          <div className="mt-3 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Total: {incidencias.length} incidencias
          </div>
        </div>
      )}
    </div>
  );
};

// Funciones auxiliares para badges
const getTipoBadge = (tipo) => {
  switch(tipo) {
    case 'LEVE': return 'badge-success';
    case 'GRAVE': return 'badge-warning';
    case 'MUY_GRAVE': return 'badge-danger';
    default: return 'badge-secondary';
  }
};

const getEstadoBadge = (estado) => {
  switch(estado) {
    case 'PENDIENTE': return 'badge-secondary';
    case 'EN_REVISION': return 'badge-info';
    case 'RESUELTA': return 'badge-success';
    default: return 'badge-secondary';
  }
};

export default IncidenciaList;