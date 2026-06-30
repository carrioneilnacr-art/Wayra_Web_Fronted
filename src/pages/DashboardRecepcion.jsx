import React from 'react';
import PropTypes from 'prop-types';
import { ViewRecepcion } from '../views/Recepcion/ViewRecepcion';

const DashboardRecepcion = ({ onLogout, user }) => {
  return (
    <ViewRecepcion
      user={user}
      onLogout={onLogout}
    />
  );
};

DashboardRecepcion.propTypes = {
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default DashboardRecepcion;