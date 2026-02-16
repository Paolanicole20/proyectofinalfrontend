import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as studentService from '../../services/studentService';

import { studentZodSchema } from '../../schemas/student';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estado de errores como Array 
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Cargar datos del estudiante 
  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await studentService.getById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('No se pudo cargar la información del estudiante');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Validación con Zod
      const resultado = studentZodSchema.safeParse(formData);
      
      if (!resultado.success) {
        const listaErrores = resultado.error.issues.map(issue => ({
          campo: issue.path[0],
          mensaje: issue.message
        }));
        setErrors(listaErrores);
        return;
      }

      // 2. Envío de datos
      setSaving(true);
      await studentService.update(id, formData);
      toast.success('Estudiante actualizado correctamente');
      navigate('/students');

    } catch (error) {
      let serverMessage = "";
      if (error.response) {
        serverMessage = error.response.data.error || 'Error en el servidor';
      } else if (error.request) {
        serverMessage = 'No se pudo conectar con el servidor';
      } else {
        serverMessage = error.message;
      }
      setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando datos del estudiante...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">👨‍🎓 Editar Estudiante</h2>
          <p className="page-description">Modifica los campos necesarios</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Matrícula:</label>
              <input
                type="text"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'matricula') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Nombres:</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Apellidos:</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Grado:</label>
              <select name="grado" value={formData.grado} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>{g}° Grado</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Estado:</label>
              <select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Componente de errores */}
          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Actualizar Estudiante'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/students')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentPage;