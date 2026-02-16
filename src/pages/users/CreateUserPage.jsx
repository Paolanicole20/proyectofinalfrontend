import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../services/userService';
import { userZodSchema } from '../../schemas/user';
import ErrorMessage from '../../components/ErrorMessage';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = userZodSchema.safeParse(userData);

        if (!result.success) {
            setErrors(result.error.issues.map(i => ({ campo: i.path[0], mensaje: i.message })));
            return;
        }

        try {
            await createUser(userData);
            navigate('/users');
        } catch (error) {
            setErrors([{ campo: 'SERVER', mensaje: error.response?.data?.msg || 'Error al crear' }]);
        }
    };

    return (
        <div className="form-page">
            <h2>Crear Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="custom-form">
                <input type="text" placeholder="Nombre" onChange={e => setUserData({...userData, nombre: e.target.value})} />
                <input type="text" placeholder="Apellido" onChange={e => setUserData({...userData, apellido: e.target.value})} />
                <input type="email" placeholder="Email" onChange={e => setUserData({...userData, email: e.target.value})} />
                <input type="password" placeholder="Password" onChange={e => setUserData({...userData, password: e.target.value})} />
                <select onChange={e => setUserData({...userData, role: e.target.value})}>
                    <option value="USER_ROLE">Bibliotecario (User)</option>
                    <option value="ADMIN_ROLE">Administrador</option>
                </select>
                <ErrorMessage errors={errors} />
                <button type="submit" className="btn btn-primary">Guardar Usuario</button>
            </form>
        </div>
    );
};
export default CreateUserPage;