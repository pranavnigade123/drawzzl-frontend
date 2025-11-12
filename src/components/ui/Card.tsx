import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered';
}

export default function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-white/5 backdrop-blur-sm',
    glass: 'bg-white/10 backdrop-blur-md',
    bordered: 'bg-white/5 border-2 border-white/20',
  };

  return (
    <div
      className={`rounded-2xl border border-white/10 p-6 shadow-xl ${variants[variant]} ${className} animate-fade-in`}
    >
      {children}
    </div>
  );
}
