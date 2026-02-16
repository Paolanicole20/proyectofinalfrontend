import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import './App.css';

// --- COMPONENTES DE ESTRUCTURA ---
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// --- PÁGINAS ---
import Home from './pages/Home';

// Estudiantes
import StudentsPage from './pages/students/StudentsPage';
import CreateStudentPage from './pages/students/CreateStudentPage';
import EditStudentPage from './pages/students/EditStudentPage';

// Libros
import BooksPage from './pages/books/BooksPage';
import CreateBookPage from './pages/books/CreateBookPage';
import EditBookPage from './pages/books/EditBookPage';

// Préstamos
import LoansPage from './pages/loans/LoansPage';
import CreateLoanPage from './pages/loans/CreateLoanPage';

// Usuarios y Seguridad
import UsersPage from './pages/users/UsersPage';
import CreateUserPage from './pages/users/CreateUserPage';
import EditUserPage from './pages/users/EditUserPage';
import LoginUserPage from './pages/users/LoginUserPage';
import ChangePasswordUserPage from './pages/users/ChangePasswordUserPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El Layout envuelve a todas las páginas para mostrar el Navbar/Menú */}
        <Route path="/" element={<Layout />}>
          
          {/* --- RUTAS PÚBLICAS --- */}
          <Route index element={<Home />} />
          <Route path="/users/login" element={<LoginUserPage />} />

          {/* --- RUTAS PROTEGIDAS: ACCESO GENERAL (Admin y Usuarios) --- */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN_ROLE', 'USER_ROLE']} />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/users/changepassword" element={<ChangePasswordUserPage />} />
          </Route>

          {/* --- RUTAS PROTEGIDAS: GESTIÓN (Solo Admin) --- */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN_ROLE']} />}>
            {/* Gestión de Estudiantes */}
            <Route path="/students/create" element={<CreateStudentPage />} />
            <Route path="/students/edit/:id" element={<EditStudentPage />} />
            
            {/* Gestión de Libros */}
            <Route path="/books/create" element={<CreateBookPage />} />
            <Route path="/books/edit/:id" element={<EditBookPage />} />
            
            {/* Gestión de Préstamos */}
            <Route path="/loans/create" element={<CreateLoanPage />} />

            {/* Gestión de Usuarios del Sistema */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/create" element={<CreateUserPage />} />
            <Route path="/users/edit/:id" element={<EditUserPage />} />
          </Route>

          {/* Redirección automática si la ruta no existe */}
          <Route path="*" element={<Navigate to="/" />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;