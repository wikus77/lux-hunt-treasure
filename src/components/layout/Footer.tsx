
import { Instagram, Facebook, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-projectx-neon-blue font-bold mb-4">ProjectX</h3>
            <p className="text-sm text-gray-400">
              La tua piattaforma per scoprire indizi ed eventi esclusivi.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-projectx-neon-blue font-bold mb-4">Link Utili</h4>
            <ul className="space-y-2">
              <li><a href="/events" className="text-sm text-gray-400 hover:text-white">Eventi</a></li>
              <li><a href="/subscriptions" className="text-sm text-gray-400 hover:text-white">Abbonamenti</a></li>
              <li><a href="/buzz" className="text-sm text-gray-400 hover:text-white">Buzz</a></li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h4 className="text-projectx-neon-blue font-bold mb-4">Seguici</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-projectx-pink">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-projectx-pink">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-projectx-pink">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ProjectX. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
