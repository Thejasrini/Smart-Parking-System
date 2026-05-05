import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import SearchParking from './pages/user/SearchParking';
import MyBookings from './pages/user/MyBookings';
import ChatBot from './pages/user/ChatBot';
import Profile from './pages/user/Profile';
import ParkingDetails from './pages/user/ParkingDetails';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProfile from './pages/owner/OwnerProfile';
import AddParking from './pages/owner/AddParking';
import BookingRequests from './pages/owner/BookingRequests';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApproveParkings from './pages/admin/ApproveParkings';

// Protected Route component
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route path="/search" element={
          <ProtectedRoute roles={['user']}><SearchParking /></ProtectedRoute>
        }/>
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['user']}><MyBookings /></ProtectedRoute>
        }/>
        <Route path="/chat" element={
          <ProtectedRoute roles={['user']}><ChatBot /></ProtectedRoute>
        }/>
        <Route path="/profile" element={
          <ProtectedRoute roles={['user']}><Profile /></ProtectedRoute>
        }/>
        <Route path="/parking-details" element={
          <ProtectedRoute roles={['user']}><ParkingDetails /></ProtectedRoute>
        }/>

        {/* Owner */}
        <Route path="/owner" element={
          <ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>
        }/>
        <Route path="/owner/profile" element={
          <ProtectedRoute roles={['owner']}><OwnerProfile /></ProtectedRoute>
        }/>
        <Route path="/owner/add" element={
          <ProtectedRoute roles={['owner']}><AddParking /></ProtectedRoute>
        }/>
        <Route path="/owner/requests" element={
          <ProtectedRoute roles={['owner']}><BookingRequests /></ProtectedRoute>
        }/>

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        }/>
        <Route path="/admin/approve" element={
          <ProtectedRoute roles={['admin']}><ApproveParkings /></ProtectedRoute>
        }/>

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;