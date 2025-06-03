
export function useAuth() {
  const user = { email: "wikus77@hotmail.it" };
  const session = { access_token: "dev-token" };

  return {
    user,
    session,
    isAuthenticated: true,
    isLoading: false,
    authState: {
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
    },
  };
}
