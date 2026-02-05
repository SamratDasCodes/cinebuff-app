import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, HTMLMotionProps } from "framer-motion";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard = ({
    children,
    className,
    hoverEffect = false,
    ...props
}: GlassCardProps) => {
    return (
        <motion.div
            className={cn(
                "rounded-xl border border-black/10 bg-white/40 backdrop-blur-md shadow-sm",
                "bg-white/70 backdrop-blur-md border border-black/5 shadow-sm",
                hoverEffect && "hover:bg-white/90 hover:shadow-md hover:scale-[1.02] transition-all duration-300",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
