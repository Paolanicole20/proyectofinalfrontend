import React from 'react';

const ErrorMessage = ({ errors }) => {
  // Si no hay errores o el array está vacío, no renderiza nada
  if (!errors || errors.length === 0) return null;

  // Estilos definidos como constantes para evitar el error de 'style jsx'
  const styles = {
    container: {
      backgroundColor: '#fef2f2',
      borderLeft: '4px solid #ef4444',
      padding: '1rem',
      marginBottom: '1.5rem',
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'block'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
    },
    icon: {
      marginRight: '8px',
    },
    title: {
      color: '#991b1b',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '0.85rem',
      margin: 0,
      display: 'inline-block'
    },
    list: {
      listStyleType: 'disc',
      marginLeft: '1.5rem',
      padding: 0,
      marginTop: '8px'
    },
    item: {
      color: '#b91c1c',
      fontSize: '0.9rem',
      marginBottom: '0.25rem',
    },
    field: {
      fontWeight: 'bold',
      textTransform: 'capitalize',
    },
    text: {
      color: '#7f1d1d'
    }
  };

  return (
    <div style={styles.container} className="error-message-container">
      <div style={styles.header}>
        <span style={styles.icon}>⚠️</span>
        <h3 style={styles.title}>Errores detectados</h3>
      </div>
      
      <ul style={styles.list}>
        {errors.map((error, index) => (
          <li key={index} style={styles.item}>
            {/* Si el error tiene campo lo muestra (ej: matrícula, nombres), 
                excepto si es un error general del servidor */}
            {error.campo && error.campo !== 'SERVER' && (
              <span style={styles.field}>{error.campo}: </span>
            )}
            <span style={styles.text}>{error.mensaje}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorMessage;