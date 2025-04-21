
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface BriefProfileModalProps {
  open: boolean;
  onClose: () => void;
  profileImage?: string | null;
}

const BriefProfileModal = ({ open, onClose, profileImage }: BriefProfileModalProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("Mario Rossi");
  const [bio, setBio] = useState("");
  
  // Load profile data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('profileName');
    if (savedName) {
      setName(savedName);
    }
    
    const savedBio = localStorage.getItem('profileBio');
    if (savedBio) {
      setBio(savedBio);
    }
  }, [open]);

  const goToProfile = () => {
    onClose();
    navigate("/profile");
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black border border-projectx-deep-blue p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-2 right-2">
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-col items-center mt-4 mb-6">
                  <Avatar className="w-20 h-20 border-2 border-projectx-neon-blue">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt={name} />
                    ) : (
                      <AvatarFallback className="bg-projectx-deep-blue">
                        <User className="h-10 w-10 text-projectx-neon-blue" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <h3 className="text-xl font-bold mt-4">{name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Membro dal 19 Aprile 2025</p>
                  
                  {bio && (
                    <p className="text-sm mt-4 text-center text-muted-foreground">
                      {bio}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    className="w-full bg-projectx-neon-blue hover:bg-projectx-pink transition-colors"
                    onClick={goToProfile}
                  >
                    Vai al profilo completo
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BriefProfileModal;
