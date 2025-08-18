import React from 'react';
import { Route } from 'wouter';
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

// Pages
import Home from "../../pages/Home";
import Profile from "../../pages/Profile";
import Events from "../../pages/Events";
import { BuzzPage } from "../../pages/BuzzPage";
import Map from "../../pages/Map";
import Games from "../../pages/Games";
import TestAdminUI from "../../pages/TestAdminUI";
import AdminPrizes from "../../pages/AdminPrizes";

const UserRoutes = () => {
  return (
    <>
      {/* User route definitions here */}
      <Route
        path="/home"
        component={() => (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile"
        component={() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/events"
        component={() => (
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/buzz"
        component={() => (
          <ProtectedRoute>
            <BuzzPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/map"
        component={() => (
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/games"
        component={() => (
          <ProtectedRoute>
            <Games />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/test-agent"
        component={() => (
          <ProtectedRoute>
            <TestAdminUI />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin-prize-form"
        component={() => (
          <ProtectedRoute>
            <AdminPrizes />
          </ProtectedRoute>
        )}
      />
    </>
  );
};

export default UserRoutes;