export const getAuthUser = () => {
    try {
        const user = localStorage.getItem('user');
        if (!user || user === 'undefined') return null;
        return JSON.parse(user);
    } catch (error) {
        console.error("Error al parsear el usuario desde localStorage:", error);
        return null;
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined && token !== '';
};

export const saveAuth = (token, user) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
};

export const getToken = () => localStorage.getItem('token');

// CORRECCIÓN AQUÍ: Ahora busca tanto 'role' como 'rol'
export const hasRole = (requiredRoles) => {
    const user = getAuthUser();
    if (!user) return false;
    
    // Detectamos qué nombre de propiedad usa tu usuario (role o rol)
    const userRole = user.role || user.rol;
    
    if (!userRole) return false;

    if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(userRole);
    }
    
    return userRole === requiredRoles; 
};

export const logout = () => {
    localStorage.clear();
    window.location.href = '/users/login'; 
};