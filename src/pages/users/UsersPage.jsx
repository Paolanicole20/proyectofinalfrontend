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

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUsers(formData);
            if (response && response.data && Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching Users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [formData]);

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div className="page-container"><div className="loader">Cargando usuarios...</div></div>;

    return (
        <div className="page-container">
            {/* Cabecera usando tu clase .page-header y .page-title */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">👥 Gestión de Usuarios</h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Administración de accesos y perfiles</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/users/create')}>
                    + Nuevo Usuario
                </button>
            </div>

            {/* Sección de búsqueda usando .search-section y .search-form de tu CSS */}
            <div className="search-section">
                <div className="search-form">
                    <div className="form-group-inline">
                        <label>Buscar por nombre:</label>
                        <input
                            type="text"
                            placeholder="Escribe un nombre..."
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    {/* Reutilizamos btn-primary para el filtro o puedes usar un estilo similar */}
                    <button className="btn-primary" style={{ padding: '8px 20px' }} onClick={fetchUsers}>
                        Filtrar
                    </button>
                </div>
            </div>

            {/* Tabla usando .table-card y .data-table de tu CSS */}
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
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td style={{ fontWeight: '600' }}>
                                        {`${user.nombre || ''} ${user.apellido || ''}`}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        {/* Usamos tu badge-success para el rol de Admin */}
                                        <span className={user.role === 'ADMIN_ROLE' ? 'badge-success' : ''} 
                                              style={user.role !== 'ADMIN_ROLE' ? { background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '99px', fontSize: '12px'} : {}}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-primary"
                                            style={{ padding: '5px 12px', fontSize: '0.8rem', backgroundColor: '#64748b' }}
                                            onClick={() => navigate(`/users/edit/${user._id}`)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    No se encontraron usuarios en la base de datos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsersPage;