import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { ejecutarCierreSesionGlobal } from "./helpers/logoutHelper";

// 📂 Importación de Páginas Maestras (Capa Router)
import Login from "./pages/Login";
import DashboardRecepcion from "./pages/DashboardRecepcion";
import DashboardMozo from "./pages/DashboardMozo";
import DashboardAdmin from "./pages/DashboardAdmin"; 

function App() {
  // ✅ CONSUMO SENIOR: Centralizamos la sesión leyendo desde la capa Context global
  const { user, isAuth, login, logout } = useContext(AuthContext);

  const handleLogout = () => {
    // ✅ TRACEABILIDAD BACKEND: Le avisa a Render/Railway para poner el estado 'offline' y limpia timers
    ejecutarCierreSesionGlobal(user, logout);
  };

  const getRedirectPath = (rol) => {
    switch (rol) {
      case "admin": return "/admin";
      case "recepcionista": return "/recepcion";
      case "mozo": return "/mozo";
      default: return "/";
    }
  };

  // 🔒 FLUJO DE RUTAS PÚBLICAS (NO AUTENTICADO)
  if (!isAuth) {
    return (
      <Router>
        <Routes>
          {/* El Login ahora recibe la función de login del context para guardar usuario + token */}
          <Route path="/" element={<Login onLogin={login} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // 🛡️ FLUJO DE RUTAS PROTEGIDAS POR ROL (AUTENTICADO)
  return (
    <Router>
      <Routes>
        {/* Redirección inicial atómica según rol */}
        <Route 
          path="/" 
          element={<Navigate to={getRedirectPath(user?.rol)} replace />} 
        />
        
        {/* 🏛️ RUTA ADMINISTRADOR (Incluye comodín /* para sub-vistas internas de la carta) */}
        <Route 
          path="/admin/*" 
          element={user?.rol === "admin" ? <DashboardAdmin onLogout={handleLogout} user={user} /> : <Navigate to="/" replace />} 
        />
        
        {/* 📅 RUTA RECEPCIÓN */}
        <Route 
          path="/recepcion" 
          element={user?.rol === "recepcionista" ? <DashboardRecepcion onLogout={handleLogout} user={user} /> : <Navigate to="/" replace />} 
        />
        
        {/* 🥢 RUTA MOZO */}
        <Route 
          path="/mozo" 
          element={user?.rol === "mozo" ? <DashboardMozo onLogout={handleLogout} user={user} /> : <Navigate to="/" replace />} 
        />
        
        {/* Captura de rutas inexistentes redirigiendo al dashboard correspondiente */}
        <Route path="*" element={<Navigate to={getRedirectPath(user?.rol)} replace />} />
      </Routes>
    </Router>
  );
}

export default App;