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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Card: Página Inicial com poderes admin */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Acessar Página Inicial (Admin)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center">
            <p className="text-gray-700 text-center">Você terá poderes administrativos (excluir comentários, gerenciar conteúdos, etc) na página inicial.</p>
            <Button className="w-full" onClick={() => navigate('/')}>Ir para Página Inicial</Button>
          </CardContent>
        </Card>
        {/* Card: Área Administrativa */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Acessar Área Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center">
            <p className="text-gray-700 text-center">Gerencie usuários, vídeos, categorias, tags e mais.</p>
            <Button className="w-full" onClick={() => navigate('/admin')}>Ir para Área Administrativa</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChoice; 