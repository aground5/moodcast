import { motion, AnimatePresence } from 'framer-motion';

interface LocationSlotMachineProps {
    text: string;
    className?: string;
}

export function LocationSlotMachine({ text, className = "" }: LocationSlotMachineProps) {
    return (
        <span className={`inline-grid overflow-hidden align-bottom relative vertical-align-text-bottom ${className}`}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={text}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{
                        // "Chewy" slot machine effect
                        // Slow start (tension), fast snap action
                        y: { type: "spring", stiffness: 280, damping: 18, mass: 0.3 },
                        opacity: { duration: 0.2 }
                    }}
                    className="col-start-1 row-start-1 whitespace-nowrap text-center"
                >
                    {text}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
