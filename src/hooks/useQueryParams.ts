
import { useLocation } from 'wouter';

export function useQueryParams<T extends Record<string, string>>(): T {
  const [location] = useLocation();
  const search = window.location.search;
  const params = new URLSearchParams(search);
  
  const result = {} as T;
  
  params.forEach((value, key) => {
    // Ensure we're using primitive strings, not String objects
    (result as any)[key] = String(value).valueOf();
  });
  
  return result;
}
