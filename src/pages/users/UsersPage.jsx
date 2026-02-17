import { getUsers, deleteUser } from '../../services/userService';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ nombre: '' });
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUsers(formData);
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, [formData]);

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
        try {
            await deleteUser(id);
            toast.success('Usuario eliminado');
            fetchUsers();
        } catch (error) {
            toast.error('Error al eliminar usuario');
        }
    };

    if (loading) return <div className="loading-state">Cargando usuarios...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">👥 Gestión de Usuarios</h1>
                    <p className="page-description">Administración de accesos y perfiles del personal</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/users/create')}>
                    + Nuevo Usuario
                </button>
            </div>

            <div className="search-section">
                <div className="search-form">
                    <div className="form-group-inline">
                        <label>Buscar por nombre:</label>
                        <input
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <button className="btn-primary" onClick={fetchUsers}>Filtrar</button>
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="user-name">{`${user.nombre} ${user.apellido}`}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={user.role === 'ADMIN_ROLE' ? 'badge-success' : 'status-badge status-returned'}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="table-actions">
                                    <button className="btn-table-edit" onClick={() => navigate(`/users/edit/${user._id}`)}>
                                        ✏️ <span>Editar</span>
                                    </button>
                                    <button className="btn-table-delete" onClick={() => handleDelete(user._id)}>
                                        🗑️ <span>Eliminar</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default UsersPage;