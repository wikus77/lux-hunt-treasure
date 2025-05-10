export interface AuthContextType {
  user: any | null;
  signIn?: (email: string, password: string) => Promise<void>;
  signUp?: (email: string, password: string, data?: any) => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updateUserProfile?: (data: any) => Promise<void>;
  loading?: boolean;
  logout?: () => void; // Added logout method
  signOut?: () => void; // Added signOut as alternative name
}
