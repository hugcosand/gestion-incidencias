import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los usuarios');
      setLoading(false);
    }
  };

  const handleDesactivar = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de desactivar al usuario "${nombre}"?\nEl usuario no podrá iniciar sesión.`)) {
      try {
        await api.patch(`/usuarios/${id}/desactivar`);
        cargarUsuarios();
      } catch (err) {
        alert('Error al desactivar el usuario');
      }
    }
  };

  const handleActivar = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de activar al usuario "${nombre}"?\nEl usuario podrá iniciar sesión nuevamente.`)) {
      try {
        await api.patch(`/usuarios/${id}/activar`);
        cargarUsuarios();
      } catch (err) {
        alert('Error al activar el usuario');
      }
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de ELIMINAR PERMANENTEMENTE al usuario "${nombre}"?\nEsta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/usuarios/${id}`);
        cargarUsuarios();
      } catch (err) {
        alert('Error al eliminar el usuario. Puede que tenga incidencias o tokens asociados.');
      }
    }
  };

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando usuarios...</p>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-people me-2"></i>
          Gestión de Usuarios
        </h2>
        <Link to="/usuarios/nuevo" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Usuario
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {usuarios.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay usuarios registrados.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id} className={!user.activo ? 'table-secondary' : ''}>
                  <td>#{user.id}</td>
                  <td><strong>{user.nombre}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.rol === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    {user.activo ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-secondary">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link 
                        to={`/usuarios/editar/${user.id}`} 
                        className="btn btn-action btn-action-edit"
                        title="Editar usuario"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </Link>
                      
                      {user.activo ? (
                        <button 
                          onClick={() => handleDesactivar(user.id, user.nombre)}
                          className="btn btn-action btn-action-desactivar"
                          title="Desactivar usuario (no podrá iniciar sesión)"
                        >
                          <i className="bi bi-pause-circle me-1"></i>
                          Desactivar
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleActivar(user.id, user.nombre)}
                            className="btn btn-action btn-success"
                            title="Activar usuario"
                          >
                            <i className="bi bi-play-circle me-1"></i>
                            Activar
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id, user.nombre)}
                            className="btn btn-action btn-action-delete"
                            title="Eliminar permanentemente (solo si no tiene incidencias)"
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
          
          <div className="mt-3 alert alert-info small">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Nota:</strong> 
            <ul className="mb-0 mt-1">
              <li><strong>Desactivar:</strong> El usuario no puede iniciar sesión, pero sus datos se conservan.</li>
              <li><strong>Activar:</strong> El usuario recupera el acceso al sistema.</li>
              <li><strong>Eliminar:</strong> Solo para usuarios sin incidencias ni tokens. ¡Con cuidado!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioList;