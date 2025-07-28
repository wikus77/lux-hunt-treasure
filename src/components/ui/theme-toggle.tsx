// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full p-0 hover:bg-white/10"
      aria-label={`Passa al tema ${theme === 'light' ? 'scuro' : 'chiaro'}`}
      role="switch"
      aria-checked={theme === 'light'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-5 h-5"
      >
        {theme === 'light' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-blue-400" />
        )}
      </motion.div>
    </Button>
  );
}