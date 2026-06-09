import React from 'react';
import { ViewMesasMozo } from '../views/Mozo/ViewMesasMozo';

const DashboardMozo = ({ onLogout, user }) => {
  return (
    <ViewMesasMozo 
      user={user} 
      onLogout={onLogout} 
    />
  );
};

export default DashboardMozo;