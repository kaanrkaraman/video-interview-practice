import * as React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95";

        const variants = {
            primary: "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10",
            secondary: "bg-surface border border-white/10 text-white hover:bg-white/10",
            outline: "border-2 border-white/20 bg-transparent hover:bg-white/5 text-white",
            ghost: "hover:bg-white/5 text-secondary hover:text-white",
            danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm",
            md: "h-11 px-8 text-base",
            lg: "h-14 px-10 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
