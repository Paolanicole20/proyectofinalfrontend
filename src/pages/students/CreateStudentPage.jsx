import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from '../../services/studentService'; // Importación directa más segura
import { studentZodSchema } from '../../schemas/student'; 
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const CreateStudentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matricula: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    grado: '',
    seccion: '',
    estado: 'activo'
  });
  
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); 

    // 1. Validación de Cliente (Zod)
    const resultado = studentZodSchema.safeParse(formData);

    if (!resultado.success) {
      const listaErrores = resultado.error.issues.map(issue => ({
        campo: issue.path[0],
        mensaje: issue.message
      }));
      setErrors(listaErrores);
      return;
    }

    try {
      setLoading(true);
      // 2. Envío al Servidor
      await create(formData);
      toast.success('Estudiante registrado con éxito');
      navigate('/students');
    } catch (error) {
      const serverMessage = error.response?.data?.error || 'Error al conectar con el servidor';
      setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h2 style={{ color: '#1a237e' }}>👨‍🎓 Registrar Nuevo Estudiante</h2>
      </div>

      <div className="form-card" style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Matrícula:</label>
              <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} placeholder="EST-2026-001" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo:</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="estudiante@correo.com" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombres:</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Apellidos:</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono:</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="7777-7777" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Grado:</label>
              <select name="grado" value={formData.grado} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Seleccione...</option>
                {['1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sección:</label>
              <select name="seccion" value={formData.seccion} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Seleccione...</option>
                {['A', 'B', 'C'].map(s => <option key={s} value={s}>Sección {s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <ErrorMessage errors={errors} />
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ background: '#1a237e', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
              {loading ? 'Guardando...' : '💾 Registrar Estudiante'}
            </button>
            <button type="button" onClick={() => navigate('/students')} style={{ background: '#f44336', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudentPage;