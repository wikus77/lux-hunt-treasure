
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useEffect, useRef } from "react"
import { toastDebug } from "@/utils/toastDebug"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const gestureRef = useRef<{
    startY: number;
    startTime: number;
    currentToast: HTMLElement | null;
    isDragging: boolean;
    timerId?: number;
  }>({ startY: 0, startTime: 0, currentToast: null, isDragging: false })

  // Enhanced swipe-up gesture handler for PWA iOS
  useEffect(() => {
    const gesture = gestureRef.current

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const toastElement = target.closest('[data-sonner-toast]') as HTMLElement
      if (!toastElement) return

      gesture.currentToast = toastElement
      gesture.startY = e.touches[0].clientY
      gesture.startTime = Date.now()
      gesture.isDragging = false
      
      // Debug tracking
      toastDebug.trackGesture(toastElement.id || 'unknown', {
        startY: gesture.startY,
        currentY: gesture.startY,
        isDragging: false
      })
      
      // Add swiping class to disable animations during gesture
      toastElement.classList.add('toast-swiping')
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!gesture.currentToast) return

      const deltaY = e.touches[0].clientY - gesture.startY
      
      // Only handle upward swipes (negative deltaY)
      if (deltaY < 0) {
        e.preventDefault() // Critical: prevent page scroll
        gesture.isDragging = true
        
        // Clamp movement to max -80px and apply visual feedback
        const clampedDelta = Math.max(deltaY, -80)
        const opacity = Math.max(0.2, 1 + (clampedDelta / 80) * 0.8)
        
        gesture.currentToast.style.transform = `translateY(${clampedDelta}px)`
        gesture.currentToast.style.opacity = opacity.toString()
        
        // Debug tracking
        toastDebug.trackGesture(gesture.currentToast.id || 'unknown', {
          startY: gesture.startY,
          currentY: e.touches[0].clientY,
          isDragging: true
        })
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gesture.currentToast) return

      const deltaY = e.changedTouches[0].clientY - gesture.startY
      const deltaTime = Date.now() - gesture.startTime
      const velocity = Math.abs(deltaY) / deltaTime // px/ms

      // Remove swiping class
      gesture.currentToast.classList.remove('toast-swiping')

      // Check dismiss thresholds: |deltaY| >= 32px OR velocity >= 0.35 px/ms
      const shouldDismiss = (Math.abs(deltaY) >= 32 && deltaY < 0) || (velocity >= 0.35 && deltaY < 0)

      if (shouldDismiss && gesture.isDragging) {
        // CRITICAL: Trigger proper exit animation
        gesture.currentToast.setAttribute('data-removed', 'true')
        toastDebug.trackToast(gesture.currentToast.id || 'unknown', 'exiting')
        
        // Let CSS animation handle the exit
        setTimeout(() => {
          gesture.currentToast?.remove()
        }, 320) // Match animation duration
      } else if (gesture.isDragging) {
        // Snap back to original position
        gesture.currentToast.classList.add('toast-snap-back')
        gesture.currentToast.style.transform = ''
        gesture.currentToast.style.opacity = ''
        
        setTimeout(() => {
          gesture.currentToast?.classList.remove('toast-snap-back')
        }, 320)
      }

      // Reset gesture state
      gesture.currentToast = null
      gesture.isDragging = false
    }

    // Add touch event listeners with passive: false for preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors={false}
      closeButton={false}
      duration={3000} // 3 seconds as requested
      expand={false}
      visibleToasts={3}
      offset={0} // Remove offset since we handle positioning in CSS
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
        },
        classNames: {
          toast: "toast-centered",
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
