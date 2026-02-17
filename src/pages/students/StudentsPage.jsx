import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../../services/studentService';
import { getAuthUser } from '../../utils/auth';
import { toast } from 'react-toastify';

const StudentsPage = () => {
  const navigate = useNavigate();
  const user = getAuthUser();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    matricula: '',
    nombre: ''
  });

  // Función corregida: ahora llama a 'getAll' en lugar de 'getStudents'
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Llamamos a getAll que es el nombre definido en el servicio
      const response = await studentService.getAll(formData);
      
      console.log("Datos recibidos de la API:", response.data);

      // Normalización de datos
      const data = response.data?.students || response.data || [];
      setStudents(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      toast.error('Error al conectar con el servidor de estudiantes');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este estudiante?');
    if (!confirmed) return;

    try {
      // Ahora coincide con el nombre exportado en el servicio corregido
      await studentService.deleteStudent(id);
      toast.success('Estudiante eliminado correctamente');
      fetchStudents(); 
    } catch (error) {
      toast.error('Error al eliminar el estudiante');
    }
  };

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        borderBottom: '2px solid #eee',
        paddingBottom: '15px'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a237e', fontSize: '1.8rem' }}>👨‍🎓 Gestión de Estudiantes</h2>
          <p style={{ margin: 0, color: '#666' }}>Registro y administración de la biblioteca</p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/students/create')}
          style={{ 
            padding: '12px 24px', 
            fontWeight: 'bold', 
            backgroundColor: '#1a237e', 
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0d47a1'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#1a237e'}
        >
          + Nuevo Estudiante
        </button>
      </div>

      <div className="search-section" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '25px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
            <label style={{ marginBottom: '8px', fontWeight: '600', color: '#444' }}>Matrícula:</label>
            <input
              type="text"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              placeholder="Ej: EST-2026-001"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 300px' }}>
            <label style={{ marginBottom: '8px', fontWeight: '600', color: '#444' }}>Nombre del Alumno:</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Buscar por nombre o apellido..."
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button 
            onClick={fetchStudents}
            style={{ 
              backgroundColor: '#00bcd4', 
              color: 'white', 
              border: 'none', 
              padding: '11px 30px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔍 Buscar
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
            ⏳ Cargando base de datos de estudiantes...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a237e', color: 'white' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Matrícula</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Nombre Completo</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Grado / Sección</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Estado</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}><strong>{student.matricula}</strong></td>
                      <td style={{ padding: '15px' }}>{student.nombres} {student.apellidos}</td>
                      <td style={{ padding: '15px' }}>{student.grado}° "{student.seccion}"</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ 
                            padding: '5px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.85em',
                            fontWeight: 'bold',
                            backgroundColor: student.estado === 'activo' ? '#e8f5e9' : '#ffebee',
                            color: student.estado === 'activo' ? '#2e7d32' : '#c62828',
                            border: `1px solid ${student.estado === 'activo' ? '#2e7d32' : '#c62828'}`
                        }}>
                          {student.estado?.toUpperCase() || 'ACTIVO'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button 
                          style={{ marginRight: '15px', color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          onClick={() => navigate(`/students/edit/${student._id}`)}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          onClick={() => handleDelete(student._id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '1.1rem' }}>
                      🚫 No se encontraron estudiantes registrados.
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