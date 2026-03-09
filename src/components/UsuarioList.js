import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await api.delete(`/usuarios/${id}`);
      cargarUsuarios();
    } catch (err) {
      setError('Error al eliminar el usuario');
      console.error(err);
    }
  };

  const toggleActivo = async (usuario) => {
    try {
      await api.put(`/usuarios/${usuario.id}`, {
        ...usuario,
        activo: !usuario.activo
      });
      cargarUsuarios();
    } catch (err) {
      setError('Error al cambiar el estado del usuario');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/usuarios/nuevo')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {usuarios.length === 0 ? (
        <div className="alert alert-info">
          No hay usuarios que mostrar
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
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
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.rol === 'ADMIN' ? 'bg-danger' : 'bg-info'}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.activo ? 'bg-success' : 'bg-secondary'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => navigate(`/usuarios/editar/${user.id}`)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => eliminarUsuario(user.id)}
                    >
                      Eliminar
                    </button>
                    <button 
                      className={`btn btn-sm ${user.activo ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => toggleActivo(user)}
                    >
                      {user.activo ? 'Desactivar' : 'Activar'}
                    </button>
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