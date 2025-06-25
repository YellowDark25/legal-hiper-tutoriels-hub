import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="flex flex-col items-center space-y-2">
          <div 
            className={cn(
              'animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500',
              sizeClasses[size]
            )}
          />
          {text && (
            <span className={cn('text-gray-400 font-medium', textSizeClasses[size])}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    const dotSizeClasses = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3'
    };

    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="flex flex-col items-center space-y-3">
          <div className="flex space-x-1">
            <div 
              className={cn(
                'bg-orange-500 rounded-full animate-bounce',
                dotSizeClasses[size]
              )}
              style={{ animationDelay: '0s', animationDuration: '1.4s' }}
            />
            <div 
              className={cn(
                'bg-orange-500 rounded-full animate-bounce',
                dotSizeClasses[size]
              )}
              style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
            />
            <div 
              className={cn(
                'bg-orange-500 rounded-full animate-bounce',
                dotSizeClasses[size]
              )}
              style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
            />
          </div>
          {text && (
            <span className={cn('text-gray-400 font-medium', textSizeClasses[size])}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="flex flex-col items-center space-y-2">
          <div 
            className={cn(
              'bg-orange-500 rounded-full animate-pulse',
              sizeClasses[size]
            )}
          />
          {text && (
            <span className={cn('text-gray-400 font-medium animate-pulse', textSizeClasses[size])}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export { Loading }; 