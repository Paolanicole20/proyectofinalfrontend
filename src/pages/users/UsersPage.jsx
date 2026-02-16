import { getUsers } from '../../services/userService';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        rol: '' 
    });
    const navigate = useNavigate();

    // Usamos useCallback para evitar recrear la función en cada renderizado
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUsers(formData);
            
            // CORRECCIÓN CRÍTICA: Validamos que response.data exista y sea un array
            if (response && response.data && Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.warn('La respuesta no es un array válido:', response.data);
                setUsers([]); // Resetear a array vacío para evitar que .map() falle
            }
        } catch (error) {
            console.error('Error fetching Users:', error);
            setUsers([]); // Si hay error, mantenemos el array vacío
        } finally {
            setLoading(false);
        }
    }, [formData]);

    useEffect(() => {
        fetchUsers();
    }, []); // Se ejecuta al montar el componente

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>👥 Gestión de Usuarios</h1>
                <button className="btn btn-primary" onClick={() => navigate('/users/create')}>
                    + Nuevo Usuario
                </button>
            </div>

            <div className="filters-container">
                <div className="filter-group">
                    <label>Buscar por nombre:</label>
                    <input
                        type="text"
                        placeholder="Escribe un nombre..."
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                </div>
                <button className="btn btn-search" onClick={fetchUsers}>Filtrar</button>
            </div>

            {loading ? (
                <div className="loader">Cargando usuarios...</div>
            ) : (
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Al asegurar que users siempre es un array, .map no fallará nunca */}
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>{`${user.nombre || ''} ${user.apellido || ''}`}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge badge-${user.role?.toLowerCase() || 'default'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-edit"
                                            onClick={() => navigate(`/users/edit/${user._id}`)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                    No se encontraron usuarios.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsersPage;