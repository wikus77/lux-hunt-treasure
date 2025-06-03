
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔁 Redireziono a /home");
    navigate("/home", { replace: true });
  }, []);

  return null;
};

export default Index;
