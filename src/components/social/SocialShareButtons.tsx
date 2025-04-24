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
