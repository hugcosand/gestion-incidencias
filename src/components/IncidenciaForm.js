import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const IncidenciaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Si hay id, es edición
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    alumnoNombre: '',
    descripcion: '',
    fechaHoraIncidente: '',
    tipoIncidencia: 'LEVE',
    estado: 'PENDIENTE',
    solucion: 'SIN_DEFINIR',
    sensacion: 'INDIFERENTE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Enums del backend
  const tiposIncidencia = ['LEVE', 'GRAVE', 'MUY_GRAVE'];
  const estados = ['PENDIENTE', 'EN_REVISION', 'RESUELTA'];
  const soluciones = ['ADVERTENCIA', 'LLAMADA_PADRES', 'EXPULSION', 'SIN_DEFINIR'];
  const sensaciones = ['ARREPENTIDO', 'INDIFERENTE', 'DESAFIANTE', 'REINCIDENTE'];

  // Si es edición, cargar los datos de la incidencia
  useEffect(() => {
    if (isEditing) {
      cargarIncidencia();
    } else {
      // Para nueva incidencia, poner fecha actual por defecto
      const ahora = new Date();
      const fechaLocal = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
      setFormData(prev => ({
        ...prev,
        fechaHoraIncidente: fechaLocal
      }));
    }
  }, [id]);

  const cargarIncidencia = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/incidencias/${id}`);
      const incidencia = response.data;
      
      // Formatear fecha para input datetime-local
      const fecha = new Date(incidencia.fechaHoraIncidente);
      const fechaLocal = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        ...incidencia,
        fechaHoraIncidente: fechaLocal
      });
      setError('');
    } catch (err) {
      setError('Error al cargar la incidencia');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/incidencias/${id}`, formData);
        setSuccess('Incidencia actualizada correctamente');
      } else {
        await api.post('/incidencias', formData);
        setSuccess('Incidencia creada correctamente');
      }
      
      // Esperar 2 segundos y redirigir
      setTimeout(() => {
        navigate('/incidencias');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la incidencia');
      console.error(err);
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
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                {isEditing ? 'Editar Incidencia' : 'Nueva Incidencia'}
              </h4>
            </div>
            <div className="card-body">
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success} Redirigiendo...
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
                {/* Alumno */}
                <div className="mb-3">
                  <label htmlFor="alumnoNombre" className="form-label">
                    Nombre del Alumno *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="alumnoNombre"
                    name="alumnoNombre"
                    value={formData.alumnoNombre}
                    onChange={handleChange}
                    required
                    maxLength="100"
                  />
                </div>

                {/* Descripción */}
                <div className="mb-3">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción *
                  </label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    name="descripcion"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                    maxLength="500"
                  />
                </div>

                {/* Fecha y hora */}
                <div className="mb-3">
                  <label htmlFor="fechaHoraIncidente" className="form-label">
                    Fecha y hora del incidente *
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="fechaHoraIncidente"
                    name="fechaHoraIncidente"
                    value={formData.fechaHoraIncidente}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Tipo de incidencia */}
                <div className="mb-3">
                  <label htmlFor="tipoIncidencia" className="form-label">
                    Tipo de Incidencia *
                  </label>
                  <select
                    className="form-select"
                    id="tipoIncidencia"
                    name="tipoIncidencia"
                    value={formData.tipoIncidencia}
                    onChange={handleChange}
                    required
                  >
                    {tiposIncidencia.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div className="mb-3">
                  <label htmlFor="estado" className="form-label">
                    Estado *
                  </label>
                  <select
                    className="form-select"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                  >
                    {estados.map(estado => (
                      <option key={estado} value={estado}>
                        {estado.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Solución */}
                <div className="mb-3">
                  <label htmlFor="solucion" className="form-label">
                    Solución aplicada
                  </label>
                  <select
                    className="form-select"
                    id="solucion"
                    name="solucion"
                    value={formData.solucion}
                    onChange={handleChange}
                  >
                    {soluciones.map(sol => (
                      <option key={sol} value={sol}>
                        {sol.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sensación del alumno */}
                <div className="mb-3">
                  <label htmlFor="sensacion" className="form-label">
                    Sensación del alumno
                  </label>
                  <select
                    className="form-select"
                    id="sensacion"
                    name="sensacion"
                    value={formData.sensacion}
                    onChange={handleChange}
                  >
                    {sensaciones.map(sen => (
                      <option key={sen} value={sen}>
                        {sen}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/incidencias')}
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
                      isEditing ? 'Actualizar' : 'Crear Incidencia'
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

export default IncidenciaForm;