import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

// Lazy load components for better performance
const HomeScreen = lazy(() => import('./components/HomeScreen'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
//const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const UserDashboard = lazy(() => import('./components/user/UserDashboard'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ProfileManagement = lazy(() => import('./components/user/ProfileManagement'));
const UserManagement = lazy(() => import('./components/admin/UserManagement'));
const EventManagement = lazy(() => import('./components/admin/EventManagement'));
const ViewEvents = lazy(() => import('./components/events/ViewEvents'));
const BookEvent = lazy(() => import('./components/events/BookEvent'));
const CheckoutPage = lazy(() => import('./components/events/CheckoutPage'));
const BookingSuccessPage = lazy(() => import('./components/events/BookingSuccessPage'));

// Route definitions
const routes = [
  // Public Routes
  { path: '/', element: <HomeScreen />, public: true },
  { path: '/login', element: <Login />, public: true },
  { path: '/register', element: <Register />, public: true },
  //{ path: '/forgot-password', element: <ForgotPassword />, public: true },

  // User Routes
  { path: '/dashboard', element: <UserDashboard />, role: 'user' },
  { path: '/profile', element: <ProfileManagement /> },
  { path: '/events', element: <ViewEvents /> },
  { path: '/book-event/:eventId', element: <BookEvent /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/booking-success', element: <BookingSuccessPage /> },

  // Admin Routes
  { path: '/admin', element: <AdminDashboard />, role: 'admin' },
  { path: '/admin/users', element: <UserManagement />, role: 'admin' },
  { path: '/admin/events', element: <EventManagement />, role: 'admin' },
];

// Protected route component
function PrivateRoute({ children, requiredRole }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen message="Loading..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner fullscreen message="Loading application..." />}>
            <Routes>
              {routes.map((route, index) => {
                // If it's a public route, render it directly
                if (route.public) {
                  return <Route key={index} path={route.path} element={route.element} />;
                }

                // Otherwise, wrap it in a PrivateRoute
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <PrivateRoute requiredRole={route.role}>
                        {route.element}
                      </PrivateRoute>
                    }
                  />
                );
              })}
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;