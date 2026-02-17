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

// Categorías
import CategoriesPage from './pages/categories/CategoriesPage';
import CreateCategoryPage from './pages/categories/CreateCategoryPage';

// Préstamos
import LoansPage from './pages/loans/LoansPage';
import CreateLoanPage from './pages/loans/CreateLoanPage';

// --- IMPORTACIONES ACTIVADAS ---
import ReturnsPage from './pages/returns/ReturnsPage';
import CreateReturnPage from './pages/returns/CreateReturnPage'; 

import FinesPage from './pages/fines/FinesPage';
import CreateFinePage from './pages/fines/CreateFinePage'; 

import ReservationsPage from './pages/reservations/ReservationsPage';
import CreateReservationPage from './pages/reservations/CreateReservationPage'; 

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
        <Route path="/" element={<Layout />}>
          
          <Route index element={<Home />} />
          <Route path="/users/login" element={<LoginUserPage />} />

          {/* --- RUTAS PROTEGIDAS: ACCESO GENERAL --- */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN_ROLE', 'USER_ROLE']} />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/categories" element={<CategoriesPage />} /> 
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/fines" element={<FinesPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/users/changepassword" element={<ChangePasswordUserPage />} />
          </Route>

          {/* --- RUTAS PROTEGIDAS: GESTIÓN (Solo Admin) --- */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN_ROLE']} />}>
            <Route path="/students/create" element={<CreateStudentPage />} />
            <Route path="/students/edit/:id" element={<EditStudentPage />} />
            
            <Route path="/books/create" element={<CreateBookPage />} />
            <Route path="/books/edit/:id" element={<EditBookPage />} />
            <Route path="/categories/create" element={<CreateCategoryPage />} />
            
            <Route path="/loans/create" element={<CreateLoanPage />} />

            {/* RUTAS DE CREACIÓN ACTIVADAS AHORA */}
            <Route path="/returns/create" element={<CreateReturnPage />} />
            <Route path="/fines/create" element={<CreateFinePage />} />
            <Route path="/reservations/create" element={<CreateReservationPage />} /> 

            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/create" element={<CreateUserPage />} />
            <Route path="/users/edit/:id" element={<EditUserPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;