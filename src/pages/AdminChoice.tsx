import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AdminChoice: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Garantir que só admins acessem essa tela
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(to bottom right, #002147, #011123)'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom right, rgba(0, 33, 71, 0.3), rgba(1, 17, 35, 0.3))'
        }}
      ></div>
      
      <div className="relative z-10 w-full max-w-3xl px-4">
        {/* Informação sobre múltiplas abas */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-8 text-center">
          <div className="flex items-center justify-center text-white mb-2">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-semibold">Nova Funcionalidade Ativada!</span>
          </div>
          <p className="text-white/90 text-sm">
            ✨ Agora você pode abrir múltiplas abas simultaneamente! Trabalhe no admin e visualize vídeos ao mesmo tempo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card: Página Inicial com poderes admin */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Acessar Página Inicial (Admin)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center">
            <p className="text-gray-600 text-center">Você terá poderes administrativos (excluir comentários, gerenciar conteúdos, etc) na página inicial.</p>
            <Button 
              className="w-full min-h-[48px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-blue-200" 
              onClick={() => navigate('/')}
            >
              Ir para Página Inicial
            </Button>
          </CardContent>
        </Card>
        
        {/* Card: Área Administrativa */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Acessar Área Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center">
            <p className="text-gray-600 text-center">Gerencie usuários, vídeos, categorias, tags e mais.</p>
            <Button 
              className="w-full min-h-[48px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-blue-200" 
              onClick={() => navigate('/admin')}
            >
              Ir para Área Administrativa
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChoice; 