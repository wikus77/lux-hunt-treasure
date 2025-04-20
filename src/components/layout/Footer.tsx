
import { Instagram, Facebook, Twitter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Footer = () => {
  const isMobile = useIsMobile();
  
  return (
    <footer className="transition-colors duration-200 border-t border-gray-200 py-6 px-4 mt-auto backdrop-blur-xl bg-white/80 dark:bg-black/80 dark:border-gray-800">
      <div className="container mx-auto max-w-7xl">
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-8`}>
          {/* Company Info */}
          <div>
            <h3 className="font-sans font-semibold text-gray-800 dark:text-white mb-4">ProjectX</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La tua piattaforma per scoprire indizi ed eventi esclusivi.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-gray-800 dark:text-white mb-4">Link Utili</h4>
            <ul className="space-y-2">
              <li>
                <a href="/events" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Eventi
                </a>
              </li>
              <li>
                <a href="/subscriptions" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Abbonamenti
                </a>
              </li>
              <li>
                <a href="/buzz" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Buzz
                </a>
              </li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h4 className="font-sans font-semibold text-gray-800 dark:text-white mb-4">Seguici</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} ProjectX. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
