import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import NotificacionesDropdown from './NotificacionesDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: '#2c3e50'}}>
      <div className="container">
        <Link className="navbar-brand" to="/incidencias">
          <i className="bi bi-shield-check me-2"></i>
          Gestión de Incidencias
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/incidencias">
                <i className="bi bi-journal-text me-1"></i>
                Incidencias
              </Link>
            </li>
            
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/incidencias/nueva">
                  <i className="bi bi-plus-circle me-1"></i>
                  Nueva Incidencia
                </Link>
              </li>
            )}

            {/* NUEVO ENLACE AL CALENDARIO - Visible para todos */}
            <li className="nav-item">
              <Link className="nav-link" to="/calendario">
                <i className="bi bi-calendar-week me-1"></i>
                Calendario
              </Link>
            </li>
            
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/usuarios">
                    <i className="bi bi-people me-1"></i>
                    Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/soluciones">
                    <i className="bi bi-check2-circle me-1"></i>
                    Soluciones
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/sensaciones">
                    <i className="bi bi-emoji-neutral me-1"></i>
                    Sensaciones
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">

            <NotificacionesDropdown />

            <div className="text-white me-3">
              <i className="bi bi-person-circle me-1"></i>
              <span className="fw-medium">{user?.nombre}</span>
              <span className="badge bg-light text-dark ms-2">{user?.rol}</span>
            </div>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;