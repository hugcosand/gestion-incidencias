import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SolucionList = () => {
  const [soluciones, setSoluciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarSoluciones();
  }, []);

  const cargarSoluciones = async () => {
    try {
      const response = await api.get('/soluciones');
      setSoluciones(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las soluciones');
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar la solución "${nombre}"?\nEsta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/soluciones/${id}`);
        cargarSoluciones();
      } catch (err) {
        alert('Error al eliminar la solución. Puede que esté siendo utilizada en alguna incidencia.');
      }
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await api.patch(`/soluciones/${id}/desactivar`);
      cargarSoluciones();
    } catch (err) {
      alert('Error al desactivar la solución');
    }
  };

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando soluciones...</p>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-check2-circle me-2"></i>
          Gestión de Soluciones
        </h2>
        <Link to="/soluciones/nueva" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Solución
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {soluciones.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay soluciones registradas. Cree la primera solución.
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
              {soluciones.map((sol) => (
                <tr key={sol.id} className={!sol.activo ? 'table-secondary' : ''}>
                  <td>#{sol.id}</td>
                  <td><strong>{sol.nombre}</strong></td>
                  <td>{sol.descripcion || <span className="text-muted">Sin descripción</span>}</td>
                  <td>
                    {sol.activo ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-secondary">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link 
                        to={`/soluciones/editar/${sol.id}`} 
                        className="btn btn-action btn-action-edit"
                        title="Editar solución"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </Link>
                      
                      {sol.activo ? (
                        <button 
                          onClick={() => handleDesactivar(sol.id)}
                          className="btn btn-action btn-action-desactivar"
                          title="Desactivar (mantener en incidencias existentes)"
                        >
                          <i className="bi bi-pause-circle me-1"></i>
                          Desactivar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDelete(sol.id, sol.nombre)}
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
            <strong>Nota:</strong> Las soluciones desactivadas no estarán disponibles para nuevas incidencias, 
            pero se mantendrán en las incidencias existentes.
          </div>
        </div>
      )}
    </div>
  );
};

export default SolucionList;