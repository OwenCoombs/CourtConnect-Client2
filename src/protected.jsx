// ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Context } from './context';

const ProtectedRoute = () => {
  const { auth } = useContext(Context);
  console.log('PROTECTED ROUTE: TOKEN: ', auth.accessToken)
  return auth.accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

