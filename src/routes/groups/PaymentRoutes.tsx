import React from 'react';
import { Route } from 'wouter';
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
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Subscriptions />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/payment-methods"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentMethods />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/payment-silver"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentSilver />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/payment-gold"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentGold />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/payment-black"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentBlack />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/payment-success"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PaymentSuccess />
          </RoleBasedProtectedRoute>
        )}
      />
    </>
  );
};

export default PaymentRoutes;