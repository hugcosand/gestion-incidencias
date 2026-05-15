import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/auth';
import notificacionService from '../services/notificaciones';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isAuthenticated = authService.isAuthenticated();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [incidenciasOpen, setIncidenciasOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [contador, setContador] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIncidenciasOpen(false);
    setAdminOpen(false);
    setUserOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        setIncidenciasOpen(false);
        setAdminOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const noLeidas = await notificacionService.obtenerNoLeidas();
      setNotificaciones(noLeidas);
      setContador(noLeidas.length);
    } catch (err) {}
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleAbrirUser = async (e) => {
    e.stopPropagation();
    const abriendo = !userOpen;
    setUserOpen(abriendo);
    setIncidenciasOpen(false);
    setAdminOpen(false);
    if (abriendo && contador > 0) {
      await notificacionService.marcarComoLeidas();
      setContador(0);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const ahora = new Date();
    const diffH = Math.floor((ahora - date) / (1000 * 60 * 60));
    if (diffH < 1) return 'Hace unos minutos';
    if (diffH < 24) return `Hace ${diffH}h`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  const dropdownStyle = {
    backgroundColor: '#1a2e3f',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    minWidth: '200px',
    padding: '8px 0',
    zIndex: 9999,
    listStyle: 'none',
    margin: '8px 0 0 0',
  };

  const userDropdownStyle = {
    ...dropdownStyle,
    minWidth: '260px',
    right: 0,
    left: 'auto',
  };

  const dropdownItemStyle = {
    color: '#cbd5e1',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    fontSize: '0.92rem',
    transition: 'background 0.15s, color 0.15s',
    cursor: 'pointer',
  };

  const navLinkStyle = {
    fontSize: '1.05rem',
    padding: '8px 22px',
  };

  const navBtnStyle = (isOpen) => ({
    color: isOpen ? '#fff' : 'rgba(255,255,255,0.85)',
    fontSize: '1.05rem',
    padding: '8px 22px',
  });

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#2c3e50' }}>
      <div className="container-fluid px-3 px-md-4">

        <Link className="navbar-brand fw-semibold" to="/dashboard" style={{ fontSize: '1.1rem' }}>
          <i className="bi bi-shield-check me-2"></i>
          {isMobile ? 'Incidencias' : 'Gestión de Incidencias'}
        </Link>

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

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center" style={{ gap: '108px' }}>
            {/* Inicio */}
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard" style={navLinkStyle}>
                <i className="bi bi-house me-1"></i>Inicio
              </Link>
            </li>

            {/* Incidencias */}
            {isAuthenticated && (
              <li className="nav-item nav-dropdown position-relative">
                <button
                  className="nav-link btn btn-link border-0 d-flex align-items-center gap-1"
                  style={navBtnStyle(incidenciasOpen)}
                  onClick={(e) => { e.stopPropagation(); setIncidenciasOpen(!incidenciasOpen); setAdminOpen(false); setUserOpen(false); }}
                >
                  <i className="bi bi-journal-text me-1"></i>
                  Incidencias
                  <i className={`bi bi-chevron-${incidenciasOpen ? 'up' : 'down'} ms-1`} style={{ fontSize: '0.7rem' }}></i>
                </button>

                {incidenciasOpen && (
                  <ul className="position-absolute" style={dropdownStyle}>
                    {[
                      { to: '/incidencias',       icon: 'bi-list-ul',           label: 'Ver todas' },
                      { to: '/incidencias/nueva', icon: 'bi-plus-circle',       label: 'Nueva incidencia' },
                      { to: '/mis-incidencias',   icon: 'bi-person-lines-fill', label: 'Mis incidencias' },
                    ].map(({ to, icon, label }) => (
                      <li key={to}>
                        <Link to={to} style={dropdownItemStyle}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#243447'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <i className={`bi ${icon}`}></i> {label}
                        </Link>
                      </li>
                    ))}
                    <li style={{ borderTop: '1px solid #2d4057', margin: '4px 0' }}></li>
                    <li>
                      <Link to="/calendario" style={dropdownItemStyle}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#243447'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <i className="bi bi-calendar-week"></i> Calendario
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}

            {/* Administración */}
            {isAdmin && (
              <li className="nav-item nav-dropdown position-relative">
                <button
                  className="nav-link btn btn-link border-0 d-flex align-items-center gap-1"
                  style={navBtnStyle(adminOpen)}
                  onClick={(e) => { e.stopPropagation(); setAdminOpen(!adminOpen); setIncidenciasOpen(false); setUserOpen(false); }}
                >
                  <i className="bi bi-gear me-1"></i>
                  Administración
                  <i className={`bi bi-chevron-${adminOpen ? 'up' : 'down'} ms-1`} style={{ fontSize: '0.7rem' }}></i>
                </button>

                {adminOpen && (
                  <ul className="position-absolute" style={dropdownStyle}>
                    {[
                      { to: '/estadisticas', icon: 'bi-bar-chart-line', label: 'Estadísticas' },
                      { to: '/usuarios',     icon: 'bi-people',         label: 'Usuarios' },
                    ].map(({ to, icon, label }) => (
                      <li key={to}>
                        <Link to={to} style={dropdownItemStyle}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#243447'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <i className={`bi ${icon}`}></i> {label}
                        </Link>
                      </li>
                    ))}
                    <li style={{ borderTop: '1px solid #2d4057', margin: '4px 0' }}></li>
                    {[
                      { to: '/soluciones',  icon: 'bi-check2-circle', label: 'Soluciones' },
                      { to: '/sensaciones', icon: 'bi-emoji-smile',    label: 'Sensaciones' },
                    ].map(({ to, icon, label }) => (
                      <li key={to}>
                        <Link to={to} style={dropdownItemStyle}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#243447'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <i className={`bi ${icon}`}></i> {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>

          {/* ZONA USUARIO */}
          <div className="d-flex align-items-center mt-3 mt-lg-0 pt-2 pt-lg-0 border-lg-0">
            <div className="nav-dropdown position-relative">
              <button
                className="btn btn-link border-0 d-flex align-items-center gap-2 text-white text-decoration-none px-2"
                onClick={handleAbrirUser}
                style={{ fontSize: '0.95rem' }}
              >
                <div className="position-relative">
                  <i className="bi bi-person-circle fs-4"></i>
                  {contador > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: '0.6rem' }}>
                      {contador}
                    </span>
                  )}
                </div>
                <span className="fw-medium">{user?.nombre}</span>
                <i className={`bi bi-chevron-${userOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', opacity: 0.7 }}></i>
              </button>

              {userOpen && (
                <ul className="position-absolute" style={userDropdownStyle}>

                  {/* Info usuario */}
                  <li className="px-3 py-2" style={{ borderBottom: '1px solid #2d4057' }}>
                    <div className="text-white fw-semibold small">{user?.nombre}</div>
                    <div className="text-secondary" style={{ fontSize: '0.78rem' }}>{user?.email}</div>
                    <span className="badge bg-secondary mt-1" style={{ fontSize: '0.7rem' }}>{user?.rol}</span>
                  </li>

                  {/* Cabecera notificaciones */}
                  <li className="px-3 pt-2 pb-1 d-flex align-items-center gap-2">
                    <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Notificaciones
                    </span>
                    {notificaciones.length > 0 && (
                      <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>{notificaciones.length}</span>
                    )}
                  </li>

                  {notificaciones.length === 0 ? (
                    <li className="px-3 pb-2">
                      <span className="text-secondary small">
                        <i className="bi bi-check-circle me-1"></i>Todo al día
                      </span>
                    </li>
                  ) : (
                    <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {notificaciones.map(n => (
                        <li key={n.id}>
                          <Link
                            to={`/incidencias/${n.incidenciaId}`}
                            style={{ ...dropdownItemStyle, fontSize: '0.82rem', alignItems: 'flex-start' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#243447'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <i className="bi bi-bell-fill text-warning mt-1" style={{ minWidth: 14 }}></i>
                            <div>
                              <div>{n.alumnoNombre}</div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{formatFecha(n.fechaCreacion)}</div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </div>
                  )}

                  {/* Cerrar sesión */}
                  <li style={{ borderTop: '1px solid #2d4057', margin: '4px 0' }}></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      style={{ ...dropdownItemStyle, width: '100%', background: 'none', border: 'none', color: '#f87171' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3d1a1a'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <i className="bi bi-box-arrow-right"></i> Cerrar sesión
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;