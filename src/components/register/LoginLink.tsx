
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LoginLink: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center">
      <Button
        variant="link"
        className="text-cyan-400"
        onClick={() => navigate("/login")}
        type="button"
      >
        Hai già un account? Accedi
      </Button>
    </div>
  );
};

export default LoginLink;
