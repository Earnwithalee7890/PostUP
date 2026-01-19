import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * A primitive Badge component for status tags.
 */
const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}) => {
    const baseStyles = 'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    const variants = {
        default: 'border-transparent bg-violet-600/20 text-violet-400',
        secondary: 'border-transparent bg-zinc-800 text-zinc-400',
        outline: 'border-zinc-700 text-zinc-400 bg-transparent',
        success: 'border-transparent bg-emerald-500/10 text-emerald-500',
        warning: 'border-transparent bg-amber-500/10 text-amber-500',
        error: 'border-transparent bg-red-500/10 text-red-500',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </div>
    );
};

export default Badge;
