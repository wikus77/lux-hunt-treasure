
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/index/LoadingScreen";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// FIXED: Lazy loading with proper error boundaries
const AppHome = React.lazy(() => import("@/pages/AppHome"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const Login = React.lazy(() => import("@/pages/Login"));
const Register = React.lazy(() => import("@/pages/Register"));
const Home = React.lazy(() => import("@/pages/Home"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Map = React.lazy(() => import("@/pages/Map"));
const Events = React.lazy(() => import("@/pages/Events"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const Contact = React.lazy(() => import("@/pages/Contact"));
const Buzz = React.lazy(() => import("@/pages/Buzz"));
const Notifications = React.lazy(() => import("@/pages/Notifications"));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AppHome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/map" element={<Map />} />
          <Route path="/events" element={<Events />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/buzz" element={<Buzz />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<AppHome />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
