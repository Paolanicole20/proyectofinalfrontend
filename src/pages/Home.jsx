import React from 'react';
import { getAuthUser } from '../utils/auth';
import './Home.css';

const Home = () => {
  const user = getAuthUser();

  return (
    <div className="home-simple">
      <header className="welcome-box">
        <h1>Sistema de Gestión Bibliotecaria</h1>
        <hr />
        <p>Bienvenido(a), <strong>{user?.nombre || 'Usuario'}</strong></p>
        <p>
          Nivel de acceso: <span className="role-tag">{user?.role || 'Visitante'}</span>
        </p>
      </header>

      <section className="home-instructions">
        <h3>
          <span>💡</span> Instrucciones de uso
        </h3>
        <ul>
          <li>Utiliza el menú lateral para navegar entre las secciones.</li>
          <li>Gestiona estudiantes, libros y préstamos según tus permisos.</li>
          <li>Recuerda cerrar sesión al terminar tu jornada para proteger los datos.</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;