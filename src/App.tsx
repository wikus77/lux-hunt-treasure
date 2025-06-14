
import { BrowserRouter as Router } from "react-router-dom";
import { UnifiedAuthProvider } from "@/contexts/auth/UnifiedAuthProvider";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <Router>
      <UnifiedAuthProvider>
        <AppRoutes />
      </UnifiedAuthProvider>
    </Router>
  );
}
