import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardRecepcion from "./pages/DashboardRecepcion";
import DashboardMozo from "./pages/DashboardMozo";
import DashboardAdmin from "./pages/DashboardAdmin"; // Importar el nuevo panel

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("usuario_wayra");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem("usuario_wayra", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario_wayra");
    setUser(null);
  };

  // Función para determinar a dónde enviar a cada usuario según su rol
  const getRedirectPath = (rol) => {
    switch (rol) {
      case "admin": return "/admin";
      case "recepcionista": return "/recepcion";
      case "mozo": return "/mozo";
      default: return "/";
    }
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Redirección inicial según rol */}
        <Route 
          path="/" 
          element={<Navigate to={getRedirectPath(user.rol)} replace />} 
        />
        
        {/* Ruta ADMIN */}
        <Route 
          path="/admin" 
          element={user.rol === "admin" ? <DashboardAdmin onLogout={handleLogout} user={user} /> : <Navigate to="/" replace />} 
        />

        {/* Ruta RECEPCIÓN */}
        <Route 
          path="/recepcion" 
          element={user.rol === "recepcionista" ? <DashboardRecepcion onLogout={handleLogout} user={user} /> : <Navigate to="/" replace />} 
        />

        {/* Ruta MOZO */}
        <Route 
          path="/mozo" 
          element={user.rol === "mozo" ? <DashboardMozo onLogout={handleLogout} user={user} /> : <Navigate to="/" replace />} 
        />

        {/* Captura de rutas inexistentes */}
        <Route path="*" element={<Navigate to={getRedirectPath(user.rol)} replace />} />
      </Routes>
    </Router>
  );
}

export default App;