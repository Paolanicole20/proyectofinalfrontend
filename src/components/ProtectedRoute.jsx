import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthUser, isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ allowedRoles }) => {
    const user = getAuthUser();
    const auth = isAuthenticated();

    // 1. Si no hay sesión iniciada, al login
    if (!auth) {
        return <Navigate to="/users/login" replace />;
    }

    // 2. Extraer el rol (manejando rol o role por si acaso)
    const userRole = user?.rol || user?.role;

    // 3. Verificar permisos
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.warn("Acceso denegado: Rol insuficiente");
        return <Navigate to="/" replace />;
    }

    // 4. Dejar pasar a la página
    return <Outlet />;
};

export default ProtectedRoute;