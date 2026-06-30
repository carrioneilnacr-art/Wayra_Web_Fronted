import React from 'react';
import PropTypes from 'prop-types';
import { ViewMesasMozo } from '../views/Mozo/ViewMesasMozo';

const DashboardMozo = ({ onLogout, user }) => {
  return (
    <ViewMesasMozo
      user={user}
      onLogout={onLogout}
    />
  );
};

DashboardMozo.propTypes = {
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default DashboardMozo;