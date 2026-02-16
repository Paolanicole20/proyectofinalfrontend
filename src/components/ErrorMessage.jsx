import React from 'react';

const ErrorMessage = ({ errors }) => {
  // Si no hay errores, no renderiza nada
  if (!errors || errors.length === 0) return null;

  return (
    <div className="error-message-container">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <h3 className="error-title">Errores detectados</h3>
      </div>
      
      <ul className="error-list">
        {errors.map((error, index) => (
          <li key={index} className="error-item">
            {/* Si el error tiene campo lo muestra, si es un error general de servidor no */}
            {error.campo && error.campo !== 'SERVER' && (
              <span className="error-field">{error.campo}: </span>
            )}
            <span className="error-text">{error.mensaje}</span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .error-message-container {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          animation: fadeIn 0.3s ease-in;
        }
        .error-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .error-icon {
          margin-right: 8px;
        }
        .error-title {
          color: #991b1b;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.85rem;
          margin: 0;
        }
        .error-list {
          list-style-type: disc;
          margin-left: 1.5rem;
          padding: 0;
        }
        .error-item {
          color: #b91c1c;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        .error-field {
          font-weight: 600;
          text-transform: capitalize;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;