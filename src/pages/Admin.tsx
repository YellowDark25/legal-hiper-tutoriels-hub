
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VideoIcon, TagIcon, FolderIcon, UploadIcon, LogOutIcon, ShieldIcon } from 'lucide-react';
import VideoManager from '@/components/admin/VideoManager';
import CategoryManager from '@/components/admin/CategoryManager';
import TagManager from '@/components/admin/TagManager';
import VideoUpload from '@/components/admin/VideoUpload';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o usuário está autenticado como admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado da área administrativa.",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header da área administrativa */}
      <div className="bg-primary-900 text-neutral-50 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-secondary p-2 rounded-lg">
                <ShieldIcon className="w-6 h-6 text-neutral-50" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                <p className="text-primary-200 text-sm">
                  Gerencie o conteúdo e configurações do sistema
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-primary-300 text-neutral-50 hover:bg-primary-800 hover:border-secondary"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-neutral-50 border border-primary-200 shadow-sm">
            <TabsTrigger 
              value="videos" 
              className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-neutral-50"
            >
              <VideoIcon className="w-4 h-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-neutral-50"
            >
              <UploadIcon className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-neutral-50"
            >
              <FolderIcon className="w-4 h-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger 
              value="tags" 
              className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-neutral-50"
            >
              <TagIcon className="w-4 h-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <div className="bg-neutral-50 rounded-xl shadow-lg border border-primary-200 overflow-hidden">
            <TabsContent value="videos" className="p-6 m-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-900 mb-2">
                  Gerenciamento de Vídeos
                </h2>
                <p className="text-primary-600">
                  Visualize, edite e organize todos os vídeos do sistema
                </p>
              </div>
              <VideoManager />
            </TabsContent>

            <TabsContent value="upload" className="p-6 m-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-900 mb-2">
                  Upload de Vídeos
                </h2>
                <p className="text-primary-600">
                  Adicione novos vídeos tutoriais ao sistema
                </p>
              </div>
              <VideoUpload />
            </TabsContent>

            <TabsContent value="categories" className="p-6 m-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-900 mb-2">
                  Gerenciamento de Categorias
                </h2>
                <p className="text-primary-600">
                  Organize o conteúdo criando e editando categorias
                </p>
              </div>
              <CategoryManager />
            </TabsContent>

            <TabsContent value="tags" className="p-6 m-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-900 mb-2">
                  Gerenciamento de Tags
                </h2>
                <p className="text-primary-600">
                  Crie e gerencie tags para melhor organização do conteúdo
                </p>
              </div>
              <TagManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
