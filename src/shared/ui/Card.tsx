import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'glass' | 'solid';
}

export function Card({ children, className, variant = 'glass', ...props }: CardProps) {
    return (
        <div
            className={twMerge(
                clsx(
                    'rounded-2xl p-6 transition-all duration-300',
                    variant === 'glass' && 'glass-card',
                    variant === 'solid' && 'bg-white shadow-lg border border-gray-100',
                    className
                )
            )}
            {...props}
        >
            {children}
        </div>
    );
}
