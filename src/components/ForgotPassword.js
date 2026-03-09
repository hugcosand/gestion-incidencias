import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/password/forgot', { email });
      setEnviado(true);
      setMessage('Te hemos enviado un email con instrucciones');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body text-center">
                <div className="mb-4 text-success">
                  <i className="bi bi-envelope-check" style={{ fontSize: '4rem' }}></i>
                </div>
                <h4>¡Email enviado!</h4>
                <p className="text-muted">
                  Hemos enviado instrucciones a <strong>{email}</strong>.<br />
                  Revisa tu bandeja de entrada.
                </p>
                <Link to="/" className="btn btn-primary">
                  Volver al login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="text-center mb-4">Recuperar Contraseña</h3>
              <p className="text-muted text-center mb-4">
                Te enviaremos un enlace para restablecer tu contraseña
              </p>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Enviando...
                    </>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <Link to="/">Volver al login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;