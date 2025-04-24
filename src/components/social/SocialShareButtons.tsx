
import { Facebook, Twitter, Instagram, Linkedin, Share2 } from "lucide-react";
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
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="bg-[#3b5998] hover:bg-[#3b5998]/80 text-white rounded-full press-effect"
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`, '_blank')}
      >
        <Facebook className="h-4 w-4" />
        <span className="sr-only">Share on Facebook</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white rounded-full press-effect"
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')}
      >
        <Twitter className="h-4 w-4" />
        <span className="sr-only">Share on Twitter</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="bg-gradient-to-r from-[#C13584] to-[#E1306C] hover:opacity-80 text-white rounded-full press-effect"
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
        variant="outline"
        size="icon"
        className="bg-[#0077B5] hover:bg-[#0077B5]/80 text-white rounded-full press-effect"
        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')}
      >
        <Linkedin className="h-4 w-4" />
        <span className="sr-only">Share on LinkedIn</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="bg-black/40 hover:bg-black/60 text-white rounded-full press-effect"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Share</span>
      </Button>
    </div>
  );
}
