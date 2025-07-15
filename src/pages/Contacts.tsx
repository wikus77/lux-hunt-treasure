
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContactLayout from "@/components/contacts/ContactLayout";

const Contacts = () => {
  const navigate = useNavigate();
  const isBeforeLaunch = new Date() < new Date("2025-07-19T00:00:00");

  // Log component mounting to help debug routing issues
  useEffect(() => {
    console.log("Contacts page mounted");
    return () => {
      console.log("Contacts page unmounted");
    };
  }, []);

  // If we're before launch and the user tries to navigate to a restricted page, redirect them
  useEffect(() => {
    if (isBeforeLaunch) {
      // Listen for history changes to prevent navigation
      const handlePopState = () => {
        // If they try to navigate away using browser history, push them back to contacts
        if (window.location.pathname !== "/contact") {
          navigate("/contact");
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isBeforeLaunch, navigate]);

  console.log("Contacts page rendering");

  return <ContactLayout isBeforeLaunch={isBeforeLaunch} />;
};

export default Contacts;
