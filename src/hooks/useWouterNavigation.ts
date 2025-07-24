import { useCallback } from "react";
import { useNavigate } from "wouter";

export function useWouterNavigation() {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  }, [navigate]);

  return { navigate, goBack };
}
