import React from 'react';
import { ViewRecepcion } from '../views/Recepcion/ViewRecepcion';

const DashboardRecepcion = ({ onLogout, user }) => {
  return (
    <ViewRecepcion 
      user={user} 
      onLogout={onLogout} 
    />
  );
};

export default DashboardRecepcion;