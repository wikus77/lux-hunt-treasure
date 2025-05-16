
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Home from '../../pages/Home';
import Profile from '../../pages/Profile';
import Notifications from '../../pages/Notifications';
import Stats from '../../pages/Stats';
import Map from '../../pages/Map';
import Events from '../../pages/Events';
import Buzz from '../../pages/Buzz';
import TestAgent from '../../pages/TestAgent';

// Routes that require basic authentication
const UserRoutes = () => {
  return (
    <>
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/buzz" element={<ProtectedRoute><Buzz /></ProtectedRoute>} />
      <Route path="/test-agent" element={<ProtectedRoute><TestAgent /></ProtectedRoute>} />
    </>
  );
};

export default UserRoutes;
