
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

const shareLinks = [
  {
    name: "WhatsApp",
    url: "https://wa.me/?text=Unisciti%20a%20M1SSION%20e%20ricevi%20indizi%20esclusivi!%20Scarica%20l%27app:%20https://m1ssion.app",
    color: "bg-green-500",
    icon: "/lovable-uploads/6ec76f7f-0e83-4005-8fb0-582ba83a7d60.png"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/?url=https://m1ssion.app",
    color: "bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-600",
    icon: "/lovable-uploads/f6438a3c-d978-47ff-b010-4fd09dc9cc28.png"
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/sharer/sharer.php?u=https://m1ssion.app",
    color: "bg-blue-700",
    icon: "/lovable-uploads/cab356af-f03b-4b55-b5b3-ffc66c25841c.png"
  },
  {
    name: "X / Twitter",
    url: "https://twitter.com/intent/tweet?text=Unisciti%20a%20M1SSION%20e%20sfida%20i%20tuoi%20amici%20%F0%9F%9A%80%20https://m1ssion.app",
    color: "bg-black",
    icon: "/lovable-uploads/42b25071-8e68-4f8e-8897-06a6b2bdb8f4.png"
  },
  {
    name: "App Store",
    url: "https://apps.apple.com/app/id6463938860",
    color: "bg-gradient-to-r from-gray-300 to-black",
    icon: "/lovable-uploads/7f787e38-d579-4b24-8a57-1ede818cdca3.png"
  },
  {
    name: "Google Play",
    url: "https://play.google.com/store/apps/details?id=app.m1ssion",
    color: "bg-gradient-to-r from-yellow-400 to-green-500",
    icon: "/lovable-uploads/ef2d64e7-7d7c-4753-9cbd-6208544255d5.png"
  }
];

export default function InviteFriendSection() {
  return (
    <section className="relative w-full flex flex-col items-center py-8 px-4 mt-6">
      <motion.div
        className="glass-card backdrop-blur-xl border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-900/30 via-black/30 to-yellow-700/10 max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-yellow-400 neon-text-yellow font-orbitron text-xl font-bold mb-1 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-yellow-400" /> Invita un amico
        </h3>
        <p className="text-white/80 mb-6 text-base">
          <span className="font-semibold text-yellow-300">Invita un amico e ricevi indizi esclusivi!</span>
          <br />
          Solo tramite invito potrai accedere a segreti non accessibili in altro modo.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {shareLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white hover:scale-110 ${link.color} transition-transform duration-200 shadow-xl press-effect glass-card`}
            >
              <img src={link.icon} alt={link.name} className="h-6 w-6" />
              {link.name}
            </a>
          ))}
        </div>
        <div className="flex mt-6 flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-xs text-yellow-100/80 italic">Scarica o invita direttamente dai link!</span>
        </div>
      </motion.div>
    </section>
  );
}
