
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useEffect } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Swipe-up gesture handler for toast dismissal
  useEffect(() => {
    let touchStartY = 0
    let touchStartTime = 0
    let currentToast: HTMLElement | null = null
    let isDragging = false

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const toastElement = target.closest('[data-sonner-toast]') as HTMLElement
      if (!toastElement) return

      currentToast = toastElement
      touchStartY = e.touches[0].clientY
      touchStartTime = Date.now()
      isDragging = false
      
      // Add swiping class to disable transitions during gesture
      toastElement.classList.add('toast-swiping')
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!currentToast) return

      const deltaY = e.touches[0].clientY - touchStartY
      
      // Only handle upward swipes (negative deltaY)
      if (deltaY < 0) {
        e.preventDefault() // Prevent page scroll
        isDragging = true
        
        // Clamp movement to max -80px and apply visual feedback
        const clampedDelta = Math.max(deltaY, -80)
        const opacity = Math.max(0.2, 1 + (clampedDelta / 80) * 0.8)
        
        currentToast.style.transform = `translateY(${clampedDelta}px)`
        currentToast.style.opacity = opacity.toString()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!currentToast) return

      const deltaY = e.changedTouches[0].clientY - touchStartY
      const deltaTime = Date.now() - touchStartTime
      const velocity = Math.abs(deltaY) / deltaTime // px/ms

      // Remove swiping class
      currentToast.classList.remove('toast-swiping')

      // Check dismiss thresholds
      const shouldDismiss = (Math.abs(deltaY) >= 32 && deltaY < 0) || (velocity >= 0.35 && deltaY < 0)

      if (shouldDismiss && isDragging) {
        // Trigger dismiss animation
        currentToast.style.transform = 'translateY(-80px)'
        currentToast.style.opacity = '0'
        
        // Find and click the close button or trigger sonner's dismiss
        const dismissButton = currentToast.querySelector('[data-close-button]') as HTMLElement
        if (dismissButton) {
          dismissButton.click()
        } else {
          // Fallback: set data-removed attribute to trigger exit animation
          currentToast.setAttribute('data-removed', 'true')
          setTimeout(() => {
            currentToast?.remove()
          }, 320)
        }
      } else if (isDragging) {
        // Snap back to original position
        currentToast.classList.add('toast-snap-back')
        currentToast.style.transform = 'translateY(0)'
        currentToast.style.opacity = '1'
        
        setTimeout(() => {
          currentToast?.classList.remove('toast-snap-back')
        }, 320)
      }

      currentToast = null
      isDragging = false
    }

    // Add touch event listeners
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
