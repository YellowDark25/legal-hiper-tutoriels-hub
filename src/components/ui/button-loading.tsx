import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent opacity-70',
        sizeClasses[size],
        className
      )}
    />
  );
};

export { ButtonLoading }; 