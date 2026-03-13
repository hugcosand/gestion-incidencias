import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const IncidenciaForm = () => {
  const [formData, setFormData] = useState({
    alumnoNombre: '',
    descripcion: '',
    fechaHoraIncidente: '',
    tipoIncidencia: 'LEVE',
    estado: 'PENDIENTE',
    solucionId: '',
    sensacionId: ''
  });
  
  const [soluciones, setSoluciones] = useState([]);
  const [sensaciones, setSensaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Cargar opciones de soluciones y sensaciones
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const [solRes, sensRes] = await Promise.all([
          api.get('/soluciones/activas'),
          api.get('/sensaciones/activas')
        ]);
        setSoluciones(solRes.data);
        setSensaciones(sensRes.data);
      } catch (err) {
        console.error('Error cargando opciones:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    cargarOpciones();
  }, []);

  // Si es edición, cargar la incidencia
  useEffect(() => {
    if (isEditing) {
      cargarIncidencia();
    }
  }, [id]);

  const cargarIncidencia = async () => {
    try {
      const response = await api.get(`/incidencias/${id}`);
      const inc = response.data;
      setFormData({
        alumnoNombre: inc.alumnoNombre,
        descripcion: inc.descripcion,
        fechaHoraIncidente: inc.fechaHoraIncidente?.slice(0, 16),
        tipoIncidencia: inc.tipoIncidencia,
        estado: inc.estado,
        solucionId: inc.solucion?.id || '',
        sensacionId: inc.sensacion?.id || ''
      });
    } catch (err) {
      setError('Error al cargar la incidencia');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Preparar datos para enviar
      const datosEnvio = {
        ...formData,
        solucionId: formData.solucionId || null,
        sensacionId: formData.sensacionId || null
      };

      if (isEditing) {
        await api.put(`/incidencias/${id}`, datosEnvio);
      } else {
        await api.post('/incidencias', datosEnvio);
      }
      navigate('/incidencias');
    } catch (err) {
      setError('Error al guardar la incidencia');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return <div className="text-center mt-5">Cargando opciones...</div>;
  }

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">
                {isEditing ? 'Editar Incidencia' : 'Nueva Incidencia'}
              </h2>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Alumno *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="alumnoNombre"
                      value={formData.alumnoNombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha y Hora *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="fechaHoraIncidente"
                      value={formData.fechaHoraIncidente}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción *</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tipo *</label>
                    <select
                      className="form-select"
                      name="tipoIncidencia"
                      value={formData.tipoIncidencia}
                      onChange={handleChange}
                      required
                    >
                      <option value="LEVE">LEVE</option>
                      <option value="GRAVE">GRAVE</option>
                      <option value="MUY_GRAVE">MUY GRAVE</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Estado *</label>
                    <select
                      className="form-select"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      required
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="EN_REVISION">EN REVISIÓN</option>
                      <option value="RESUELTA">RESUELTA</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Solución</label>
                    <select
                      className="form-select"
                      name="solucionId"
                      value={formData.solucionId}
                      onChange={handleChange}
                    >
                      <option value="">-- Seleccionar --</option>
                      {soluciones.map(sol => (
                        <option key={sol.id} value={sol.id}>
                          {sol.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Sensación</label>
                    <select
                      className="form-select"
                      name="sensacionId"
                      value={formData.sensacionId}
                      onChange={handleChange}
                    >
                      <option value="">-- Seleccionar --</option>
                      {sensaciones.map(sen => (
                        <option key={sen.id} value={sen.id}>
                          {sen.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/incidencias')}
                  >
                    Cancelar
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