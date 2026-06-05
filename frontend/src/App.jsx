import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateItinerary from './pages/CreateItinerary';
import ViewItinerary from './pages/ViewItinerary';
import NewItineraryModal from './components/NewItineraryModal';
import { useNavigate } from 'react-router-dom';

/* Wrapper that provides the modal trigger to Navbar */
const ProtectedLayout = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleModalSuccess = (id) => {
    setModalOpen(false);
    if (id) navigate(`/itinerary/${id}`);
  };

  return (
    <>
      <Navbar onNewItinerary={() => setModalOpen(true)} />
      {children}
      {modalOpen && (
        <NewItineraryModal onClose={() => setModalOpen(false)} onSuccess={handleModalSuccess} />
      )}
    </>
  );
};

const App = () => {
  const { loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout><Dashboard /></ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/itinerary/create" element={
          <ProtectedRoute>
            <ProtectedLayout><CreateItinerary /></ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/itinerary/:id" element={
          <ProtectedRoute>
            <ProtectedLayout><ViewItinerary /></ProtectedLayout>
          </ProtectedRoute>
        } />

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
