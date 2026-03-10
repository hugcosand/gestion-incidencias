import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import UsuarioFiltros from './UsuarioFiltros';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async (filtros = {}) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filtros.nombre?.trim()) params.append('nombre', filtros.nombre.trim());
      if (filtros.email?.trim()) params.append('email', filtros.email.trim());
      if (filtros.rol) params.append('rol', filtros.rol);
      
      const queryString = params.toString();
      const url = `/usuarios/filtrar${queryString ? '?' + queryString : ''}`;
      
      const response = await api.get(url);
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDesactivar = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de desactivar al usuario "${nombre}"?`)) {
      try {
        await api.patch(`/usuarios/${id}/desactivar`);
        cargarUsuarios();
      } catch (err) {
        alert('Error al desactivar el usuario');
      }
    }
  };

  const handleActivar = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de activar al usuario "${nombre}"?`)) {
      try {
        await api.patch(`/usuarios/${id}/activar`);
        cargarUsuarios();
      } catch (err) {
        alert('Error al activar el usuario');
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-people me-2"></i>
          Gestión de Usuarios
        </h2>
        <Link to="/usuarios/nuevo" className="btn btn-primary">
          + Nuevo Usuario
        </Link>
      </div>

      <UsuarioFiltros onFiltrar={cargarUsuarios} />

      {error && <div className="alert alert-danger">{error}</div>}

      {usuarios.length === 0 ? (
        <div className="alert alert-info">No hay usuarios</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
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
                  <td><strong>{user.nombre}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.rol === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>
                      {user.rol === 'ADMIN' ? 'ADMIN' : 'PROFESOR'}
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
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </Link>
                      
                      {user.activo ? (
                        <button 
                          onClick={() => handleDesactivar(user.id, user.nombre)}
                          className="btn btn-action btn-action-desactivar"
                        >
                          <i className="bi bi-pause-circle me-1"></i>
                          Desactivar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivar(user.id, user.nombre)}
                          className="btn btn-action btn-success"
                        >
                          <i className="bi bi-play-circle me-1"></i>
                          Activar
                        </button>
                      )}
                    </div>
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

export default UsuarioList;