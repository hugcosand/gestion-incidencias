import React, { useState, useEffect } from 'react';
import api from '../services/api';

const IncidenciaFiltros = ({ onFiltrar }) => {
  const [filtros, setFiltros] = useState({
    alumno: '',
    fecha: '',
    hora: '',           // ✅ NUEVO: campo para filtrar por hora
    tipo: '',
    estado: '',
    sensacion: '',
    solucion: '',
    profesor: ''
  });

  const [soluciones, setSoluciones] = useState([]);
  const [sensaciones, setSensaciones] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState(false);

  // Cargar soluciones y sensaciones
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
      }
    };
    cargarOpciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear objeto solo con filtros que tienen valor
    const filtrosLimpios = {};
    Object.keys(filtros).forEach(key => {
      if (filtros[key] && filtros[key].trim() !== '') {
        filtrosLimpios[key] = filtros[key];
      }
    });
    
    const count = Object.keys(filtrosLimpios).length;
    setFiltrosActivos(count > 0);
    
    onFiltrar(filtrosLimpios);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = {
      alumno: '',
      fecha: '',
      hora: '',          // ✅ NUEVO: también limpiamos hora
      tipo: '',
      estado: '',
      sensacion: '',
      solucion: '',
      profesor: ''
    };
    setFiltros(filtrosVacios);
    setFiltrosActivos(false);
    onFiltrar(filtrosVacios);
  };

  return (
    <div className="card filtros-card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtrar Incidencias
          </h5>
          {filtrosActivos && (
            <span className="badge bg-info">Filtros activos</span>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Primera fila */}
            <div className="col-md-3">
              <label className="form-label">Alumno/a</label>
              <input
                type="text"
                className="form-control"
                name="alumno"
                placeholder="Nombre del alumno"
                value={filtros.alumno}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-control"
                name="fecha"
                value={filtros.fecha}
                onChange={handleChange}
              />
            </div>

            {/* ✅ NUEVO: Campo de hora */}
            <div className="col-md-2">
              <label className="form-label">Hora</label>
              <input
                type="time"
                className="form-control"
                name="hora"
                value={filtros.hora}
                onChange={handleChange}
                step="3600"  // Opcional: para seleccionar solo horas en punto
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                name="tipo"
                value={filtros.tipo}
                onChange={handleChange}
              >
                <option value="">Todos</option>
                <option value="LEVE">LEVE</option>
                <option value="GRAVE">GRAVE</option>
                <option value="MUY_GRAVE">MUY GRAVE</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                name="estado"
                value={filtros.estado}
                onChange={handleChange}
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="EN_REVISION">EN REVISIÓN</option>
                <option value="RESUELTA">RESUELTA</option>
              </select>
            </div>

            {/* Segunda fila - Ajustamos los col-md para compensar el nuevo campo */}
            <div className="col-md-3">
              <label className="form-label">Sensación</label>
              <select
                className="form-select"
                name="sensacion"
                value={filtros.sensacion}
                onChange={handleChange}
              >
                <option value="">Todas</option>
                {sensaciones.map(sen => (
                  <option key={sen.id} value={sen.nombre}>
                    {sen.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Solución</label>
              <select
                className="form-select"
                name="solucion"
                value={filtros.solucion}
                onChange={handleChange}
              >
                <option value="">Todas</option>
                {soluciones.map(sol => (
                  <option key={sol.id} value={sol.nombre}>
                    {sol.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Profesor/a</label>
              <input
                type="text"
                className="form-control"
                name="profesor"
                placeholder="Nombre del profesor"
                value={filtros.profesor}
                onChange={handleChange}
              />
            </div>

            
          </div>
          
          <div className="row mt-4">
            <div className="col-12">
              <button type="submit" className="btn btn-primary me-2">
                <i className="bi bi-search"></i> Aplicar Filtros
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={limpiarFiltros}
              >
                <i className="bi bi-eraser"></i> Limpiar Filtros
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidenciaFiltros;