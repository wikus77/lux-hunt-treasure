
import { Instagram, Facebook, Twitter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Footer = () => {
  const isMobile = useIsMobile();
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <footer className="border-t py-6 px-4 mt-auto transition-colors duration-200">
      <div className="container mx-auto max-w-7xl">
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-8`}>
          {/* Company Info */}
          <div>
            <h3 className="font-sans font-semibold mb-4">ProjectX</h3>
            <p className="text-sm dark:text-gray-400 light:text-gray-600">
              La tua piattaforma per scoprire indizi ed eventi esclusivi.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold mb-4">Link Utili</h4>
            <ul className="space-y-2">
              <li>
                <a href="/events" className="text-sm dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-800 transition-colors">
                  Eventi
                </a>
              </li>
              <li>
                <a href="/subscriptions" className="text-sm dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-800 transition-colors">
                  Abbonamenti
                </a>
              </li>
              <li>
                <a href="/buzz" className="text-sm dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-800 transition-colors">
                  Buzz
                </a>
              </li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h4 className="font-sans font-semibold mb-4">Seguici</h4>
            <div className="flex space-x-4">
              <a href="#" className="dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-800 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-800 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-800 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-6 pt-6 text-center dark:border-gray-800 light:border-gray-200">
          <p className="text-sm dark:text-gray-400 light:text-gray-600">
            © {new Date().getFullYear()} ProjectX. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
