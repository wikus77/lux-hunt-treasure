import React, { useEffect } from "react";

const AuthProvider = () => {
  useEffect(() => {
    clearCacheAndLogout();
  }, [session]);

  return (
    <AuthContext.Provider value={{
          resetPassword
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

caches.keys()
  .then((cacheNames) =>
    Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  )
caches.keys()
  .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
  .catch((err) => {
    console.error("Errore durante caches.keys():", err);
  });
useEffect(() => {
  handleLogout();
}, [session]);
      return (
        <AuthContext.Provider
          value={{
            session,
            user,
            userRoles,
            isAuthenticated,
            setUserRoles,
            rolesCount: userRoles.length,
            isRoleLoading,
            login,
            logout,
            resetPassword
          }}
        >
          {children}
        </AuthContext.Provider>
      );
    }

export default AuthProvider;
      return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        resetPassword,
      };
      return {
        user,
        userRoles,
      };
