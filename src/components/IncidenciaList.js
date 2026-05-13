import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';
import IncidenciaFiltros from './IncidenciaFiltros';

const IncidenciaList = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(
    new URLSearchParams(window.location.search).get('filtros') === 'true'
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isProfesor = user?.rol === 'PROFESOR';
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState({ columna: null, dir: 'asc' });

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarIncidencias();
  }, []);

  const cargarIncidencias = async (filtros = {}) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (filtros.alumno?.trim()) params.append('alumno', filtros.alumno.trim());
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.hora) params.append('hora', filtros.hora);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.sensacion) params.append('sensacion', filtros.sensacion);
      if (filtros.solucion) params.append('solucion', filtros.solucion);
      if (filtros.profesor) params.append('profesor', filtros.profesor);
      
      const queryString = params.toString();
      const url = `/incidencias/filtrar${queryString ? '?' + queryString : ''}`;
      
      const response = await api.get(url);
      
      // Ordenar por fecha descendente (más nuevas primero)
      const incidenciasOrdenadas = [...response.data].sort((a, b) => 
        new Date(b.fechaHoraIncidente) - new Date(a.fechaHoraIncidente)
      );
      
      setIncidencias(incidenciasOrdenadas);
      setError('');
    } catch (err) {
      setError('Error al cargar las incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, alumno) => {
    if (window.confirm(`¿Está seguro de eliminar la incidencia de ${alumno}?`)) {
      try {
        await api.delete(`/incidencias/${id}`);
        cargarIncidencias();
      } catch (err) {
        alert('Error al eliminar la incidencia');
      }
    }
  };

  const puedeEditar = (incidencia) => {
    if (isAdmin) return true;
    if (isProfesor && incidencia.profesor?.id === user?.id) return true;
    return false;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerDetalle = (id) => {
    navigate(`/incidencias/${id}`);
  };

  if (loading && incidencias.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando incidencias...</p>
      </div>
    );
  }

  const exportarCSV = () => {
    if (!incidencias || incidencias.length === 0) {
      alert('No hay incidencias para exportar');
      return;
    }
 
    const cabeceras = [
      'ID', 'Alumno', 'Fecha incidente', 'Tipo', 'Estado',
      'Profesor', 'Solución', 'Sensación', 'Descripción'
    ];
 
    const filas = incidencias.map(inc => [
      inc.id,
      inc.alumnoNombre || '',
      inc.fechaHoraIncidente
        ? new Date(inc.fechaHoraIncidente).toLocaleString('es-ES')
        : '',
      inc.tipoIncidencia || '',
      inc.estado || '',
      inc.profesor?.nombre || '',
      inc.solucion?.nombre || '',
      inc.sensacion?.nombre || '',
      (inc.descripcion || '').replace(/[\n\r;]/g, ' ')
    ]);
 
    const contenido = [cabeceras, ...filas]
      .map(fila => fila.map(celda => `"${celda}"`).join(';'))
      .join('\n');
 
    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incidencias_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOrden = (columna) => {
    setOrden(prev => ({
      columna,
      dir: prev.columna === columna && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };
 
  const incidenciasFiltradas = (incidencias || [])
    // Buscador rápido
    .filter(inc => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        inc.alumnoNombre?.toLowerCase().includes(q) ||
        inc.profesor?.nombre?.toLowerCase().includes(q) ||
        inc.estado?.toLowerCase().includes(q) ||
        inc.tipoIncidencia?.toLowerCase().includes(q) ||
        inc.descripcion?.toLowerCase().includes(q)
      );
    })
    // Ordenación
    .sort((a, b) => {
      if (!orden.columna) return 0;

      const ordenTipo   = { 'LEVE': 1, 'GRAVE': 2, 'MUY_GRAVE': 3 };
      const ordenEstado = { 'PENDIENTE': 1, 'EN_REVISION': 2, 'RESUELTA': 3 };

      let valA, valB;
      switch (orden.columna) {
        case 'alumno':
          valA = a.alumnoNombre || ''; valB = b.alumnoNombre || '';
          return orden.dir === 'asc' ? valA.localeCompare(valB, 'es') : valB.localeCompare(valA, 'es');

        case 'fecha':
          valA = a.fechaHoraIncidente || ''; valB = b.fechaHoraIncidente || '';
          return orden.dir === 'asc' ? valA.localeCompare(valB, 'es') : valB.localeCompare(valA, 'es');

        case 'tipo':
          valA = ordenTipo[a.tipoIncidencia] || 0;
          valB = ordenTipo[b.tipoIncidencia] || 0;
          return orden.dir === 'asc' ? valA - valB : valB - valA;

        case 'estado':
          valA = ordenEstado[a.estado] || 0;
          valB = ordenEstado[b.estado] || 0;
          return orden.dir === 'asc' ? valA - valB : valB - valA;

        case 'profesor':
          valA = a.profesor?.nombre || ''; valB = b.profesor?.nombre || '';
          return orden.dir === 'asc' ? valA.localeCompare(valB, 'es') : valB.localeCompare(valA, 'es');

        default: return 0;
      }
    });
 
  return (
    <div className="container-fluid mt-4 px-2 px-md-4">
      {/* Cabecera */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <h2 className="page-title h4 h2-md mb-0">
          <i className="bi bi-journal-text me-2"></i>
          Gestión de Incidencias
        </h2>
        <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
          <button 
            className="btn btn-outline-primary flex-fill flex-md-grow-0"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <i className={`bi bi-chevron-${mostrarFiltros ? 'up' : 'down'} me-1`}></i>
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          <Link to="/incidencias/nueva" className="btn btn-primary flex-fill flex-md-grow-0">
            <i className="bi bi-plus-circle me-2"></i>
            {!isMobile && 'Nueva Incidencia'}
            {isMobile && 'Nueva'}
          </Link>
          <button
              onClick={exportarCSV}
              className="btn btn-outline-success me-2"
              title="Exportar incidencias visibles a CSV"
            >
              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
              Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <IncidenciaFiltros onFiltrar={cargarIncidencias} />
      )}

      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar por alumno, profesor, estado, tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="btn btn-outline-secondary" onClick={() => setBusqueda('')}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
        {busqueda && (
          <small className="text-muted ms-1">
            {incidenciasFiltradas.length} resultado{incidenciasFiltradas.length !== 1 ? 's' : ''}
          </small>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Listado de incidencias */}
      {incidencias.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay incidencias que coincidan con los filtros
        </div>
      ) : (
        <>
          {/* VISTA MÓVIL: Tarjetas */}
          {isMobile ? (
            <div className="row g-3">
              {incidencias.map((inc) => (
                <div key={inc.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      {/* Cabecera de la tarjeta */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{inc.alumnoNombre}</h5>
                        <div>
                          <span className={`badge ${getTipoBadge(inc.tipoIncidencia)} me-1`}>
                            {inc.tipoIncidencia}
                          </span>
                          <span className={`badge ${getEstadoBadge(inc.estado)}`}>
                            {inc.estado.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Fecha */}
                      <p className="text-muted small mb-2">
                        <i className="bi bi-clock me-1"></i>
                        {formatFechaCorta(inc.fechaHoraIncidente)}
                      </p>

                      {/* Descripción (truncada) */}
                      <p className="card-text mb-2">
                        {inc.descripcion.length > 100 
                          ? inc.descripcion.substring(0, 100) + '...' 
                          : inc.descripcion}
                      </p>

                      {/* Solución y Sensación (si existen) */}
                      <div className="mb-2 small">
                        {inc.solucion && (
                          <span className="badge bg-light text-dark me-1">
                            <i className="bi bi-check-circle me-1"></i>
                            {inc.solucion.nombre}
                          </span>
                        )}
                        {inc.sensacion && (
                          <span className="badge bg-light text-dark">
                            <i className="bi bi-emoji-neutral me-1"></i>
                            {inc.sensacion.nombre}
                          </span>
                        )}
                      </div>

                      {/* Profesor */}
                      <p className="text-muted small mb-3">
                        <i className="bi bi-person me-1"></i>
                        {inc.profesor?.nombre || 'N/A'}
                      </p>

                      {/* Botones de acción */}
                      <div className="d-flex gap-2">
                        <button 
                          onClick={() => handleVerDetalle(inc.id)}
                          className="btn btn-sm bg-info-subtle text-info-emphasis border-0 flex-fill"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver
                        </button>
                        
                        {puedeEditar(inc) && (
                          <>
                            <Link 
                              to={`/incidencias/editar/${inc.id}`} 
                              className="btn btn-sm bg-warning-subtle text-warning-emphasis border-0 flex-fill"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Editar
                            </Link>
                            
                            <button 
                              onClick={() => handleDelete(inc.id, inc.alumnoNombre)}
                              className="btn btn-sm bg-danger-subtle text-danger-emphasis border-0 flex-fill"
                            >
                              <i className="bi bi-trash me-1"></i>
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VISTA ESCRITORIO: Tabla */
            <div className="table-responsive" style={{ 
              overflowX: 'auto',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <table className="table table-hover align-middle mb-0" style={{ minWidth: '1200px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{width:'12%', cursor:'pointer'}} onClick={() => handleOrden('alumno')}>
                      Alumno/a {orden.columna==='alumno' ? (orden.dir==='asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th style={{width:'22%'}}>Descripción</th>
                    <th style={{width:'12%', cursor:'pointer'}} onClick={() => handleOrden('fecha')}>
                      Fecha/Hora {orden.columna==='fecha' ? (orden.dir==='asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th style={{width:'8%', cursor:'pointer'}} onClick={() => handleOrden('tipo')}>
                      Tipo {orden.columna==='tipo' ? (orden.dir==='asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th style={{width:'10%', cursor:'pointer'}} onClick={() => handleOrden('estado')}>
                      Estado {orden.columna==='estado' ? (orden.dir==='asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th style={{width:'10%'}}>Solución</th>
                    <th style={{width:'10%'}}>Sensación</th>
                    <th style={{width:'10%', cursor:'pointer'}} onClick={() => handleOrden('profesor')}>
                      Profesor/a {orden.columna==='profesor' ? (orden.dir==='asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th style={{width:'18%'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {incidenciasFiltradas.map((inc) => (
                    <tr key={inc.id}>
                      <td className="fw-bold">{inc.alumnoNombre}</td>
                      <td>
                        <span title={inc.descripcion}>
                          {inc.descripcion.length > 60 
                            ? inc.descripcion.substring(0, 60) + '...' 
                            : inc.descripcion}
                        </span>
                      </td>
                      <td>{formatFecha(inc.fechaHoraIncidente)}</td>
                      <td>
                        <span className={`badge ${getTipoBadge(inc.tipoIncidencia)} px-3 py-2`}>
                          {inc.tipoIncidencia}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadge(inc.estado)} px-3 py-2`}>
                          {inc.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{inc.solucion?.nombre || <span className="text-muted">—</span>}</td>
                      <td>{inc.sensacion?.nombre || <span className="text-muted">—</span>}</td>
                      <td>{inc.profesor?.nombre || 'N/A'}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button 
                            onClick={() => handleVerDetalle(inc.id)}
                            className="btn btn-sm bg-info-subtle text-info-emphasis border-0"
                            title="Ver detalle"
                            style={{ transition: 'all 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9eeaf9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Ver
                          </button>
                          
                          {puedeEditar(inc) && (
                            <>
                              <Link 
                                to={`/incidencias/editar/${inc.id}`} 
                                className="btn btn-sm bg-warning-subtle text-warning-emphasis border-0"
                                title="Editar"
                                style={{ transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe69c'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Editar
                              </Link>
                              
                              <button 
                                onClick={() => handleDelete(inc.id, inc.alumnoNombre)}
                                className="btn btn-sm bg-danger-subtle text-danger-emphasis border-0"
                                title="Eliminar"
                                style={{ transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1aeb5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
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
            </div>
          )}

          {/* Total de incidencias */}
          {incidencias.length > 0 && (
            <div className="mt-3 text-muted small d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-info-circle me-1"></i>
                Total: <strong>{incidencias.length}</strong> incidencias
              </span>
              {!isMobile && (
                <span className="text-secondary">
                  <i className="bi bi-arrow-left-right me-1"></i>
                  Usa scroll horizontal para ver más columnas
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Funciones auxiliares para badges
const getTipoBadge = (tipo) => {
  switch(tipo) {
    case 'LEVE': 
      return 'bg-success-subtle text-success-emphasis';
    case 'GRAVE': 
      return 'bg-warning-subtle text-warning-emphasis';
    case 'MUY_GRAVE': 
      return 'bg-danger-subtle text-danger-emphasis';
    default: 
      return 'bg-secondary-subtle text-secondary-emphasis';
  }
};

const getEstadoBadge = (estado) => {
  switch(estado) {
    case 'PENDIENTE': 
      return 'bg-warning-subtle text-warning-emphasis';
    case 'EN_REVISION': 
      return 'bg-info-subtle text-info-emphasis';
    case 'RESUELTA': 
      return 'bg-success-subtle text-success-emphasis';
    default: 
      return 'bg-secondary-subtle text-secondary-emphasis';
  }
};

export default IncidenciaList;