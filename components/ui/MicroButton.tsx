import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, HTMLMotionProps } from "framer-motion";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MicroButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "xs" | "sm" | "md";
}

export const MicroButton = forwardRef<HTMLButtonElement, MicroButtonProps>(
    ({ className, variant = "primary", size = "sm", children, ...props }, ref) => {
        const variants = {
            primary: "bg-black text-white hover:bg-neutral-800 border-transparent",
            secondary: "bg-black/5 text-black hover:bg-black/10 border-transparent",
            ghost: "hover:bg-black/5 text-gray-600 hover:text-black border-transparent",
            outline: "border-black/20 text-gray-600 hover:border-black/50 hover:text-black bg-transparent",
        };

        const sizes = {
            xs: "px-2 py-0.5 text-xs",
            sm: "px-3 py-1 text-xs",
            md: "px-4 py-1.5 text-sm",
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-sans font-medium transition-colors border",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

MicroButton.displayName = "MicroButton";
