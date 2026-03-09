import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Navbar from './components/Navbar';
import IncidenciaList from './components/IncidenciaList';
import IncidenciaForm from './components/IncidenciaForm';
import UsuarioList from './components/UsuarioList';
import UsuarioForm from './components/UsuarioForm';
import authService from './services/auth';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

// Componente para proteger rutas (solo autenticados)
const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Componente para proteger rutas de ADMIN
const AdminRoute = ({ children }) => {
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Ruta pública */}
          <Route path="/" element={<Login />} />
          
          {/* ✅ CORREGIDO: Todas las rutas de incidencias con PrivateRoute */}
          <Route path="/incidencias" element={
            <PrivateRoute>
              <>
                <Navbar />
                <IncidenciaList />
              </>
            </PrivateRoute>
          } />
          
          {/* ✅ AHORA: Profesores pueden crear incidencias */}
          <Route path="/incidencias/nueva" element={
            <PrivateRoute>  {/* ← CAMBIADO DE AdminRoute A PrivateRoute */}
              <>
                <Navbar />
                <IncidenciaForm />
              </>
            </PrivateRoute>
          } />
          
          {/* ✅ AHORA: Profesores pueden editar incidencias */}
          <Route path="/incidencias/editar/:id" element={
            <PrivateRoute>  {/* ← CAMBIADO DE AdminRoute A PrivateRoute */}
              <>
                <Navbar />
                <IncidenciaForm />
              </>
            </PrivateRoute>
          } />
          
          {/* 🟦 SOLO ADMIN: Gestión de usuarios (se queda igual) */}
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