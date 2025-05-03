
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CountdownContainerProps {
  children: ReactNode;
  pulseTrigger: boolean;
}

export default function CountdownContainer({ children, pulseTrigger }: CountdownContainerProps) {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Hologram effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)",
            filter: "blur(8px)"
          }}>
        </div>
      </div>

      {/* Main countdown container */}
      <div className={cn(
        "bg-black/40 backdrop-blur-lg rounded-xl px-4 py-6 md:p-8", 
        "border border-purple-500/30",
        "flex flex-col items-center justify-center",
        "relative overflow-hidden"
      )}
      style={{
        background: "linear-gradient(160deg, rgba(0,0,0,0.9) 0%, rgba(76, 29, 149, 0.1) 100%)",
        boxShadow: pulseTrigger 
          ? "0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)" 
          : "0 0 20px rgba(124, 58, 237, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)"
      }}>
        {/* Glowing lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
        
        {/* Moving light beam */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="absolute h-full w-[100px] skew-x-12 -left-32 top-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-[lineMove_4s_linear_infinite]"></div>
        </div>

        {children}
      </div>

      {/* Circuit board patterns */}
      <div className="absolute inset-0 -z-20 opacity-10">
        <div className="w-full h-full" 
          style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "30px 30px",
          }}
        />
      </div>
    </div>
  );
}
