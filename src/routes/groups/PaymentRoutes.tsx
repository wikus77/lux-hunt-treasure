
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import Subscriptions from "../../pages/Subscriptions";
import PaymentMethods from "../../pages/PaymentMethods";
import PaymentSilver from "../../pages/PaymentSilver";
import PaymentGold from "../../pages/PaymentGold";
import PaymentBlack from "../../pages/PaymentBlack";
import PaymentSuccess from "../../pages/PaymentSuccess";

const PaymentRoutes = () => {
  const baseUserRoles = ['user', 'moderator', 'admin'];
  
  return (
    <>
      <Route
        path="/subscriptions"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Subscriptions />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentMethods />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-silver"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentSilver />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-gold"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentGold />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-black"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentBlack />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-success"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentSuccess />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};

export default PaymentRoutes;
