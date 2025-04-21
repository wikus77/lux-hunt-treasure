
import { Instagram, Facebook, Twitter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Footer = () => {
  const isMobile = useIsMobile();
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <footer className="border-t py-6 px-4 mt-auto transition-colors duration-200 bg-black">
      <div className="container mx-auto max-w-7xl">
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-8`}>
          {/* Company Info */}
          <div>
            <h3 className="font-sans font-semibold mb-4 text-white">ProjectX</h3>
            <p className="text-sm text-gray-400">
              La tua piattaforma per scoprire indizi ed eventi esclusivi.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold mb-4 text-white">Link Utili</h4>
            <ul className="space-y-2">
              <li>
                <a href="/events" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Eventi
                </a>
              </li>
              <li>
                <a href="/subscriptions" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Abbonamenti
                </a>
              </li>
              <li>
                <a href="/buzz" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Buzz
                </a>
              </li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h4 className="font-sans font-semibold mb-4 text-white">Seguici</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-6 pt-6 text-center border-gray-800">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ProjectX. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
