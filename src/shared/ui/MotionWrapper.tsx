"use client";

import { motion, AnimatePresence } from "framer-motion";

type MotionWrapperProps = {
    children: React.ReactNode;
    className?: string;
    delay?: number;
};

export const FadeIn = ({ children, className, delay = 0 }: MotionWrapperProps) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

export const ScaleIn = ({ children, className, delay = 0 }: MotionWrapperProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay, ease: "backOut" }}
        className={className}
    >
        {children}
    </motion.div>
);
