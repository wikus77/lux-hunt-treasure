
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import RegisterForm from "../components/register/RegisterForm";
import RegisterHeader from "../components/register/RegisterHeader";
import FloatingParticles from "../components/register/FloatingParticles";
import TermsNotice from "../components/register/TermsNotice";

const Register = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      {/* Background particles */}
      <FloatingParticles />

      <motion.div 
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with logo */}
        <RegisterHeader />

        {/* Registration form */}
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <RegisterForm />
        </motion.div>

        {/* Terms and conditions */}
        <TermsNotice />
      </motion.div>
    </div>
  );
};

export default Register;
