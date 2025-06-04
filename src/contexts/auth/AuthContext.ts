
import { createContext } from 'react';
import { AuthContextType } from './types';

// FIX APPLICATO MANUALMENTE - Create context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
