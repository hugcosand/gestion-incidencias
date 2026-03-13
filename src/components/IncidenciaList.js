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
    <div className="container-fluid mt-4 px-4">
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
  <div className="table-responsive" style={{ 
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <table className="table table-hover align-middle mb-0" style={{ minWidth: '1300px' }}>
      <thead className="table-light">
        <tr>
          <th style={{ width: '12%' }}>Alumno/a</th>
          <th style={{ width: '20%' }}>Descripción</th>
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

{incidencias.length > 0 && (
  <div className="mt-3 text-muted small d-flex justify-content-between align-items-center">
    <span>
      <i className="bi bi-info-circle me-1"></i>
      Total: <strong>{incidencias.length}</strong> incidencias
    </span>
    <span className="text-secondary">
      <i className="bi bi-arrow-left-right me-1"></i>
      Usa scroll horizontal para ver más columnas
    </span>
  </div>
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