import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

const IncidenciaList = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    alumno: '',
    fecha: '',
    estado: ''
  });
  
  const navigate = useNavigate();
  const isAdmin = authService.isAdmin();

  // Estados posibles (según tu backend)
  const estados = ['PENDIENTE', 'EN_REVISION', 'RESUELTA'];

  // Cargar incidencias al montar el componente
  useEffect(() => {
    cargarIncidencias();
  }, []);

  // Función para cargar incidencias con filtros
  const cargarIncidencias = async () => {
    try {
      setLoading(true);
      // Construir query params para filtrar
      const params = new URLSearchParams();
      if (filtros.alumno) params.append('alumno', filtros.alumno);
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.estado) params.append('estado', filtros.estado);

      const url = `/incidencias/filtrar?${params.toString()}`;
      const response = await api.get(url);
      setIncidencias(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las incidencias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Aplicar filtros
  const aplicarFiltros = (e) => {
    e.preventDefault();
    cargarIncidencias();
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      alumno: '',
      fecha: '',
      estado: ''
    });
    // Recargar sin filtros
    setTimeout(() => cargarIncidencias(), 0);
  };

  // Eliminar incidencia (solo ADMIN)
  const eliminarIncidencia = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta incidencia?')) return;
    
    try {
      await api.delete(`/incidencias/${id}`);
      // Recargar la lista
      cargarIncidencias();
    } catch (err) {
      setError('Error al eliminar la incidencia');
      console.error(err);
    }
  };

  // Formatear fecha para mostrarla
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener clase de badge según el estado
  const getBadgeClass = (estado) => {
    switch(estado) {
      case 'PENDIENTE': return 'bg-warning';
      case 'EN_REVISION': return 'bg-info';
      case 'RESUELTA': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  if (loading && incidencias.length === 0) {
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
        <h2>Listado de Incidencias</h2>
        {isAdmin && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/incidencias/nueva')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Incidencia
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filtros</h5>
          <form onSubmit={aplicarFiltros}>
            <div className="row">
              <div className="col-md-4 mb-2">
                <input
                  type="text"
                  className="form-control"
                  name="alumno"
                  placeholder="Buscar por alumno..."
                  value={filtros.alumno}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="col-md-3 mb-2">
                <input
                  type="date"
                  className="form-control"
                  name="fecha"
                  value={filtros.fecha}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="col-md-3 mb-2">
                <select
                  className="form-select"
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos los estados</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2 mb-2">
                <button type="submit" className="btn btn-primary w-100 mb-1">
                  Filtrar
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary w-100"
                  onClick={limpiarFiltros}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Tabla de incidencias */}
      {incidencias.length === 0 ? (
        <div className="alert alert-info">
          No hay incidencias que mostrar
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Alumno</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Solución</th>
                <th>Sensación</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {incidencias.map((inc) => (
                <tr key={inc.id}>
                  <td>{inc.alumnoNombre}</td>
                  <td>{inc.descripcion}</td>
                  <td>{formatearFecha(inc.fechaHoraIncidente)}</td>
                  <td>
                    <span className={`badge ${inc.tipoIncidencia === 'GRAVE' ? 'bg-danger' : inc.tipoIncidencia === 'LEVE' ? 'bg-warning' : 'bg-dark'}`}>
                      {inc.tipoIncidencia}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(inc.estado)}`}>
                      {inc.estado}
                    </span>
                  </td>
                  <td>{inc.solucion}</td>
                  <td>{inc.sensacion}</td>
                  {isAdmin && (
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => navigate(`/incidencias/editar/${inc.id}`)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => eliminarIncidencia(inc.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IncidenciaList;