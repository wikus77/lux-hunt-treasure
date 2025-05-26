
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ContactFooter = () => {
  return (
    <div className="py-8 px-4 border-t border-white/10 bg-black/80 backdrop-blur">
      <div className="max-w-4xl mx-auto text-center">
        <Link to="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
          </Button>
        </Link>
        <p className="text-sm text-white/50 mt-4">
          © {new Date().getFullYear()} M1SSION<span className="text-xs align-top">™</span>. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
};

export default ContactFooter;
