import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Calendario = () => {
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const [imagenError, setImagenError] = useState(false);

  // Ruta de la imagen final (cuando la tengas)
  // La imagen debe estar en: frontend/public/calendario-curso.jpg
  const imagenCalendario = "/calendario.jpg";
  const placeholderImage = "https://via.placeholder.com/1200x800?text=Calendario+del+Profesorado";

  const toggleAmpliar = () => {
    setImagenAmpliada(!imagenAmpliada);
  };

  const handleImageError = () => {
    setImagenError(true);
  };

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="bi bi-calendar-week me-2"></i>
          Calendario del Profesorado
        </h2>
        <div>
          <Link to="/incidencias" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </Link>
          <button 
            className="btn btn-outline-primary"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i>
            Imprimir
          </button>
        </div>
      </div>

      {/* Cabecera informativa */}
      <div className="alert alert-info d-flex align-items-center mb-4">
        <i className="bi bi-info-circle-fill me-3 fs-4"></i>
        <div>
          <strong>Calendario Escolar - Curso 2025/2026</strong>
          <p className="mb-0">Puedes descargar la imagen o imprimirla directamente. Haz clic en la imagen para ampliarla.</p>
        </div>
      </div>

      {/* Imagen del calendario */}
      <div className="card shadow mb-4">
        <div className="card-body p-0">
          <div 
            className={`text-center ${imagenAmpliada ? 'p-3' : 'p-4'}`}
            style={{ backgroundColor: '#f8f9fa' }}
          >
            {!imagenError ? (
              <img 
                src={imagenCalendario}
                alt="Calendario escolar del profesorado"
                className={`img-fluid rounded shadow ${imagenAmpliada ? '' : 'cursor-pointer'}`}
                style={{ 
                  maxWidth: imagenAmpliada ? '95%' : '100%', 
                  height: 'auto',
                  cursor: imagenAmpliada ? 'zoom-out' : 'zoom-in',
                  transition: 'all 0.3s ease'
                }}
                onClick={toggleAmpliar}
                onError={handleImageError}
              />
            ) : (
              <div>
                <img 
                  src={placeholderImage}
                  alt="Placeholder calendario"
                  className="img-fluid rounded shadow border"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <div className="alert alert-warning mt-3 mx-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Imagen del calendario no encontrada.</strong> 
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda y eventos */}
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-calendar2-event me-2"></i>
                Eventos destacados
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <span className="badge bg-danger me-2">🔴</span>
                      <strong>15-20 junio:</strong> Evaluaciones finales
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-warning me-2">🟡</span>
                      <strong>22 junio:</strong> Claustro de profesores
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-success me-2">🟢</span>
                      <strong>25 junio:</strong> Entrega de notas
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <span className="badge bg-info me-2">🔵</span>
                      <strong>1 septiembre:</strong> Inicio de curso
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-secondary me-2">⚫</span>
                      <strong>8 septiembre:</strong> Reunión de departamento
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-primary me-2">🟣</span>
                      <strong>15 septiembre:</strong> Excursión fin de curso
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-download me-2"></i>
                Descargas
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <a 
                  href={!imagenError ? imagenCalendario : placeholderImage} 
                  download="calendario-profesorado-2025-2026.jpg"
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-file-image me-2"></i>
                  Descargar JPG
                </a>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-2"></i>
                  Versión imprimible
                </button>
                <button 
                  className="btn btn-outline-info"
                  onClick={() => window.open(!imagenError ? imagenCalendario : placeholderImage, '_blank')}
                >
                  <i className="bi bi-arrows-fullscreen me-2"></i>
                  Ver a pantalla completa
                </button>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-question-circle me-2"></i>
                Ayuda
              </h5>
            </div>
            <div className="card-body">
              <p className="small mb-1">
                <i className="bi bi-hand-index-thumb me-1"></i>
                Haz clic en la imagen para ampliar
              </p>
              <p className="small mb-1">
                <i className="bi bi-download me-1"></i>
                Descarga para guardar en tu ordenador
              </p>
              <p className="small mb-0">
                <i className="bi bi-printer me-1"></i>
                Imprime para tener una copia física
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nota al pie */}
      <div className="text-center mt-4 text-muted small">
        <i className="bi bi-calendar-check me-1"></i>
        Calendario actualizado para el curso 2025/2026 · 
        <i className="bi bi-envelope ms-2 me-1"></i>
        Para modificaciones, contactar con secretaría
      </div>
    </div>
  );
};

export default Calendario;