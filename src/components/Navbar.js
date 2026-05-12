import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import NotificacionesDropdown from './NotificacionesDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isAuthenticated = authService.isAuthenticated();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: '#2c3e50'}}>
      <div className="container-fluid px-3 px-md-4">
        {/* Logo/Brand - Cambia según tamaño */}
        <Link className="navbar-brand" to="/incidencias">
          <i className="bi bi-shield-check me-2"></i>
          {isMobile ? (
            <span>Incidencias</span>
          ) : (
            <span>Gestión de Incidencias</span>
          )}
        </Link>
        
        {/* Botón hamburguesa */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menú colapsable */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Incidencias - Siempre visible */}
            <li className="nav-item">
              <Link className="nav-link" to="/incidencias">
                <i className="bi bi-journal-text me-1"></i>
                Incidencias
              </Link>
            </li>
            
            {/* Enlaces que solo aparecen si está autenticado */}
            {isAuthenticated && (
              <>
                {/* Filtros - Solo visible en desktop, en móvil está en el botón */}
                <li className="nav-item">
                  <Link className="nav-link" to="/incidencias/nueva">
                    <i className="bi bi-plus-circle me-1"></i>
                    {isMobile ? 'Nueva' : 'Nueva Incidencia'}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/mis-incidencias">
                    <i className="bi bi-person-lines-fill me-1"></i>
                    {isMobile ? 'Las mías' : 'Mis Incidencias'}
                  </Link>
                </li>
              </>
            )}

            {/* Calendario */}
            <li className="nav-item">
              <Link className="nav-link" to="/calendario">
                <i className="bi bi-calendar-week me-1"></i>
                {isMobile ? 'Calendario' : 'Calendario'}
              </Link>
            </li>
            
            {/* Enlaces de ADMIN */}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/usuarios">
                    <i className="bi bi-people me-1"></i>
                    {isMobile ? 'Usuarios' : 'Usuarios'}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/soluciones">
                    <i className="bi bi-check2-circle me-1"></i>
                    {isMobile ? 'Soluciones' : 'Soluciones'}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/sensaciones">
                    <i className="bi bi-emoji-neutral me-1"></i>
                    {isMobile ? 'Sensaciones' : 'Sensaciones'}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/estadisticas">
                    <i className="bi bi-bar-chart-line me-1"></i>
                    {isMobile ? 'Stats' : 'Estadísticas'}
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Zona de usuario y notificaciones */}
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center mt-3 mt-lg-0 pt-2 pt-lg-0 border-top border-light border-opacity-25">
            {/* Notificaciones */}
            <div className="mb-2 mb-lg-0 me-0 me-lg-3">
              <NotificacionesDropdown />
            </div>

            {/* Información del usuario */}
            <div className="text-white mb-2 mb-lg-0 me-0 me-lg-3">
              <i className="bi bi-person-circle me-1"></i>
              <span className="fw-medium">{user?.nombre}</span>
              <span className="badge bg-light text-dark ms-2">{user?.rol}</span>
            </div>

            {/* Botón de logout */}
            <button 
              className="btn btn-outline-light btn-sm w-100 w-lg-auto"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              {isMobile ? 'Salir' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;