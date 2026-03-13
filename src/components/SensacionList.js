import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SensacionList = () => {
  const [sensaciones, setSensaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarSensaciones();
  }, []);

  const cargarSensaciones = async () => {
    try {
      const response = await api.get('/sensaciones');
      setSensaciones(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las sensaciones');
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar la sensación "${nombre}"?\nEsta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/sensaciones/${id}`);
        cargarSensaciones();
      } catch (err) {
        alert('Error al eliminar la sensación. Puede que esté siendo utilizada en alguna incidencia.');
      }
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await api.patch(`/sensaciones/${id}/desactivar`);
      cargarSensaciones();
    } catch (err) {
      alert('Error al desactivar la sensación');
    }
  };

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando sensaciones...</p>
    </div>
  );

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-emoji-neutral me-2"></i>
          Gestión de Sensaciones
        </h2>
        <Link to="/sensaciones/nueva" className="btn bg-primary-subtle text-primary-emphasis border-0 px-4 py-2">
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Sensación
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {sensaciones.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay sensaciones registradas. Cree la primera sensación.
        </div>
      ) : (
        <div className="table-responsive" style={{ 
          overflowX: 'auto',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '8%' }}>ID</th>
                <th style={{ width: '20%' }}>Nombre</th>
                <th style={{ width: '35%' }}>Descripción</th>
                <th style={{ width: '15%' }}>Estado</th>
                <th style={{ width: '22%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sensaciones.map((sen) => (
                <tr key={sen.id} className={!sen.activo ? 'table-light' : ''}>
                  <td><span className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2">#{sen.id}</span></td>
                  <td><strong>{sen.nombre}</strong></td>
                  <td>{sen.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}</td>
                  <td>
                    {sen.activo ? (
                      <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Activo
                      </span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2">
                        <i className="bi bi-pause-circle me-1"></i>
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link 
                        to={`/sensaciones/editar/${sen.id}`} 
                        className="btn btn-sm bg-warning-subtle text-warning-emphasis border-0"
                        title="Editar sensación"
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe69c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </Link>
                      
                      {sen.activo ? (
                        <button 
                          onClick={() => handleDesactivar(sen.id)}
                          className="btn btn-sm bg-secondary-subtle text-secondary-emphasis border-0"
                          title="Desactivar (mantener en incidencias existentes)"
                          style={{ transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          <i className="bi bi-pause-circle me-1"></i>
                          Desactivar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDelete(sen.id, sen.nombre)}
                          className="btn btn-sm bg-danger-subtle text-danger-emphasis border-0"
                          title="Eliminar permanentemente"
                          style={{ transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1aeb5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sensaciones.length > 0 && (
            <div className="mt-3 d-flex justify-content-between align-items-center">
              <div className="alert alert-info small mb-0 py-2 px-3">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Nota:</strong> Las sensaciones desactivadas no estarán disponibles para nuevas incidencias, 
                pero se mantendrán en las incidencias existentes.
              </div>
              <span className="text-muted small">
                <i className="bi bi-arrow-left-right me-1"></i>
                Total: <strong>{sensaciones.length}</strong> sensaciones
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SensacionList;