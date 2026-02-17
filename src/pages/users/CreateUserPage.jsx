import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../services/userService';
import { userZodSchema } from '../../schemas/user';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        role: 'USER_ROLE'
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
        if (errors.length > 0) setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = userZodSchema.safeParse(userData);

        if (!result.success) {
            setErrors(result.error.issues.map(i => ({ campo: i.path[0], mensaje: i.message })));
            return;
        }

        try {
            setLoading(true);
            await createUser(userData);
            toast.success('Usuario creado exitosamente');
            navigate('/users');
        } catch (error) {
            const msg = error.response?.data?.msg || 'Error al crear el usuario';
            setErrors([{ campo: 'SERVER', mensaje: msg }]);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                <h2 style={{ color: '#1a237e', margin: 0 }}>👤 Crear Nuevo Usuario</h2>
                <p style={{ color: '#666', margin: '5px 0' }}>Gestión de accesos y roles del sistema</p>
            </div>

            <div className="form-card" style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre:</label>
                            <input 
                                type="text" 
                                name="nombre"
                                value={userData.nombre}
                                placeholder="Ej: Juan" 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Apellido:</label>
                            <input 
                                type="text" 
                                name="apellido"
                                value={userData.apellido}
                                placeholder="Ej: Pérez" 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                            <input 
                                type="email" 
                                name="email"
                                value={userData.email}
                                placeholder="correo@biblioteca.com" 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña:</label>
                            <input 
                                type="password" 
                                name="password"
                                value={userData.password}
                                placeholder="********" 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rol de Usuario:</label>
                            <select 
                                name="role"
                                value={userData.role}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
                            >
                                <option value="USER_ROLE">Bibliotecario (Acceso estándar)</option>
                                <option value="ADMIN_ROLE">Administrador (Acceso total)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <ErrorMessage errors={errors} />
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            style={{ 
                                background: '#1a237e', 
                                color: 'white', 
                                padding: '12px 20px', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                flex: 1, 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? 'Guardando...' : '💾 Guardar Usuario'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/users')} 
                            style={{ 
                                background: '#f44336', 
                                color: 'white', 
                                padding: '12px 20px', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserPage;