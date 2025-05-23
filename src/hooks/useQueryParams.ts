
import { useLocation } from 'react-router-dom';

export function useQueryParams<T extends Record<string, string>>(): T {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  
  const result = {} as T;
  
  // Convert URLSearchParams to a plain object
  params.forEach((value, key) => {
    (result as any)[key] = value;
  });
  
  return result;
}
