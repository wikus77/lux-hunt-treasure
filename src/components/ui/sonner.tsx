
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Garantisco che la posizione sia sempre top-right
  // Questo assicura che le notifiche appaiano solo in questa posizione
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors={false}
      closeButton={false}
      duration={4000}
      expand={false}
      visibleToasts={3}
      offset={0}
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
          padding: '12px 32px',
          minHeight: '50px',
          width: 'min(92vw, 420px)',  // Più largo e rettangolare
          maxWidth: '420px',
          fontWeight: '500',
          letterSpacing: '0.025em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          // Posizionamento fisso centrato
          position: 'fixed' as const,
          top: 'calc(env(safe-area-inset-top, 47px) + 20px)',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '0',
          // Riattivo l'animazione di discesa dall'alto
          animation: 'toast-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transition: 'all 0.3s ease'
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
