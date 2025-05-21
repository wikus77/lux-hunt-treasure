
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-hover-effect",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF] text-white hover:shadow-[0_0_15px_rgba(0,209,255,0.5)] hover:scale-[1.03]",
        destructive: "bg-gradient-to-r from-red-500 to-red-700 text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-[1.03]",
        outline: "border border-[#00D1FF]/30 hover:border-[#00D1FF]/70 bg-black/30 hover:bg-black/50 text-white",
        secondary: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:scale-[1.03]",
        ghost: "hover:bg-white/10 hover:text-[#00D1FF] text-white",
        link: "text-[#00D1FF] underline-offset-4 hover:underline hover:brightness-125",
        accent: "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:scale-[1.03]",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-full",
        sm: "h-9 rounded-full px-4",
        lg: "h-11 rounded-full px-8",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
