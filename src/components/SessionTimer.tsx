
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Clock } from 'lucide-react';

const SessionTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutos em segundos
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }

    // Resetar o timer quando há atividade
    const resetTimer = () => {
      setTimeLeft(30 * 60); // 30 minutos
    };

    // Eventos que resetam o timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      clearInterval(interval);
    };
  }, [user, isAdmin]);

  // Não mostrar o timer se não for admin
  if (!user || !isAdmin) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 5 * 60; // Últimos 5 minutos

  return (
    <div className={`fixed bottom-4 right-4 bg-white border rounded-lg p-3 shadow-lg ${
      isWarning ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`}>
      <div className="flex items-center space-x-2">
        <Clock className={`w-4 h-4 ${isWarning ? 'text-red-600' : 'text-gray-600'}`} />
        <span className={`text-sm font-medium ${isWarning ? 'text-red-700' : 'text-gray-700'}`}>
          Sessão expira em: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      {isWarning && (
        <p className="text-xs text-red-600 mt-1">
          Sua sessão irá expirar em breve!
        </p>
      )}
    </div>
  );
};

export default SessionTimer;
