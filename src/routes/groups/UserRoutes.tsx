
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import Home from "../../pages/Home";
import Events from "../../pages/Events";
import Profile from "../../pages/Profile";
import Map from "../../pages/Map";
import Buzz from "../../pages/Buzz";

const UserRoutes = () => {
  const baseUserRoles = ['user', 'moderator', 'admin'];
  
  return (
    <>
      <Route
        path="/home"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Home />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Events />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Profile />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Map />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/buzz"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Buzz />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};

export default UserRoutes;
