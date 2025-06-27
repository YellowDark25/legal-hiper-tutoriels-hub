import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo com Efeito Glow */}
        <div className="relative">
          <img 
            src="/logo-nexsyn-CLVIoj6u.png" 
            alt="NexHub Logo" 
            className="h-20 w-auto animate-pulse"
            style={{ 
              maxWidth: 'none',
              objectFit: 'contain'
            }}
            loading="eager"
          />
          {/* Glow effect atrás da logo */}
          <div className="absolute inset-0 -z-10 bg-orange-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
        </div>

        {/* Dots Animados */}
        <div className="flex space-x-2">
          <div 
            className="w-3 h-3 bg-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-500/50" 
            style={{ animationDelay: '0s', animationDuration: '1.4s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-500/50" 
            style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-500/50" 
            style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 