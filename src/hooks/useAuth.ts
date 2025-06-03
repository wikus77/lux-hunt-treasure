

export function useAuth() {
  const user = { 
    id: "6c789e77-a58a-4135-b9ed-2d96ec4f7849", // Developer ID from logs
    email: "wikus77@hotmail.it" 
  };
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

