
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import Settings from '../../pages/Settings';
import PersonalInfo from '../../pages/PersonalInfo';
import LanguageSettings from '../../pages/LanguageSettings';

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/personal-info" 
        element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/language-settings" 
        element={
          <ProtectedRoute>
            <LanguageSettings />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default SettingsRoutes;
