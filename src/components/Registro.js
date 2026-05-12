import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ── Validación de contraseña ──────────────────────────────
  const validarPassword = (pwd) => {
    return {
      longitud:  pwd.length >= 8,
      mayuscula: /[A-Z]/.test(pwd),
      numero:    /\d/.test(pwd),
    };
  };

  const passwordOk = (pwd) => {
    const v = validarPassword(pwd);
    return v.longitud && v.mayuscula && v.numero;
  };

  const checks = validarPassword(formData.password);
  const mostrarIndicador = formData.password.length > 0;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!passwordOk(formData.password)) {
      setError('La contraseña no cumple los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      await api.post('/usuarios/registro', {
        nombre:   formData.nombre,
        email:    formData.email,
        password: formData.password
      });

      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  // ── Indicador visual de requisitos ───────────────────────
  const Requisito = ({ ok, texto }) => (
    <li className={`d-flex align-items-center gap-2 small ${ok ? 'text-success' : 'text-muted'}`}>
      <i className={`bi ${ok ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
      {texto}
    </li>
  );

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center mb-2">Gestión de Incidencias</h2>
              <h5 className="text-center text-muted mb-4">Registro de Nuevo Usuario</h5>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>{error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>{success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="ejemplo@email.com"
                  />
                </div>

                <div className="mb-1">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${
                      mostrarIndicador
                        ? passwordOk(formData.password) ? 'is-valid' : 'is-invalid'
                        : ''
                    }`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                {/* Indicador de requisitos */}
                {mostrarIndicador && (
                  <ul className="list-unstyled mb-3 mt-2 ps-1">
                    <Requisito ok={checks.longitud}  texto="Mínimo 8 caracteres" />
                    <Requisito ok={checks.mayuscula} texto="Al menos una mayúscula" />
                    <Requisito ok={checks.numero}    texto="Al menos un número" />
                  </ul>
                )}

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${
                      formData.confirmPassword.length > 0
                        ? formData.password === formData.confirmPassword ? 'is-valid' : 'is-invalid'
                        : ''
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repite la contraseña"
                  />
                  {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                    <div className="invalid-feedback">Las contraseñas no coinciden</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registrando...
                    </>
                  ) : (
                    'Registrarse'
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  ¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;