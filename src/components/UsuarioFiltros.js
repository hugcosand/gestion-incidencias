import React, { useState } from 'react';

const UsuarioFiltros = ({ onFiltrar }) => {
  const [filtros, setFiltros] = useState({
    nombre: '',
    email: '',
    rol: ''
  });

  const [filtrosActivos, setFiltrosActivos] = useState(false);

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
      nombre: '',
      email: '',
      rol: ''
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
            Filtrar Usuarios
          </h5>
          {filtrosActivos && (
            <span className="badge bg-info">Filtros activos</span>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                placeholder="Nombre del usuario"
                value={filtros.nombre}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                type="text"
                className="form-control"
                name="email"
                placeholder="Email"
                value={filtros.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Rol</label>
              <select
                className="form-select"
                name="rol"
                value={filtros.rol}
                onChange={handleChange}
              >
                <option value="">Todos</option>
                <option value="ADMIN">ADMIN</option>
                <option value="PROFESOR">PROFESOR</option>
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

export default UsuarioFiltros;