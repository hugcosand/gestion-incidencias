import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import UsuarioFiltros from './UsuarioFiltros';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(
    new URLSearchParams(window.location.search).get('filtros') === 'true'
  );

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

  // 🔥 NUEVA FUNCIÓN: Eliminar usuario permanentemente
  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente al usuario "${nombre}"?\nEsta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/usuarios/${id}`);
        cargarUsuarios();
      } catch (err) {
        alert('Error al eliminar el usuario. Puede que tenga incidencias asociadas.');
      }
    }
  };

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando usuarios...</p>
    </div>
  );

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-people me-2"></i>
          Gestión de Usuarios
        </h2>
        <div>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <i className={`bi bi-chevron-${mostrarFiltros ? 'up' : 'down'} me-1`}></i>
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          <Link to="/usuarios/nuevo" className="btn bg-primary-subtle text-primary-emphasis border-0 px-4 py-2">
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Usuario
          </Link>
        </div>
      </div>

      {mostrarFiltros && (
        <UsuarioFiltros onFiltrar={cargarUsuarios} />
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {usuarios.length === 0 ? (
        <div className="alert alert-info">No hay usuarios</div>
      ) : (
        <div className="table-responsive" style={{ 
          overflowX: 'auto',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '15%' }}>Nombre</th>
                <th style={{ width: '25%' }}>Email</th>
                <th style={{ width: '12%' }}>Rol</th>
                <th style={{ width: '12%' }}>Estado</th>
                <th style={{ width: '36%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id} className={!user.activo ? 'table-light' : ''}>
                  <td className="fw-bold">{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.rol === 'ADMIN' 
                        ? 'bg-danger-subtle text-danger-emphasis' 
                        : 'bg-info-subtle text-info-emphasis'
                    } px-3 py-2`}>
                      {user.rol === 'ADMIN' ? 'ADMIN' : 'PROFESOR'}
                    </span>
                  </td>
                  <td>
                    {user.activo ? (
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
                        to={`/usuarios/editar/${user.id}`} 
                        className="btn btn-sm bg-warning-subtle text-warning-emphasis border-0"
                        title="Editar usuario"
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe69c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </Link>
                      
                      {user.activo ? (
                        <button 
                          onClick={() => handleDesactivar(user.id, user.nombre)}
                          className="btn btn-sm bg-secondary-subtle text-secondary-emphasis border-0"
                          title="Desactivar usuario"
                          style={{ transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          <i className="bi bi-pause-circle me-1"></i>
                          Desactivar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivar(user.id, user.nombre)}
                          className="btn btn-sm bg-success-subtle text-success-emphasis border-0"
                          title="Activar usuario"
                          style={{ transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a3cfbb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          <i className="bi bi-play-circle me-1"></i>
                          Activar
                        </button>
                      )}

                      <button 
                        onClick={() => handleDelete(user.id, user.nombre)}
                        className="btn btn-sm bg-danger-subtle text-danger-emphasis border-0"
                        title="Eliminar permanentemente"
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1aeb5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {usuarios.length > 0 && (
            <div className="mt-3 text-muted small d-flex justify-content-end">
              <span>
                <i className="bi bi-info-circle me-1"></i>
                Total: <strong>{usuarios.length}</strong> usuarios
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsuarioList;