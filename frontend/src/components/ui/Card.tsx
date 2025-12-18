import * as React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-6",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";
