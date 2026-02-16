import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../../services/studentService';
import { getAuthUser } from '../../utils/auth';
import { toast } from 'react-toastify';

const StudentsPage = () => {
  const navigate = useNavigate();
  const user = getAuthUser(); // Usuario actual
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para los filtros
  const [formData, setFormData] = useState({
    matricula: '',
    nombre: ''
  });

  // Función para cargar estudiantes
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudents(formData);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      toast.error('Error al cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Función para eliminar estudiante
  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este estudiante?');
    if (!confirmed) return;

    try {
      await studentService.deleteStudent(id);
      toast.success('Estudiante eliminado correctamente');
      fetchStudents(); // Recargar lista
    } catch (error) {
      toast.error('Error al eliminar el estudiante');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">👨‍🎓 Gestión de Estudiantes</h2>
          <p className="page-description">Registro y administración de la biblioteca</p>
        </div>
        
        {/* Solo ADMIN puede crear estudiantes */}
        {user?.role === 'ADMIN_ROLE' && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/students/create')}
          >
            + Nuevo Estudiante
          </button>
        )}
      </div>

      {/* Formulario de búsqueda */}
      <div className="search-section">
        <div className="search-form">
          <div className="form-group-inline">
            <label>Matrícula:</label>
            <input
              type="text"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              placeholder="Buscar por matrícula..."
            />
          </div>
          <div className="form-group-inline">
            <label>Nombre:</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Buscar por nombre..."
            />
          </div>
          <button className="btn btn-info" onClick={fetchStudents}>Buscar</button>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">Cargando estudiantes...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nombre Completo</th>
                  <th>Grado</th>
                  <th>Estado</th>
                  {user?.role === 'ADMIN_ROLE' && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student._id}>
                      <td><strong>{student.matricula}</strong></td>
                      <td>{student.nombres} {student.apellidos}</td>
                      <td>{student.grado}° {student.seccion}</td>
                      <td>
                        <span className={`badge badge-${student.estado === 'activo' ? 'success' : 'secondary'}`}>
                          {student.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {user?.role === 'ADMIN_ROLE' && (
                        <td className="table-actions">
                          <button 
                            className="btn-edit" 
                            onClick={() => navigate(`/students/edit/${student._id}`)}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDelete(student._id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={user?.role === 'ADMIN_ROLE' ? "5" : "4"} className="no-data">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
