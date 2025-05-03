
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Forza il tema scuro immediatamente
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = "#000";
    document.body.style.backgroundColor = "#000";
    document.body.style.color = "#fff";
  }, []);
  
  return (
    <NextThemesProvider {...props} defaultTheme="dark" forcedTheme="dark">
      {children}
    </NextThemesProvider>
  );
}
