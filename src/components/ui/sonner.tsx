
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Perfect horizontal centering for iOS PWA with slide animations and swipe dismiss
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors={false}
      closeButton={false}
      duration={3000}
      expand={false}
      visibleToasts={3}
      offset={0}
      style={{
        // Force perfect horizontal centering for iOS PWA
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        width: 'auto',
        maxWidth: 'min(92vw, 640px)',
        paddingInline: 'calc(16px + env(safe-area-inset-left, 0px)) calc(16px + env(safe-area-inset-right, 0px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        zIndex: 9999,
      } as React.CSSProperties}
      toastOptions={{
        style: {
          background: 'rgba(0, 12, 24, 0.95)',
          color: 'white',
          border: '1px solid rgba(0, 209, 255, 0.5)',
          borderRadius: '20px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 12px 40px rgba(0, 209, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(0, 209, 255, 0.2)',
          fontFamily: 'Orbitron, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '15px',
          padding: '14px 40px',
          minHeight: '48px',
          width: '450px',
          maxWidth: 'min(92vw, 420px)',
          fontWeight: '500',
          letterSpacing: '0.025em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          textAlign: 'center' as const,
          pointerEvents: 'auto',
          // Custom slide-down animation
          transform: 'translateY(-24px)',
          opacity: 0,
          animation: 'toast-slide-down 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        },
        classNames: {
          toast: "group toast custom-toast-animation",
          description: "group-[.toast]:text-white/80",
          actionButton: "group-[.toast]:bg-cyan-500 group-[.toast]:text-black",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        unstyled: false
      }}
      {...props}
    />
  )
}

// Export the connected toast function from sonner
import { toast } from "sonner"
export { Toaster, toast }
