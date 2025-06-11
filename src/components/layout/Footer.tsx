
import { Instagram, Facebook, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

export const Footer = () => {
  const isMobile = useIsMobile();
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <footer className="border-t py-6 px-4 mt-auto transition-colors duration-200 bg-black">
      <div className="container mx-auto max-w-7xl">
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-8`}>
          {/* Company Info */}
          <div>
            <h3 className="font-sans font-semibold mb-4 text-white">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </h3>
            <p className="text-sm text-gray-400">
              La tua piattaforma per scoprire indizi ed eventi esclusivi.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold mb-4 text-white">Link Utili</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Eventi
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Abbonamenti
                </Link>
              </li>
              <li>
                <Link to="/buzz" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Buzz
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h4 className="font-sans font-semibold mb-4 text-white">Seguici</h4>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-6 pt-6 text-center border-gray-800">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
