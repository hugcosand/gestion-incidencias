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
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando sensaciones...</p>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-emoji-neutral me-2"></i>
          Gestión de Sensaciones
        </h2>
        <Link to="/sensaciones/nueva" className="btn btn-primary">
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
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sensaciones.map((sen) => (
                <tr key={sen.id} className={!sen.activo ? 'table-secondary' : ''}>
                  <td>#{sen.id}</td>
                  <td><strong>{sen.nombre}</strong></td>
                  <td>{sen.descripcion || <span className="text-muted">Sin descripción</span>}</td>
                  <td>
                    {sen.activo ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-secondary">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link 
                        to={`/sensaciones/editar/${sen.id}`} 
                        className="btn btn-action btn-action-edit"
                        title="Editar sensación"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </Link>
                      
                      {sen.activo ? (
                        <button 
                          onClick={() => handleDesactivar(sen.id)}
                          className="btn btn-action btn-action-desactivar"
                          title="Desactivar (mantener en incidencias existentes)"
                        >
                          <i className="bi bi-pause-circle me-1"></i>
                          Desactivar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDelete(sen.id, sen.nombre)}
                          className="btn btn-action btn-action-delete"
                          title="Eliminar permanentemente"
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
          
          <div className="mt-3 alert alert-info small">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Nota:</strong> Las sensaciones desactivadas no estarán disponibles para nuevas incidencias, 
            pero se mantendrán en las incidencias existentes.
          </div>
        </div>
      )}
    </div>
  );
};

export default SensacionList;