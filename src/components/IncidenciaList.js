import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

const IncidenciaList = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isProfesor = user?.rol === 'PROFESOR';

  useEffect(() => {
    cargarIncidencias();
  }, []);

  const cargarIncidencias = async () => {
    try {
      const response = await api.get('/incidencias');
      setIncidencias(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las incidencias');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta incidencia?')) {
      try {
        await api.delete(`/incidencias/${id}`);
        cargarIncidencias();
      } catch (err) {
        alert('Error al eliminar la incidencia');
      }
    }
  };

  // ✅ Verificar si el usuario puede editar/eliminar una incidencia específica
  const puedeEditar = (incidencia) => {
    if (isAdmin) return true; // ADMIN puede todo
    if (isProfesor && incidencia.profesor?.id === user?.id) return true; // Profesor dueño
    return false;
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Incidencias</h2>
        
        {/* ✅ Botón visible para TODOS */}
        <Link to="/incidencias/nueva" className="btn btn-primary">
          + Nueva Incidencia
        </Link>
      </div>

      {incidencias.length === 0 ? (
        <div className="alert alert-info">No hay incidencias registradas</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Alumno</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Profesor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.map((inc) => (
                <tr key={inc.id}>
                  <td>{inc.id}</td>
                  <td>{inc.alumnoNombre}</td>
                  <td>{inc.descripcion.substring(0, 50)}...</td>
                  <td>{new Date(inc.fechaHoraIncidente).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getTipoBadge(inc.tipoIncidencia)}`}>
                      {inc.tipoIncidencia}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getEstadoBadge(inc.estado)}`}>
                      {inc.estado}
                    </span>
                  </td>
                  <td>{inc.profesor?.nombre || 'N/A'}</td>
                  <td>
                    {/* ✅ Botones condicionales según permisos */}
                    {puedeEditar(inc) && (
                      <>
                        <Link 
                          to={`/incidencias/editar/${inc.id}`} 
                          className="btn btn-sm btn-warning me-2"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button 
                          onClick={() => handleDelete(inc.id)}
                          className="btn btn-sm btn-danger"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    
                    {/* Si no puede editar, mostrar solo ver (opcional) */}
                    {!puedeEditar(inc) && (
                      <span className="text-muted">Solo lectura</span>
                    )}
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

// Funciones auxiliares para badges (igual que antes)
const getTipoBadge = (tipo) => {
  switch(tipo) {
    case 'LEVE': return 'bg-success';
    case 'GRAVE': return 'bg-warning';
    case 'MUY_GRAVE': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

const getEstadoBadge = (estado) => {
  switch(estado) {
    case 'PENDIENTE': return 'bg-secondary';
    case 'EN_REVISION': return 'bg-info';
    case 'RESUELTA': return 'bg-success';
    default: return 'bg-secondary';
  }
};

export default IncidenciaList;