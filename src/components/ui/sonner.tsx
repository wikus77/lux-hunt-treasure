
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
      duration={2800}
      expand={false}
      visibleToasts={1}
      offset={0}
      dir="ltr"
      style={{
        // Force perfect horizontal centering for iOS PWA
        position: 'fixed',
        left: '50%',
        transform: 'translate3d(-50%, 0, 0)',
        top: 'max(12px, calc(env(safe-area-inset-top, 0px) + 8px))',
        width: '100%',
        maxWidth: '480px',
        paddingInline: 'calc(16px + env(safe-area-inset-left, 0px)) calc(16px + env(safe-area-inset-right, 0px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        zIndex: 2140,
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
          padding: '14px 40px',  // Più largo orizzontalmente, meno alto
          minHeight: '48px',     // Ridotto per renderlo più rettangolare
          width: '450px',        // Larghezza fissa più ampia
          maxWidth: 'min(92vw, 420px)', // Responsive but maintains appearance
          fontWeight: '500',
          letterSpacing: '0.025em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          textAlign: 'center' as const,
          pointerEvents: 'auto', // Enable clicks on individual toasts
        },
        classNames: {
          toast: "group toast",
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
