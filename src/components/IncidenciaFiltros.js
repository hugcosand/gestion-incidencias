import React, { useState, useEffect } from 'react';
import api from '../services/api';

const IncidenciaFiltros = ({ onFiltrar }) => {
  const [filtros, setFiltros] = useState({
    alumno: '',
    fecha: '',
    tipo: '',
    estado: '',
    sensacion: '',
    solucion: ''  // ✅ NUEVO
  });

  const [soluciones, setSoluciones] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState(false);

  // Cargar soluciones para el select
  useEffect(() => {
    const cargarSoluciones = async () => {
      try {
        const response = await api.get('/soluciones/activas');
        setSoluciones(response.data);
      } catch (err) {
        console.error('Error cargando soluciones:', err);
      }
    };
    cargarSoluciones();
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
    
    const count = Object.values(filtros).filter(v => v !== '').length;
    setFiltrosActivos(count > 0);
    
    onFiltrar(filtros);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = {
      alumno: '',
      fecha: '',
      tipo: '',
      estado: '',
      sensacion: '',
      solucion: ''
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
            <div className="col-md-3">
              <label className="form-label">Alumno</label>
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
            
            <div className="col-md-2">
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

            <div className="col-md-2">
              <label className="form-label">Sensación</label>
              <select
                className="form-select"
                name="sensacion"
                value={filtros.sensacion}
                onChange={handleChange}
              >
                <option value="">Todas</option>
                <option value="ARREPENTIDO">ARREPENTIDO</option>
                <option value="INDIFERENTE">INDIFERENTE</option>
                <option value="DESAFIANTE">DESAFIANTE</option>
                <option value="REINCIDENTE">REINCIDENTE</option>
              </select>
            </div>

            {/* ✅ NUEVO: Selector de solución */}
            <div className="col-md-2">
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