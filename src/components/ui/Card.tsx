import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered';
}

export default function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-[#1a1a1a]',
    glass: 'bg-[#1a1a1a]/80 backdrop-blur-sm',
    bordered: 'bg-[#1a1a1a] border-2 border-white/10',
  };

  return (
    <div
      className={`rounded-lg border border-white/10 p-6 shadow-2xl ${variants[variant]} ${className} animate-fade-in`}
    >
      {children}
    </div>
  );
}
