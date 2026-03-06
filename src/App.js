import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import authService from './services/auth';
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/incidencias" element={
            <PrivateRoute>
              <div className="container mt-5">
                <div className="alert alert-info">
                  <h4>¡Login exitoso!</h4>
                  <p>Próximamente: Listado de Incidencias</p>
                  <button 
                    className="btn btn-danger mt-3"
                    onClick={() => {
                      authService.logout();
                      window.location.href = '/';
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;