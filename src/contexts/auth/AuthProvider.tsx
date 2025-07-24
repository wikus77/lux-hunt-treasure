// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


  return (
  return (
    <AuthContext.Provider value={{
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
  useEffect(() => { clearCacheAndLogout(); }, [session]);
              cacheNames.forEach((cacheName) => {
                caches.delete(cacheName);
              });
            })
            .catch((err) => {
              console.error("Errore durante pulizia cache:", err);
            });
          })
          .catch((err) => {
            console.error("Errore durante caches.keys():", err);
          });
        };

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
