import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import { useAuth } from '@/contexts/AuthContext';
import { videoService, categoriaService, tagService } from '@/services/supabaseService';
import { Video, Tag, Categoria } from '@/types/global';
import { useToast } from '@/hooks/use-toast';
import { useProgressStats } from '@/hooks/useProgressStats';
import { useLoading } from '@/contexts/LoadingContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { DashboardCharts } from '../components/DashboardCharts';

const Index: React.FC = () => {
  const { isAdmin, userSystem, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { stats: progressStats, loading: progressLoading, refetch: refetchProgress } = useProgressStats();
  const { setPageLoading } = useLoading();

  // Buscar vídeos baseado no sistema do usuário
  useEffect(() => {
    const fetchVideos = async () => {
      // Se ainda está carregando auth, aguarde
      if (authLoading) return;
      
      // Se for admin, não carrega vídeos na página inicial (pode acessar tudo)
      if (isAdmin) {
        setLoading(false);
        return;
      }

      // Se não tem sistema definido, não carrega vídeos
      if (!userSystem) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPageLoading(true);
        console.log('Carregando vídeos para o sistema:', userSystem);
        
        const videosFromDB = await videoService.getVideosBySystem(userSystem);
        console.log('Vídeos carregados:', videosFromDB);
        
        setVideos(videosFromDB);
      } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os vídeos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };

    fetchVideos();
  }, [userSystem, isAdmin, authLoading, toast]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Escutar quando vídeos são marcados como assistidos para atualizar stats
  useEffect(() => {
    const handleVideoWatched = () => {
      // Aguardar um pouco para o banco ser atualizado, então recarregar stats
      setTimeout(() => {
        refetchProgress();
      }, 1000);
    };

    window.addEventListener('videoWatched', handleVideoWatched);
    
    return () => {
      window.removeEventListener('videoWatched', handleVideoWatched);
    };
  }, [refetchProgress]);

  // Função para obter o nome do sistema
  const getSystemName = (sistema: string) => {
    return sistema === 'pdvlegal' ? 'PDVLegal' : 'Hiper';
  };

  // Função para obter a cor do sistema
  const getSystemColor = (sistema: string) => {
    return sistema === 'pdvlegal' ? '#2563EB' : '#7C3AED';
  };

  // Se não está logado, redireciona para login
  if (!authLoading && !userSystem && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-800">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-slate-700/50 rounded-2xl p-8 border border-slate-600/50">
              <svg className="w-16 h-16 text-orange-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h2 className="text-2xl font-bold text-white mb-4">Bem-vindo ao NexHub</h2>
              <p className="text-gray-300 mb-6">
                Faça login para acessar seu dashboard personalizado com estatísticas e progresso dos tutoriais.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Fazer Login
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-800 transition-colors duration-200">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Header do Dashboard */}
        <section className="py-8 md:py-12 bg-gradient-to-br from-slate-700 to-slate-800 border-b border-slate-600/50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Dashboard de Aprendizado
                  </h1>
                  {userSystem && (
                    <div className="flex items-center">
                        <img 
                          src={userSystem === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                          alt={`${getSystemName(userSystem)} Logo`}
                        className="w-6 h-6 mr-2"
                      />
                      <p className="text-gray-300 text-lg">
                        Sistema: <span className="text-orange-400 font-semibold">{getSystemName(userSystem)}</span>
                      </p>
                    </div>
                  )}
                  {isAdmin && (
                    <p className="text-gray-300 text-lg">
                      Acesso: <span className="text-purple-400 font-semibold">Administrador</span>
                    </p>
                  )}
                  </div>
                  
                {/* Ações Rápidas */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {userSystem && (
                <Link
                      to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                      className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                            </svg>
                      Ver Tutoriais
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                      Painel Admin
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
              {progressLoading ? (
                <div className="py-12">
                  <Loading size="lg" variant="spinner" text="Carregando estatísticas..." />
                </div>
              ) : progressStats ? (
                <div className="space-y-6 md:space-y-8">
                  {/* Cards de Estatísticas Principais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/30 text-white">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm font-medium">Vídeos Assistidos</p>
                            <p className="text-2xl md:text-3xl font-bold">{progressStats.geral?.videosAssistidos || 0}</p>
                  </div>
                          <div className="bg-white/20 rounded-full p-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          </div>
                            </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500/30 text-white">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm font-medium">Total Disponível</p>
                            <p className="text-2xl md:text-3xl font-bold">{progressStats.geral?.totalVideos || 0}</p>
                          </div>
                          <div className="bg-white/20 rounded-full p-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                            </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500/30 text-white">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium">Progresso Geral</p>
                            <p className="text-2xl md:text-3xl font-bold">{progressStats.geral?.percentualCompleto || 0}%</p>
                          </div>
                          <div className="bg-white/20 rounded-full p-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500/30 text-white">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm font-medium">Atividade Recente</p>
                            <p className="text-2xl md:text-3xl font-bold">{progressStats.atividadeRecente || 0}</p>
                            </div>
                          <div className="bg-white/20 rounded-full p-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resumo Geral */}
                  <Card className="bg-slate-700/50 border-slate-600/50">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium">Progresso Total</span>
                          <span className="text-orange-400 font-bold text-lg">
                            {progressStats.geral?.videosAssistidos || 0}/{progressStats.geral?.totalVideos || 0} vídeos
                            </span>
                          </div>
                          <Progress 
                          value={progressStats.geral?.percentualCompleto || 0} 
                          className="h-4"
                          />
                        <div className="text-center">
                          <span className="text-2xl font-bold text-white">
                            {progressStats.geral?.percentualCompleto || 0}% completo
                          </span>
                        </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Progresso por Módulos (apenas para Hiper) */}
                  {userSystem === 'hiper' && progressStats.modulos && progressStats.modulos.length > 0 && (
                    <Card className="bg-slate-700/50 border-slate-600/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                            </svg>
                            Progresso por Módulos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {progressStats.modulos.map((module, index) => (
                            <div key={index} className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                                <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white text-sm">{module.nome}</h4>
                                <Badge variant="outline" className="border-orange-400 text-orange-400 text-xs">
                                  {module.assistidos}/{module.total}
                                  </Badge>
                                </div>
                                <Progress 
                                value={module.percentual} 
                                  className="h-2 mb-2"
                                />
                              <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">
                                  {module.percentual}% completo
                                  </span>
                                  <span className="text-gray-400">
                                  {module.total} vídeos
                                  </span>
                                </div>
                            </div>
                          ))}
                                  </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Progresso por Categorias */}
                  {progressStats.categorias && progressStats.categorias.length > 0 && (
                    <Card className="bg-slate-700/50 border-slate-600/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                          </svg>
                          Progresso por Categorias
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {progressStats.categorias.map((categoria, index) => (
                            <div key={index} className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white text-sm">{categoria.nome}</h4>
                                <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                                  {categoria.assistidos}/{categoria.total}
                                </Badge>
                              </div>
                              <Progress 
                                value={categoria.percentual} 
                                className="h-2 mb-2"
                              />
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">
                                  {categoria.percentual}% completo
                                </span>
                                <span className="text-gray-400">
                                  {categoria.total} vídeos
                                </span>
                              </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Seção Inferior */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Atividade Recente */}
                    {progressStats.ultimosAssistidos && progressStats.ultimosAssistidos.length > 0 && (
                      <Card className="bg-slate-700/50 border-slate-600/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Vídeos Assistidos Recentemente
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {progressStats.ultimosAssistidos.slice(0, 5).map((video, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg border border-slate-500/30">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                  <div>
                                    <p className="text-white font-medium text-sm">{video.titulo}</p>
                                    <p className="text-gray-400 text-xs">
                                      {new Date(video.watchedAt).toLocaleDateString('pt-BR', { 
                                        day: '2-digit', 
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Ações Rápidas e Suporte */}
                    <Card className="bg-slate-700/50 border-slate-600/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                          <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                            </svg>
                          Ações Rápidas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-3">
                          {userSystem && (
                          <Link
                            to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center text-sm"
                          >
                              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            {userSystem === 'hiper' ? 'Ver Módulos' : 'Ver Todos os Tutoriais'}
                          </Link>
                          )}
                          
                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center text-sm"
                            >
                              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                              Painel Administrativo
                            </Link>
                          )}

                          <Link
                            to="/contato"
                            className="block w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center text-sm"
                          >
                            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            Suporte
                          </Link>

                          <Link
                            to="/profile"
                            className="block w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center text-sm"
                          >
                            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                            Meu Perfil
                          </Link>
                        </div>
                        </CardContent>
                      </Card>
                  </div>

                  {/* Dicas e Informações */}
                  <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="bg-blue-500/20 rounded-full p-3 mr-4 flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">💡 Dica do Dia</h4>
                          <p className="text-gray-300">
                            {userSystem === 'hiper' 
                              ? 'Use os módulos organizados para aprender de forma sequencial. Cada módulo foi estruturado para construir conhecimento progressivamente.'
                              : 'Assista aos tutoriais em ordem de categoria para melhor compreensão. Use os comentários para tirar dúvidas específicas!'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </div>
              ) : (
                // Fallback para quando não há dados de progresso
                <div className="space-y-6">
                  <Card className="bg-slate-700/50 border-slate-600/50">
                    <CardContent className="p-8 text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                      <h3 className="text-xl font-semibold text-white mb-2">Bem-vindo ao seu Dashboard!</h3>
                      <p className="text-gray-300 mb-6">
                        Comece assistindo alguns tutoriais para ver suas estatísticas de progresso aqui.
                      </p>
                      {userSystem && (
                        <Link
                          to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                          className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Começar Agora
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Modal de vídeo */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Index;
