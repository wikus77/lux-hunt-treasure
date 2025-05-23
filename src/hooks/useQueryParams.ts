
import { useLocation } from 'react-router-dom';

export function useQueryParams<T extends Record<string, string>>(): T {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  
  const result = {} as T;
  
  params.forEach((value, key) => {
    // Ensure we're using primitive strings, not String objects
    (result as any)[key] = String(value).valueOf();
  });
  
  return result;
}
