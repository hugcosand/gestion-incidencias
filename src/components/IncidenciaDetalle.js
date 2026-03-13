import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

const IncidenciaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incidencia, setIncidencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    cargarIncidencia();
  }, [id]);

  const cargarIncidencia = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/incidencias/${id}`);
      setIncidencia(response.data);
      setError('');
    } catch (err) {
      console.error('Error cargando incidencia:', err);
      setError('No se pudo cargar la incidencia');
    } finally {
      setLoading(false);
    }
  };

  const puedeEditar = () => {
    if (isAdmin) return true;
    if (incidencia.profesor?.id === user?.id) return true;
    return false;
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta incidencia?')) return;
    
    try {
      await api.delete(`/incidencias/${id}`);
      navigate('/incidencias');
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar la incidencia');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeClass = (tipo) => {
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

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !incidencia) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || 'Incidencia no encontrada'}</div>
        <Link to="/incidencias" className="btn btn-primary">
          <i className="bi bi-arrow-left"></i> Volver a Incidencias
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-file-text me-2"></i> Detalle de Incidencia
        </h2>
        <div>
          <Link to="/incidencias" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left"></i> Volver
          </Link>
          {puedeEditar() && (
            <>
              <Link to={`/incidencias/editar/${id}`} className="btn bg-warning-subtle text-warning-emphasis border-0 me-2">
                <i className="bi bi-pencil"></i> Editar
              </Link>
              <button onClick={handleDelete} className="btn bg-danger-subtle text-danger-emphasis border-0">
                <i className="bi bi-trash"></i> Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          {/* Tarjeta principal */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-primary-subtle text-primary-emphasis">
              <h5 className="mb-0">Información de la Incidencia</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="fw-bold">Alumno:</h6>
                  <p className="fs-5">{incidencia.alumnoNombre}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold">Profesor:</h6>
                  <p className="fs-5">{incidencia.profesor?.nombre || 'No asignado'}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="fw-bold">Fecha del incidente:</h6>
                  <p>{formatFecha(incidencia.fechaHoraIncidente)}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold">Fecha de registro:</h6>
                  <p>{incidencia.fechaCreacion ? formatFecha(incidencia.fechaCreacion) : 'No disponible'}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <h6 className="fw-bold">Tipo:</h6>
                  <span className={`badge ${getBadgeClass(incidencia.tipoIncidencia)} px-3 py-2`}>
                    {incidencia.tipoIncidencia}
                  </span>
                </div>
                <div className="col-md-4">
                  <h6 className="fw-bold">Estado:</h6>
                  <span className={`badge ${getEstadoBadge(incidencia.estado)} px-3 py-2`}>
                    {incidencia.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold">Descripción:</h6>
                <div className="p-3 bg-light rounded">
                  <p className="mb-0">{incidencia.descripcion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {/* Solución y Sensación */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-success-subtle text-success-emphasis">
              <h5 className="mb-0">Solución Aplicada</h5>
            </div>
            <div className="card-body">
              {incidencia.solucion ? (
                <>
                  <h6 className="fw-bold">{incidencia.solucion.nombre}</h6>
                  {incidencia.solucion.descripcion && (
                    <p className="text-muted mt-2">{incidencia.solucion.descripcion}</p>
                  )}
                </>
              ) : (
                <p className="text-muted">No se ha registrado solución</p>
              )}
            </div>
          </div>

          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-info-subtle text-info-emphasis">
              <h5 className="mb-0">Sensación del Alumno</h5>
            </div>
            <div className="card-body">
              {incidencia.sensacion ? (
                <>
                  <h6 className="fw-bold">{incidencia.sensacion.nombre}</h6>
                  {incidencia.sensacion.descripcion && (
                    <p className="text-muted mt-2">{incidencia.sensacion.descripcion}</p>
                  )}
                </>
              ) : (
                <p className="text-muted">No se ha registrado sensación</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidenciaDetalle;