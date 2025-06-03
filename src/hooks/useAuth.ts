
export function useAuth() {
  return {
    authState: {
      user: { email: "wikus77@hotmail.it" },
      session: { access_token: "dev-token" },
      isLoading: false,
      isAuthenticated: true,
    },
  };
}
