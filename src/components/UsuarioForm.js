import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

const UsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'PROFESOR',
    activo: true
  });

  const [usuarioOriginal, setUsuarioOriginal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = ['ADMIN', 'PROFESOR'];

  useEffect(() => {
    if (isEditing) {
      cargarUsuario();
    }
  }, [id]);

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/usuarios/${id}`);
      const usuario = response.data;
      
      setUsuarioOriginal(usuario);
      
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '', // Vacío por seguridad
        rol: usuario.rol,
        activo: usuario.activo
      });
      
      setError('');
    } catch (err) {
      setError('Error al cargar el usuario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
        let datosEnviar;

        if (isEditing) {
        datosEnviar = {
            id: usuarioOriginal.id,
            nombre: formData.nombre,
            email: formData.email,
            rol: formData.rol,
            activo: formData.activo
        };

        if (formData.password && formData.password.trim() !== '') {
            datosEnviar.password = formData.password;
        } else {
            datosEnviar.password = usuarioOriginal.password;
        }

        console.log('Enviando al backend (edición):', datosEnviar);
        
        await api.put(`/usuarios/${id}`, datosEnviar);
        
        // 🔥 NUEVO: Verificar si el usuario editado es el mismo que está logueado
        const currentUser = authService.getCurrentUser();
        
        if (currentUser && currentUser.id === parseInt(id)) {
            // Si cambió el rol o se desactivó a sí mismo
            if (currentUser.rol !== datosEnviar.rol || datosEnviar.activo === false) {
            authService.logout();
            setSuccess('Tu rol ha cambiado. Por favor, inicia sesión de nuevo.');
            setTimeout(() => {
                navigate('/');
            }, 2000);
            return;
            }
        }
        
        setSuccess('Usuario actualizado correctamente');
        } else {
        // Creación: todos los campos obligatorios
        if (!formData.password || formData.password.trim() === '') {
            setError('La contraseña es obligatoria para nuevos usuarios');
            setLoading(false);
            return;
        }
        
        datosEnviar = {
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            rol: formData.rol,
            activo: true
        };
        
        console.log('Enviando al backend (creación):', datosEnviar);
        await api.post('/usuarios', datosEnviar);
        setSuccess('Usuario creado correctamente');
        }
        
        setTimeout(() => {
        navigate('/usuarios');
        }, 2000);
        
        } catch (err) {
            console.error('Error completo:', err);
            console.error('Respuesta del servidor:', err.response);
                
            const mensajeError = err.response?.data?.message || 
                                    err.response?.data || 
                                    err.message || 
                                    'Error al guardar el usuario';
                
            setError(typeof mensajeError === 'string' ? mensajeError : JSON.stringify(mensajeError));
        } finally {
            setLoading(false);
        }
    };
  if (loading && isEditing) {
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
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h4>
            </div>
            <div className="card-body">
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success} Redirigiendo...
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    {isEditing ? 'Nueva contraseña (dejar en blanco para mantener la actual)' : 'Contraseña *'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditing}
                    minLength="4"
                  />
                  {isEditing && (
                    <small className="text-muted">
                      Si no quieres cambiar la contraseña, deja este campo vacío y se mantendrá la actual.
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="rol" className="form-label">Rol *</label>
                  <select
                    className="form-select"
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                  >
                    {roles.map(rol => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                </div>

                {isEditing && (
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="activo"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="activo">
                      Usuario activo
                    </label>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/usuarios')}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      isEditing ? 'Actualizar' : 'Crear Usuario'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioForm;