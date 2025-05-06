
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, MessageSquare, Phone, Mail as MailIcon, Instagram, Facebook, Twitter } from "lucide-react";

export const InviteFriendSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const shareMessage = "Ho appena scoperto M1SSION, un'esperienza di caccia al tesoro unica che mi ha incuriosito molto. Unisciti a me! https://m1ssion.com?ref=friend";
  
  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };
  
  const shareViaSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank');
  };
  
  const shareViaEmail = () => {
    window.open(`mailto:?subject=Unisciti a me su M1SSION&body=${encodeURIComponent(shareMessage)}`, '_blank');
  };
  
  const shareViaInstagram = () => {
    // For Instagram, we can only open the app and let user manually share
    window.open('https://instagram.com', '_blank');
  };
  
  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://m1ssion.com?ref=friend')}`, '_blank');
  };
  
  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };
  
  return (
    <>
      <section className="w-full py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-lg py-6 px-8 rounded-full hover:shadow-lg transition-all duration-300"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Invita un Amico
          </Button>
        </div>
      </section>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="gradient-text-cyan text-xl">Condividi M1SSION</DialogTitle>
            <DialogDescription className="text-white/70">
              Invita i tuoi amici a unirsi all'avventura M1SSION e guadagna crediti bonus quando si registrano!
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30"
              onClick={shareViaWhatsApp}
            >
              <MessageSquare className="h-5 w-5 text-green-500" />
              <span>WhatsApp</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30"
              onClick={shareViaSMS}
            >
              <Phone className="h-5 w-5 text-blue-500" />
              <span>SMS</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30"
              onClick={shareViaEmail}
            >
              <MailIcon className="h-5 w-5 text-red-500" />
              <span>Email</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-600/30"
              onClick={shareViaInstagram}
            >
              <Instagram className="h-5 w-5 text-pink-500" />
              <span>Instagram</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-blue-700/20 hover:bg-blue-700/30 border border-blue-700/30"
              onClick={shareViaFacebook}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span>Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-600/30"
              onClick={shareViaTwitter}
            >
              <Twitter className="h-5 w-5 text-sky-500" />
              <span>Twitter</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
