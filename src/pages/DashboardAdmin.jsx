import React, { useState } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { ViewStats } from "../views/Admin/ViewStats"; 
import { ViewCarta } from "../views/Admin/ViewCarta";
import { ViewUsuarios } from "../views/Admin/ViewUsuarios";
import { ViewHistorial } from "../views/Admin/ViewHistorial";

const DashboardAdmin = ({ onLogout, user }) => {
  const [seccion, setSeccion] = useState('stats');

  return (
    <AdminLayout 
      seccion={seccion} 
      setSeccion={setSeccion} 
      user={user} 
      onLogout={onLogout}
    >
      {seccion === 'stats' && <ViewStats />}
      {seccion === 'carta' && <ViewCarta />}
      {seccion === 'usuarios' && <ViewUsuarios />}
      {seccion === 'historial' && <ViewHistorial />}
    </AdminLayout>
  );
};

export default DashboardAdmin;