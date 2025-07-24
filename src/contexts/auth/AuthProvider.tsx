import React, { useEffect } from 'react';
import { AuthContext } from './AuthContext'; // adatta path se serve

const AuthProvider = ({ children }) => {
  useEffect(() => {
    // funzione di pulizia cache, sostituisci con la tua funzione esatta
    clearCacheAndLogout();
  }, [/* session o dipendenze necessarie */]);

  return (
    <AuthContext.Provider
      value={{
        user: null,            // sostituisci con stato reale
        isAuthenticated: false,// sostituisci con stato reale
        isLoading: false,      // sostituisci con stato reale
        login: () => {},       // sostituisci con funzione reale
        logout: () => {},      // sostituisci con funzione reale
        resetPassword: () => {}, // sostituisci con funzione reale
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
