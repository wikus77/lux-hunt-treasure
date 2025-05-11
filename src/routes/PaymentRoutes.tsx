
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Pages
import Subscriptions from "../pages/Subscriptions";
import PaymentMethods from "../pages/PaymentMethods";
import PaymentSilver from "../pages/PaymentSilver";
import PaymentGold from "../pages/PaymentGold";
import PaymentBlack from "../pages/PaymentBlack";
import PaymentSuccess from "../pages/PaymentSuccess";

export const PaymentRoutes = () => {
  return (
    <>
      {/* Payment Routes - Available to all authenticated users */}
      <Route
        path="/subscriptions"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Subscriptions />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentMethods />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-silver"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentSilver />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-gold"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentGold />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-black"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentBlack />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-success"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentSuccess />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};
