import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VideoIcon, TagIcon, FolderIcon, UploadIcon, LogOutIcon, ShieldIcon, UserPlusIcon, SunIcon, MoonIcon, UsersIcon, HomeIcon, BellIcon, SparklesIcon, MenuIcon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import VideoManager from '@/components/admin/VideoManager';
import CategoryManager from '@/components/admin/CategoryManager';
import TagManager from '@/components/admin/TagManager';
import VideoUpload from '@/components/admin/VideoUpload';
import InviteManager from '@/components/admin/InviteManager';
import AdminNotifications from '@/components/admin/AdminNotifications';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ClientesManager from '@/components/admin/ClientesManager';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, signOut, profile, updateTheme, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado da área administrativa.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Em caso de erro, ainda assim navegar para auth
      navigate('/auth');
    }
  };

  const [isDarkTheme, setIsDarkTheme] = useState(profile?.theme_preference === 'dark');

  useEffect(() => {
    setIsDarkTheme(profile?.theme_preference === 'dark');
  }, [profile?.theme_preference]);

  const handleThemeToggle = async (checked: boolean) => {
    setIsDarkTheme(checked);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_preference: checked ? 'dark' : 'light' })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao salvar preferência de tema:', error);
        }
      } catch (error) {
        console.error('Erro ao atualizar tema:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-sm sm:text-lg font-medium">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #14213d 0%, #1a1a1a 50%, #0a0a0a 100%)'
    }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background circles - reduzidos no mobile */}
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-amber-500/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-orange-400/5 to-amber-400/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-orange-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-amber-400/40 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-300/35 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-amber-300/30 rounded-full animate-ping delay-300"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg sm:rounded-2xl p-2 sm:p-3 shadow-2xl">
                  <ShieldIcon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse border border-white sm:border-2"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent truncate">
                  Painel Admin ✨
                </h1>
                <p className="text-white/70 text-xs sm:text-sm truncate">
                  <span className="hidden sm:inline">Bem-vindo, </span>
                  <span className="text-orange-400 font-medium truncate max-w-[120px] sm:max-w-none inline-block">
                    {profile?.full_name || user.email}
                  </span>
                </p>
                <div className="flex items-center mt-0.5 sm:mt-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
                  <span className="text-white/60 text-xs">Sistema Online</span>
                </div>
              </div>
            </div>
            
            {/* Botões Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-500/10 hover:border-orange-300 flex items-center backdrop-blur-sm"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Página Inicial
              </Button>

              {/* Toggle de tema */}
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <SunIcon className="w-4 h-4 text-orange-400" />
                <Switch
                  checked={isDarkTheme}
                  onCheckedChange={handleThemeToggle}
                  className="data-[state=checked]:bg-orange-500"
                />
                <MoonIcon className="w-4 h-4 text-orange-400" />
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-500/10 hover:border-red-300 backdrop-blur-sm"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Menu Mobile */}
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-orange-400 text-orange-400 hover:bg-orange-500/10 p-2">
                    <MenuIcon className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-slate-900 border-slate-700">
                  <div className="mt-6 space-y-4">
                    <div className="text-center pb-4 border-b border-slate-700">
                      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-3 w-fit mx-auto mb-3">
                        <ShieldIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold">Painel Admin</h3>
                      <p className="text-gray-400 text-sm truncate">{profile?.full_name || user.email}</p>
                    </div>
                    
                    <Button
                      onClick={() => {
                        navigate('/');
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-orange-400 text-orange-400 hover:bg-orange-500/10 justify-start"
                    >
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Página Inicial
                    </Button>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-2">
                        <SunIcon className="w-4 h-4 text-orange-400" />
                        <span className="text-white text-sm">Tema Escuro</span>
                        <MoonIcon className="w-4 h-4 text-orange-400" />
                      </div>
                      <Switch
                        checked={isDarkTheme}
                        onCheckedChange={handleThemeToggle}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-red-400 text-red-400 hover:bg-red-500/10 justify-start"
                    >
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Tabs defaultValue="videos" className="w-full">
          {/* Tab Navigation */}
          <div className="mb-6 sm:mb-8">
            {/* Mobile: Dropdown-style tabs */}
            <div className="block lg:hidden mb-4">
              <TabsList className="grid grid-cols-4 w-full bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-1 gap-1">
                <TabsTrigger 
                  value="videos" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-lg p-2"
                >
                  <VideoIcon className="w-4 h-4" />
                  <span className="text-xs">Vídeos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="upload" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-lg p-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  <span className="text-xs">Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="categorias" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-lg p-2"
                >
                  <FolderIcon className="w-4 h-4" />
                  <span className="text-xs">Categorias</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tags" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-lg p-2"
                >
                  <TagIcon className="w-4 h-4" />
                  <span className="text-xs">Tags</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsList className="grid grid-cols-3 w-full bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-1 gap-1 mt-2">
                <TabsTrigger 
                  value="convites" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-lg p-2"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  <span className="text-xs">Convites</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="clientes" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-lg p-2"
                >
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-xs">Clientes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-lg p-2"
                >
                  <BellIcon className="w-4 h-4" />
                  <span className="text-xs">Notif.</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Desktop: Single row tabs */}
            <div className="hidden lg:block">
              <TabsList className="grid w-full grid-cols-7 bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
                <TabsTrigger 
                  value="videos" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <VideoIcon className="w-4 h-4" />
                  <span>Vídeos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <UploadIcon className="w-4 h-4" />
                  <span>Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="categorias" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <FolderIcon className="w-4 h-4" />
                  <span>Categorias</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tags" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <TagIcon className="w-4 h-4" />
                  <span>Tags</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="convites" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  <span>Convites</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="clientes" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <UsersIcon className="w-4 h-4" />
                  <span>Clientes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <BellIcon className="w-4 h-4" />
                  <span>Notificações</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="animate-fade-in">
            <TabsContent value="videos" className="space-y-4 sm:space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-0 sm:mr-4 shadow-xl w-fit">
                    <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Gerenciamento de Vídeos</h2>
                    <p className="text-white/60 text-sm sm:text-base">Visualize, edite e organize todos os vídeos do sistema</p>
                  </div>
                </div>
                <VideoManager />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 sm:space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-0 sm:mr-4 shadow-xl w-fit">
                    <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Upload de Vídeos</h2>
                    <p className="text-white/60 text-sm sm:text-base">Adicione novos vídeos ao sistema</p>
                  </div>
                </div>
                <VideoUpload />
              </div>
            </TabsContent>

            <TabsContent value="categorias" className="space-y-4 sm:space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-0 sm:mr-4 shadow-xl w-fit">
                    <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Gerenciar Categorias</h2>
                    <p className="text-white/60 text-sm sm:text-base">Organize os vídeos em categorias</p>
                  </div>
                </div>
                <CategoryManager />
              </div>
            </TabsContent>

            <TabsContent value="tags" className="space-y-4 sm:space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-0 sm:mr-4 shadow-xl w-fit">
                    <TagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Gerenciar Tags</h2>
                    <p className="text-white/60 text-sm sm:text-base">Crie e organize tags para os vídeos</p>
                  </div>
                </div>
                <TagManager />
              </div>
            </TabsContent>

            <TabsContent value="convites" className="space-y-4 sm:space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-0 sm:mr-4 shadow-xl w-fit">
                    <UserPlusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Gerenciar Convites</h2>
                    <p className="text-white/60 text-sm sm:text-base">Convide novos usuários para o sistema</p>
                  </div>
                </div>
                <InviteManager />
              </div>
            </TabsContent>

            <TabsContent value="clientes" className="space-y-4 sm:space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-0 sm:mr-4 shadow-xl w-fit">
                    <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Gerenciar Clientes</h2>
                    <p className="text-white/60 text-sm sm:text-base">Visualize e gerencie todos os usuários</p>
                  </div>
                </div>
                <ClientesManager />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-0 sm:mr-4 shadow-xl w-fit">
                    <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Central de Notificações</h2>
                    <p className="text-white/60 text-sm sm:text-base">Monitore todas as atividades do sistema</p>
                  </div>
                </div>
                <AdminNotifications />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Admin;
