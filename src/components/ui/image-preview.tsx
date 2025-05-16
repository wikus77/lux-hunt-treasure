
import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "./dialog";
import { motion } from "framer-motion";

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  imageUrl,
  alt = "Image preview"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[60vw] max-w-[90vw] p-1 bg-black/80 border border-cyan-500/30 rounded-xl shadow-lg">
        <div className="relative">
          <button
            className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1.5 text-white/80 hover:bg-black/70 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.img 
            src={imageUrl} 
            alt={alt}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-auto rounded-lg object-contain max-h-[80vh]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;
