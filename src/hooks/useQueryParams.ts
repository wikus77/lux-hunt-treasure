
import { useLocation } from 'react-router-dom';

export function useQueryParams<T extends Record<string, string>>(): T {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  
  const result = {} as T;
  
  // Convert URLSearchParams to a plain object with primitive string values
  params.forEach((value, key) => {
    // Use primitive string value instead of String object
    (result as any)[key] = value.toString();
  });
  
  return result;
}
