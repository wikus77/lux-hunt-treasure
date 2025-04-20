
import { Instagram, Facebook, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black/60 backdrop-blur-lg border-t border-white/10 py-6 px-4 mt-auto">
      <div className="container mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white/90 font-medium mb-4">ProjectX</h3>
            <p className="text-sm text-white/60">
              La tua piattaforma per scoprire indizi ed eventi esclusivi.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white/90 font-medium mb-4">Link Utili</h4>
            <ul className="space-y-2">
              <li>
                <a href="/events" className="text-sm text-white/60 hover:text-white transition-colors">
                  Eventi
                </a>
              </li>
              <li>
                <a href="/subscriptions" className="text-sm text-white/60 hover:text-white transition-colors">
                  Abbonamenti
                </a>
              </li>
              <li>
                <a href="/buzz" className="text-sm text-white/60 hover:text-white transition-colors">
                  Buzz
                </a>
              </li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h4 className="text-white/90 font-medium mb-4">Seguici</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-6 pt-6 text-center">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} ProjectX. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
