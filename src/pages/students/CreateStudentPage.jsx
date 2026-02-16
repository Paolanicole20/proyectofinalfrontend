import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../../services/studentService';
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
  
  // Usamos un array para los errores 
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores visuales al escribir
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); // Limpiar errores previos

    try {
      // 1. VALIDACIÓN CON ZOD 
      const resultado = studentZodSchema.safeParse(formData);

      if (!resultado.success) {
        const listaErrores = resultado.error.issues.map(issue => ({
          campo: issue.path[0],
          mensaje: issue.message
        }));
        setErrors(listaErrores);
        toast.error('Por favor corrige los errores');
        return;
      }

      // 2. PETICIÓN AL SERVICIO
      setLoading(true);
      await studentService.create(formData);
      toast.success('Estudiante registrado con éxito');
      navigate('/students');

    } catch (error) {
      let serverMessage = "Error en el servidor";
      if (error.response) {
        // Adaptado al manejo de errores 
        serverMessage = error.response.data.error || error.response.data.message || 'Error al guardar';
      } else if (error.request) {
        serverMessage = 'No hay conexión con el servidor';
      }
      setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">👨‍🎓 Crear Estudiante</h2>
          <p className="page-description">Completa la información del nuevo alumno</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/students')}
          disabled={loading}
        >
          ← Volver
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="custom-form">
          <div className="form-grid">
            {/* Matrícula */}
            <div className="form-group">
              <label>Matrícula:</label>
              <input
                type="text"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                placeholder="EST-2024-001"
                className={errors.some(e => e.campo === 'matricula') ? 'input-error' : ''}
              />
            </div>

            {/* Nombres */}
            <div className="form-group">
              <label>Nombres:</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'nombres') ? 'input-error' : ''}
              />
            </div>

            {/* Apellidos */}
            <div className="form-group">
              <label>Apellidos:</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'apellidos') ? 'input-error' : ''}
              />
            </div>

            {/* Correo */}
            <div className="form-group">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'correo') ? 'input-error' : ''}
              />
            </div>

            {/* Grado */}
            <div className="form-group">
              <label>Grado:</label>
              <select name="grado" value={formData.grado} onChange={handleChange}>
                <option value="">Seleccione...</option>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>{g}° Grado</option>
                ))}
              </select>
            </div>

            {/* Sección */}
            <div className="form-group">
              <label>Sección:</label>
              <select name="seccion" value={formData.seccion} onChange={handleChange}>
                <option value="">Seleccione...</option>
                {['A', 'B', 'C'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Componente de errores centralizado  */}
          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Estudiante'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/students')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudentPage;