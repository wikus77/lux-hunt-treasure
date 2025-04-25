
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import './styles/theme.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { LoginModal } from './components/auth/LoginModal'
import AgeVerificationModal from './components/auth/AgeVerificationModal'
import { SoundProvider } from './contexts/SoundContext'

function App({ children }: { children?: React.ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAgeVerificationModalOpen, setIsAgeVerificationModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Don't show modals on landing page
    if (location.pathname === '/') {
      return;
    }

    const hasVerifiedAge = localStorage.getItem('ageVerified');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!hasVerifiedAge) {
      setIsAgeVerificationModalOpen(true);
    } else {
      setIsVerified(true);
    }

    if (!isLoggedIn && hasVerifiedAge) {
      setIsLoginModalOpen(true);
    }
  }, [location]);

  const handleAgeVerification = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsAgeVerificationModalOpen(false);
    setIsVerified(true);
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <SoundProvider>
      <div className="app bg-black min-h-screen w-full text-white">
        {children || <Outlet />}
        {isAgeVerificationModalOpen && <AgeVerificationModal open={isAgeVerificationModalOpen} onClose={() => setIsAgeVerificationModalOpen(false)} onVerified={handleAgeVerification} />}
        {isVerified && isLoginModalOpen && <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={() => {}} />}
        <SonnerToaster position="top-center" richColors />
        <Toaster />
      </div>
    </SoundProvider>
  )
}

export default App
