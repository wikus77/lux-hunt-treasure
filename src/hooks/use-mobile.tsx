
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check immediately on mount
    checkIsMobile()
    
    // Then add listener to window resize
    window.addEventListener("resize", checkIsMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Return true or false (with default fallback to false if undefined during SSR)
  return isMobile ?? false
}
