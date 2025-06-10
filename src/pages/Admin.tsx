
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VideoIcon, TagIcon, FolderIcon, UploadIcon, LogOutIcon, ShieldIcon, UserPlusIcon, SunIcon, MoonIcon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import VideoManager from '@/components/admin/VideoManager';
import CategoryManager from '@/components/admin/CategoryManager';
import TagManager from '@/components/admin/TagManager';
import VideoUpload from '@/components/admin/VideoUpload';
import InviteManager from '@/components/admin/InviteManager';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, signOut, profile, updateTheme } = useAuth();

  useEffect(() => {
    // Verificar se o usuário está autenticado como admin
    if (!user || !isAdmin) {
      navigate('/admin-login');
    }
  }, [user, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado da área administrativa.",
    });
    navigate('/');
  };

  const handleThemeToggle = async (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    await updateTheme(newTheme);
    toast({
      title: "Tema atualizado",
      description: `Tema alterado para ${isDark ? 'escuro' : 'claro'}.`,
    });
  };

  const isDarkTheme = profile?.theme_preference === 'dark';

  if (!user || !isAdmin) {
    return null; // Ou um loading spinner
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-primary-50 to-secondary-50'
    }`}>
      {/* Header da área administrativa */}
      <div className={`shadow-lg transition-colors duration-300 ${
        isDarkTheme 
          ? 'bg-gray-900 text-neutral-50' 
          : 'bg-primary-900 text-neutral-50'
      }`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-secondary p-2 rounded-lg">
                <ShieldIcon className="w-6 h-6 text-neutral-50" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkTheme ? 'text-gray-300' : 'text-primary-200'
                }`}>
                  Bem-vindo, {profile?.full_name || user.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Toggle de tema */}
              <div className="flex items-center space-x-2">
                <SunIcon className="w-4 h-4" />
                <Switch
                  checked={isDarkTheme}
                  onCheckedChange={handleThemeToggle}
                />
                <MoonIcon className="w-4 h-4" />
              </div>
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className={`transition-colors duration-300 ${
                  isDarkTheme
                    ? 'border-gray-600 text-neutral-50 hover:bg-gray-800 hover:border-secondary'
                    : 'border-primary-300 text-neutral-50 hover:bg-primary-800 hover:border-secondary'
                }`}
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className={`grid w-full grid-cols-5 mb-8 shadow-sm transition-colors duration-300 ${
            isDarkTheme
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-neutral-50 border border-primary-200'
          }`}>
            <TabsTrigger 
              value="videos" 
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDarkTheme
                  ? 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50 text-gray-300'
                  : 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDarkTheme
                  ? 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50 text-gray-300'
                  : 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50'
              }`}
            >
              <UploadIcon className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDarkTheme
                  ? 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50 text-gray-300'
                  : 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50'
              }`}
            >
              <FolderIcon className="w-4 h-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger 
              value="tags" 
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDarkTheme
                  ? 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50 text-gray-300'
                  : 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50'
              }`}
            >
              <TagIcon className="w-4 h-4" />
              Tags
            </TabsTrigger>
            <TabsTrigger 
              value="invites" 
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDarkTheme
                  ? 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50 text-gray-300'
                  : 'data-[state=active]:bg-secondary data-[state=active]:text-neutral-50'
              }`}
            >
              <UserPlusIcon className="w-4 h-4" />
              Convites
            </TabsTrigger>
          </TabsList>

          <div className={`rounded-xl shadow-lg border overflow-hidden transition-colors duration-300 ${
            isDarkTheme
              ? 'bg-gray-800 border-gray-700'
              : 'bg-neutral-50 border-primary-200'
          }`}>
            <TabsContent value="videos" className="p-6 m-0">
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkTheme ? 'text-neutral-50' : 'text-primary-900'
                }`}>
                  Gerenciamento de Vídeos
                </h2>
                <p className={`transition-colors duration-300 ${
                  isDarkTheme ? 'text-gray-300' : 'text-primary-600'
                }`}>
                  Visualize, edite e organize todos os vídeos do sistema
                </p>
              </div>
              <VideoManager />
            </TabsContent>

            <TabsContent value="upload" className="p-6 m-0">
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkTheme ? 'text-neutral-50' : 'text-primary-900'
                }`}>
                  Upload de Vídeos
                </h2>
                <p className={`transition-colors duration-300 ${
                  isDarkTheme ? 'text-gray-300' : 'text-primary-600'
                }`}>
                  Adicione novos vídeos tutoriais ao sistema
                </p>
              </div>
              <VideoUpload />
            </TabsContent>

            <TabsContent value="categories" className="p-6 m-0">
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkTheme ? 'text-neutral-50' : 'text-primary-900'
                }`}>
                  Gerenciamento de Categorias
                </h2>
                <p className={`transition-colors duration-300 ${
                  isDarkTheme ? 'text-gray-300' : 'text-primary-600'
                }`}>
                  Organize o conteúdo criando e editando categorias
                </p>
              </div>
              <CategoryManager />
            </TabsContent>

            <TabsContent value="tags" className="p-6 m-0">
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkTheme ? 'text-neutral-50' : 'text-primary-900'
                }`}>
                  Gerenciamento de Tags
                </h2>
                <p className={`transition-colors duration-300 ${
                  isDarkTheme ? 'text-gray-300' : 'text-primary-600'
                }`}>
                  Crie e gerencie tags para melhor organização do conteúdo
                </p>
              </div>
              <TagManager />
            </TabsContent>

            <TabsContent value="invites" className="p-6 m-0">
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkTheme ? 'text-neutral-50' : 'text-primary-900'
                }`}>
                  Gerenciamento de Convites
                </h2>
                <p className={`transition-colors duration-300 ${
                  isDarkTheme ? 'text-gray-300' : 'text-primary-600'
                }`}>
                  Convide novos administradores para o sistema
                </p>
              </div>
              <InviteManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
