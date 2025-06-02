
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

// Pages
import Home from "../../pages/Home";
import Profile from "../../pages/Profile";
import Events from "../../pages/Events";
import Buzz from "../../pages/Buzz";
import Map from "../../pages/Map";
import Games from "../../pages/Games";
import TestAgent from "../../pages/TestAgent";
import AdminPrizeForm from "../../pages/AdminPrizeForm";

const UserRoutes = () => {
  return (
    <>
      {/* User route definitions here */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buzz"
        element={
          <ProtectedRoute>
            <Buzz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <Games />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-agent"
        element={
          <ProtectedRoute>
            <TestAgent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-prize-form"
        element={
          <ProtectedRoute>
            <AdminPrizeForm />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default UserRoutes;
