
import { Facebook, X, Instagram, Linkedin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareButtonsProps {
  title?: string;
  description?: string;
  url?: string;
  className?: string;
}

export function SocialShareButtons({
  title = "Mystery Hunt App",
  description = "Check out this amazing mystery hunt app!",
  url = window.location.href,
  className = "",
}: SocialShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: url,
      }).catch(err => {
        console.error("Error sharing:", err);
        toast("Errore", {
          description: "Non è stato possibile condividere il contenuto",
        });
      });
    } else {
      toast("Condivisione", {
        description: "Usa i pulsanti social per condividere",
      });
    }
  };

  const handleWhatsAppShare = () => {
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('share_whatsapp');
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-[#3b5998]/10 text-[#3b5998] rounded-full press-effect w-8 h-8"
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`, '_blank')}
      >
        <Facebook className="h-4 w-4" />
        <span className="sr-only">Share on Facebook</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-black/10 text-black rounded-full press-effect w-8 h-8"
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')}
      >
        <X className="h-4 w-4" color="#FFFFFF" strokeWidth={2.75} />
        <span className="sr-only">Share on X</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-[#25D366]/10 text-[#25D366] rounded-full press-effect w-8 h-8"
        onClick={handleWhatsAppShare}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
        <span className="sr-only">Share on WhatsApp</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-[#E1306C]/10 text-[#E1306C] rounded-full press-effect w-8 h-8"
        onClick={() => {
          toast("Instagram", {
            description: "Apri Instagram e condividi nelle tue storie",
          });
        }}
      >
        <Instagram className="h-4 w-4" />
        <span className="sr-only">Share on Instagram</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-[#0077B5]/10 text-[#0077B5] rounded-full press-effect w-8 h-8"
        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')}
      >
        <Linkedin className="h-4 w-4" />
        <span className="sr-only">Share on LinkedIn</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-black/10 text-black rounded-full press-effect w-8 h-8"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Share</span>
      </Button>
    </div>
  );
}
