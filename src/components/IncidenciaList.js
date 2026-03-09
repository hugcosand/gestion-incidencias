import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';
import IncidenciaFiltros from './IncidenciaFiltros';

const IncidenciaList = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isProfesor = user?.rol === 'PROFESOR';

  // Cargar incidencias al montar el componente
  useEffect(() => {
    cargarIncidencias();
  }, []);

  const cargarIncidencias = async (filtros = {}) => {
    try {
      setLoading(true);
      
      // Construir query params solo con los filtros que tienen valor
      const params = new URLSearchParams();
      
      if (filtros.alumno && filtros.alumno.trim() !== '') {
        params.append('alumno', filtros.alumno.trim());
      }
      if (filtros.fecha && filtros.fecha !== '') {
        params.append('fecha', filtros.fecha);
      }
      if (filtros.tipo && filtros.tipo !== '') {
        params.append('tipo', filtros.tipo);
      }
      if (filtros.estado && filtros.estado !== '') {
        params.append('estado', filtros.estado);
      }
      if (filtros.sensacion && filtros.sensacion !== '') {
        params.append('sensacion', filtros.sensacion);
      }
      
      const queryString = params.toString();
      const url = `/incidencias/filtrar${queryString ? '?' + queryString : ''}`;
      
      console.log('Cargando incidencias con URL:', url); // Para depurar
      
      const response = await api.get(url);
      setIncidencias(response.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar incidencias:', err);
      setError('Error al cargar las incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta incidencia?')) {
      try {
        await api.delete(`/incidencias/${id}`);
        // Recargar incidencias después de eliminar
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

  if (loading && incidencias.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Incidencias</h2>
        <Link to="/incidencias/nueva" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Incidencia
        </Link>
      </div>

      {/* Componente de filtros */}
      <IncidenciaFiltros onFiltrar={cargarIncidencias} />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {incidencias.length === 0 ? (
        <div className="alert alert-info">
          No hay incidencias que coincidan con los filtros
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Alumno</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Sensación</th>
                <th>Profesor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.map((inc) => (
                <tr key={inc.id}>
                  <td>{inc.alumnoNombre}</td>
                  <td>{inc.descripcion.substring(0, 50)}...</td>
                  <td>{new Date(inc.fechaHoraIncidente).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getTipoBadge(inc.tipoIncidencia)}`}>
                      {inc.tipoIncidencia}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getEstadoBadge(inc.estado)}`}>
                      {inc.estado}
                    </span>
                  </td>
                  <td>{inc.sensacion || 'N/A'}</td>
                  <td>{inc.profesor?.nombre || 'N/A'}</td>
                  <td>
                    {puedeEditar(inc) && (
                      <>
                        <Link 
                          to={`/incidencias/editar/${inc.id}`} 
                          className="btn btn-sm btn-warning me-2"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button 
                          onClick={() => handleDelete(inc.id)}
                          className="btn btn-sm btn-danger"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Funciones auxiliares para badges
const getTipoBadge = (tipo) => {
  switch(tipo) {
    case 'LEVE': return 'bg-success';
    case 'GRAVE': return 'bg-warning text-dark';
    case 'MUY_GRAVE': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

const getEstadoBadge = (estado) => {
  switch(estado) {
    case 'PENDIENTE': return 'bg-secondary';
    case 'EN_REVISION': return 'bg-info text-dark';
    case 'RESUELTA': return 'bg-success';
    default: return 'bg-secondary';
  }
};

export default IncidenciaList;