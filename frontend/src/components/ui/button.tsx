import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "text-white shadow-btn",
        outline:
          "border border-slate-700/40 bg-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-600/60 hover:text-slate-100",
        ghost:
          "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
        destructive:
          "bg-rose-950/60 text-rose-400 border border-rose-800/40 hover:bg-rose-900/60",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-12 px-8 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, style, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      style={
        variant === "default" || variant === undefined
          ? {
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              ...style,
            }
          : style
      }
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
