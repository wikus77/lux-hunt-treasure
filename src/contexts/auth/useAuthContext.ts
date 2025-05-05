
import { useContext } from 'react';
import AuthContext from './AuthContext';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext deve essere usato all\'interno di un AuthProvider');
  }
  
  return context;
};
