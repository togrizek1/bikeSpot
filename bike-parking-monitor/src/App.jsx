import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/homepage/Homepage.jsx';
import ParkingPage from './pages/parkingPage/ParkingPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/parking/:id" element={<ParkingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
