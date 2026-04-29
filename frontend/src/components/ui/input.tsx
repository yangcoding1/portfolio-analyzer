import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        // 글래스모피즘 다크 인풋 — 흰색 덩어리 문제 해결
        "flex h-10 w-full rounded-xl px-3 py-2 text-sm",
        "bg-slate-900/50 border border-slate-700/30",
        "text-slate-100 placeholder:text-slate-600",
        "transition-all duration-200",
        "focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/30",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
