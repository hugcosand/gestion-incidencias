import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Navbar from './components/Navbar';
import IncidenciaList from './components/IncidenciaList';
import IncidenciaForm from './components/IncidenciaForm';
import UsuarioList from './components/UsuarioList';
import UsuarioForm from './components/UsuarioForm';
import authService from './services/auth';
import './App.css';

// Componente para proteger rutas (solo autenticados)
const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Componente para proteger rutas de ADMIN
const  AdminRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  
  if (!isAuthenticated) return <Navigate to="/" />;
  if (!isAdmin) return <Navigate to="/incidencias" />;
  
  return children;
};

function App() {
  return (
    <HashRouter>
      <div className="App">
        <Routes>
          {/* Ruta pública */}
          <Route path="/" element={<Login />} />
          
          {/* Rutas para incidencias (todos los usuarios autenticados) */}
          <Route path="/incidencias" element={
            <PrivateRoute>
              <>
                <Navbar />
                <IncidenciaList />
              </>
            </PrivateRoute>
          } />
          
          {/* Rutas para incidencias (solo ADMIN) */}
          <Route path="/incidencias/nueva" element={
            <AdminRoute>
              <>
                <Navbar />
                <IncidenciaForm />
              </>
            </AdminRoute>
          } />
          
          <Route path="/incidencias/editar/:id" element={
            <AdminRoute>
              <>
                <Navbar />
                <IncidenciaForm />
              </>
            </AdminRoute>
          } />
          
          {/* Rutas para usuarios (solo ADMIN) */}
          <Route path="/usuarios" element={
            <AdminRoute>
              <>
                <Navbar />
                <UsuarioList />
              </>
            </AdminRoute>
          } />
          
          <Route path="/usuarios/nuevo" element={
            <AdminRoute>
              <>
                <Navbar />
                <UsuarioForm />
              </>
            </AdminRoute>
          } />
          
          <Route path="/usuarios/editar/:id" element={
            <AdminRoute>
              <>
                <Navbar />
                <UsuarioForm />
              </>
            </AdminRoute>
          } />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;