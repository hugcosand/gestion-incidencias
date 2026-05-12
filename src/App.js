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
import Registro from './components/Registro';
import Calendario from './components/Calendario'; 
import SolucionList from './components/SolucionList';
import SolucionForm from './components/SolucionForm';
import SensacionList from './components/SensacionList';
import SensacionForm from './components/SensacionForm';
import IncidenciaDetalle from './components/IncidenciaDetalle';
import Estadisticas from './components/Estadisticas';
import MisIncidencias from './components/MisIncidencias';
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
          {/* Rutas públicas */}
          <Route path="/registro" element={<Registro />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Login />} />
          
          {/* Todas las rutas de incidencias con PrivateRoute */}
          <Route path="/incidencias" element={
            <PrivateRoute>
              <>
                <Navbar />
                <IncidenciaList />
              </>
            </PrivateRoute>
          } />

          <Route path="/mis-incidencias" element={
            <PrivateRoute>
              <>
                <Navbar />
                <MisIncidencias />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/incidencias/nueva" element={
            <PrivateRoute>
              <>
                <Navbar />
                <IncidenciaForm />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/incidencias/editar/:id" element={
            <PrivateRoute>
              <>
                <Navbar />
                <IncidenciaForm />
              </>
            </PrivateRoute>
          } />

          <Route path="/incidencias/:id" element={
            <PrivateRoute><><Navbar /><IncidenciaDetalle /></></PrivateRoute>
          } />
          
          {/* RUTA DEL CALENDARIO */}
          <Route path="/calendario" element={
            <PrivateRoute>
              <>
                <Navbar />
                <Calendario />
              </>
            </PrivateRoute>
          } />

          <Route path="/estadisticas" element={
            <AdminRoute>
              <>
                <Navbar />
                <Estadisticas />
              </>
            </AdminRoute>
          } />
          
          {/* Gestión de usuarios (solo ADMIN) */}
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

          {/* Rutas de soluciones (solo ADMIN) */}
          <Route path="/soluciones" element={
            <AdminRoute>
              <>
                <Navbar />
                <SolucionList />
              </>
            </AdminRoute>
          } />
          
          <Route path="/soluciones/nueva" element={
            <AdminRoute>
              <>
                <Navbar />
                <SolucionForm />
              </>
            </AdminRoute>
          } />
          
          <Route path="/soluciones/editar/:id" element={
            <AdminRoute>
              <>
                <Navbar />
                <SolucionForm />
              </>
            </AdminRoute>
          } />

          {/* Rutas de sensaciones (solo ADMIN) */}
          <Route path="/sensaciones" element={
            <AdminRoute>
              <>
                <Navbar />
                <SensacionList />
              </>
            </AdminRoute>
          } />
          
          <Route path="/sensaciones/nueva" element={
            <AdminRoute>
              <>
                <Navbar />
                <SensacionForm />
              </>
            </AdminRoute>
          } />
          
          <Route path="/sensaciones/editar/:id" element={
            <AdminRoute>
              <>
                <Navbar />
                <SensacionForm />
              </>
            </AdminRoute>
          } />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;