
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CountdownContainerProps {
  children: ReactNode;
  pulseTrigger: boolean;
}

export default function CountdownContainer({ children, pulseTrigger }: CountdownContainerProps) {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* 3D Floating holographic effect */}
      <motion.div 
        className="absolute inset-0 -z-10"
        animate={{
          y: [0, -8, 0],
          rotateX: [0, 2, 0],
          rotateY: [0, -1, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(0, 229, 255, 0.3) 0%, rgba(124, 58, 237, 0.2) 40%, transparent 70%)",
            filter: "blur(15px)"
          }}>
        </div>
      </motion.div>

      {/* Main countdown container with 3D effect */}
      <motion.div 
        className={cn(
          "bg-black/40 backdrop-blur-lg rounded-xl px-4 py-6 md:p-8", 
          "border border-cyan-500/30",
          "flex flex-col items-center justify-center",
          "relative overflow-hidden"
        )}
        style={{
          background: "linear-gradient(165deg, rgba(29,5,84,0.8) 0%, rgba(0,30,60,0.6) 100%)",
          boxShadow: pulseTrigger 
            ? "0 0 30px rgba(0, 229, 255, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)" 
            : "0 0 20px rgba(0, 229, 255, 0.3), 0 0 40px rgba(124, 58, 237, 0.2)",
          transform: "perspective(1000px) rotateX(5deg)"
        }}
        animate={{
          boxShadow: pulseTrigger
            ? ["0 0 30px rgba(0, 229, 255, 0.5)", "0 0 60px rgba(0, 229, 255, 0.7)", "0 0 30px rgba(0, 229, 255, 0.5)"]
            : ["0 0 20px rgba(0, 229, 255, 0.3)", "0 0 40px rgba(0, 229, 255, 0.4)", "0 0 20px rgba(0, 229, 255, 0.3)"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Enhanced 3D Glowing lines */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(to right, transparent, rgba(0, 229, 255, 0.8), transparent)"
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(to right, transparent, rgba(124, 58, 237, 0.6), transparent)"
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Enhanced moving light beam */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute h-full w-[200px] skew-x-12 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
            animate={{
              left: ["-200px", "100%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* 3D floating effect for the entire container content */}
        <motion.div
          className="w-full"
          animate={{
            y: [0, -3, 0],
            rotateX: [0, 1, 0],
            rotateY: [0, -0.5, 0] 
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Enhanced 3D circuit board patterns */}
      <div className="absolute inset-0 -z-20 opacity-10">
        <motion.div 
          className="w-full h-full" 
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%2300E5FF' stroke-width='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Ambient 3D floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(0, 229, 255, 0.8)' : 'rgba(124, 58, 237, 0.8)',
              boxShadow: i % 2 === 0 
                ? '0 0 5px rgba(0, 229, 255, 0.8), 0 0 10px rgba(0, 229, 255, 0.5)' 
                : '0 0 5px rgba(124, 58, 237, 0.8), 0 0 10px rgba(124, 58, 237, 0.5)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse"
            }}
          />
        ))}
      </div>
    </div>
  );
}
