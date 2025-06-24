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
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index: React.FC = () => {
  const { isAdmin, userSystem, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { stats: progressStats, loading: progressLoading } = useProgressStats();

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

  // Função para obter o nome do sistema
  const getSystemName = (sistema: string) => {
    return sistema === 'pdvlegal' ? 'PDVLegal' : 'Hiper';
  };

  // Função para obter a cor do sistema
  const getSystemColor = (sistema: string) => {
    return sistema === 'pdvlegal' ? '#2563EB' : '#7C3AED';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-800 transition-colors duration-200">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section - Personalizado baseado no sistema do usuário */}
        <section 
          className="relative py-20 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #002147 0%, #0066CC 25%, #FF6600 85%, #CCDD00 100%)'
          }}
        >
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{
              backgroundImage: `url('/src/assets/cloud-bg-darker.png')`
            }}
          ></div>
          <div 
            className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-800/30"
          ></div>
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-amber-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-16 h-16 bg-orange-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-amber-400/10 rounded-full blur-xl animate-pulse delay-1500"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {!authLoading && userSystem ? (
                // Usuário logado com sistema específico
                <div className="animate-fade-in-up">
                  {/* Logo do Sistema */}
                  <div className="flex justify-center mb-8">
                    <div className="relative bg-white/15 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/30 overflow-hidden group hover:scale-105 transition-all duration-300">
                      {/* Background Pattern Sutil */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                        style={{
                          backgroundImage: `url('/src/assets/info-img-DoVliB4e.png')`
                        }}
                      ></div>
                      <div className="relative z-10">
                        <img 
                          src={userSystem === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                          alt={`${getSystemName(userSystem)} Logo`}
                          className="w-16 h-16 object-contain animate-bounce-slow"
                        />
                      </div>
                    </div>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-left drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Tutoriais {getSystemName(userSystem)}
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in-right opacity-90 drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Aprenda a usar o sistema {getSystemName(userSystem)} com nossos tutoriais práticos e atualizados
                  </p>

                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
                    </div>
                  ) : videos.length > 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/20 animate-fade-in">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {videos.length} tutorial{videos.length !== 1 ? 's' : ''} disponível{videos.length !== 1 ? 'eis' : ''}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : !authLoading && isAdmin ? (
                // Admin logado
                <div className="animate-fade-in-up">
                  <div className="flex justify-center mb-8">
                    <div className="relative bg-white/15 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/30 overflow-hidden group hover:scale-105 transition-all duration-300">
                      {/* Background Pattern Sutil */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                        style={{
                          backgroundImage: `url('/src/assets/cloud-bg.png')`
                        }}
                      ></div>
                      <div className="relative z-10">
                        <svg className="w-16 h-16 text-white animate-bounce-slow" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-left drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Centro de Tutoriais
                    </span>
                  </h1>
                  
                  <div className="text-xl md:text-2xl mb-4 animate-slide-in-right">
                    <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Admin
                    </span>
                  </div>
                  
                  <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90 drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Acesse qualquer sistema ou gerencie o conteúdo através do painel administrativo
                  </p>
                </div>
              ) : (
                // Usuário não logado ou sem sistema
                <div className="animate-fade-in-up">
                  <div className="flex justify-center mb-8">
                    <div className="relative bg-white/15 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/30 overflow-hidden group hover:scale-105 transition-all duration-300">
                      {/* Background Pattern Sutil */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                        style={{
                          backgroundImage: `url('/src/assets/cloud-bg2.png')`
                        }}
                      ></div>
                      <div className="relative z-10">
                        <svg className="w-16 h-16 text-white animate-bounce-slow" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-left drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Centro de Tutoriais
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-in-right opacity-90 drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Aprenda a usar os sistemas PDVLegal e Hiper com nossos tutoriais práticos e atualizados
                  </p>

                  {/* Estatísticas Animadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12 animate-fade-in">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>2</div>
                      <div className="text-white/80 text-sm font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>Sistemas Disponíveis</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>100%</div>
                      <div className="text-white/80 text-sm font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>Conteúdo Prático</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>24/7</div>
                      <div className="text-white/80 text-sm font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>Acesso Disponível</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botões de acesso direto aos sistemas - condicionais */}
              {(isAdmin || !userSystem) && (
                <div className={`grid gap-8 max-w-4xl mx-auto animate-fade-in-up ${isAdmin || !userSystem ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                                    {(isAdmin || !userSystem || userSystem === 'pdvlegal') && (
                <Link
                  to="/pdvlegal"
                      className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 hover:-translate-y-2 border border-blue-500/20 overflow-hidden"
                    >
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mr-4 group-hover:bg-white/20 transition-all duration-300">
                              <img 
                                src="/pdv-legal-BLWLrCAG.png" 
                                alt="PDVLegal Logo" 
                                className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-2xl font-bold group-hover:text-blue-100 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>PDVLegal</h3>
                          </div>
                          <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20 group-hover:rotate-45 transition-all duration-300">
                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                        </div>
                        
                        <p className="text-blue-100 text-left leading-relaxed group-hover:text-white transition-colors font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                          Sistema de Ponto de Venda completo para seu estabelecimento
                        </p>
                        
                        <div className="flex items-center mt-4 text-blue-200 group-hover:text-blue-100 transition-colors">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Acesso Disponível</span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {(isAdmin || !userSystem || userSystem === 'hiper') && (
                    <Link
                      to="/hiper"
                      className="group relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:-translate-y-2 border border-purple-500/20 overflow-hidden"
                    >
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mr-4 group-hover:bg-white/20 transition-all duration-300">
                              <img 
                                src="/hiper-logo-D4juEd9-.png" 
                                alt="Hiper Logo" 
                                className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-2xl font-bold group-hover:text-purple-100 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>Hiper</h3>
                          </div>
                          <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20 group-hover:rotate-45 transition-all duration-300">
                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                        </div>
                        
                        <p className="text-purple-100 text-left leading-relaxed group-hover:text-white transition-colors font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                          Sistema integrado de gestão empresarial
                        </p>
                        
                        <div className="flex items-center mt-4 text-purple-200 group-hover:text-purple-100 transition-colors">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Acesso Disponível</span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Divisor de Transição */}
        <div 
          className="h-32 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/src/assets/cloud-bg-darker.png')`,
            background: 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.8) 100%), url("/src/assets/cloud-bg-darker.png")'
          }}
        ></div>

                {/* Seção de informações úteis para o usuário */}
        {!authLoading && userSystem && (
          <section className="py-20 relative bg-slate-800 transition-colors duration-200">
            {/* Background Image Sutil */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
              style={{
                backgroundImage: `url('/src/assets/cloud-bg-darker.png')`
              }}
            ></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mb-6 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                      Dashboard de Aprendizado
                    </span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Acompanhe seu progresso e acesse rapidamente o que precisa
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto mt-6"></div>
                </div>

                {progressLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                  </div>
                ) : progressStats ? (
                  <div className="space-y-8">
                    {/* Progresso Geral */}
                    <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <svg className="w-6 h-6 mr-3 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          Progresso Geral
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-orange-400 mb-2">
                              {progressStats.completedVideos}
                            </div>
                            <div className="text-gray-300">Vídeos Assistidos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                              {progressStats.totalVideos}
                            </div>
                            <div className="text-gray-300">Total de Vídeos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                              {Math.round(progressStats.overallPercentage)}%
                            </div>
                            <div className="text-gray-300">Completado</div>
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Progresso Total</span>
                            <span className="text-orange-400 font-semibold">
                              {Math.round(progressStats.overallPercentage)}%
                            </span>
                          </div>
                          <Progress 
                            value={progressStats.overallPercentage} 
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Progresso por Módulos (apenas para Hiper) */}
                    {userSystem === 'hiper' && progressStats.moduleStats.length > 0 && (
                      <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                            </svg>
                            Progresso por Módulos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {progressStats.moduleStats.map((module, index) => (
                              <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-white">{module.moduleName}</h4>
                                  <Badge variant="outline" className="border-orange-400 text-orange-400">
                                    {module.completedVideos}/{module.totalVideos}
                                  </Badge>
                                </div>
                                <Progress 
                                  value={module.percentage} 
                                  className="h-2 mb-2"
                                />
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">
                                    {Math.round(module.percentage)}% completo
                                  </span>
                                  <span className="text-gray-400">
                                    {module.totalVideos} vídeos
                                  </span>
                                </div>
                                {module.lastWatched && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    Último: {module.lastWatched.videoTitle.substring(0, 30)}...
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Atividade Recente */}
                    {progressStats.recentActivity.length > 0 && (
                      <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <svg className="w-6 h-6 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            Últimos Vídeos Assistidos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {progressStats.recentActivity.slice(0, 3).map((activity, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                  <span className="text-white font-medium">
                                    {activity.videoTitle}
                                  </span>
                                </div>
                                <span className="text-gray-400 text-sm">
                                  {new Date(activity.watchedAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cards de Ação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Card de Acesso Rápido */}
                      <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <svg className="w-6 h-6 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Acesso Rápido
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Link
                            to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                          >
                            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            {userSystem === 'hiper' ? 'Ver Módulos' : 'Ver Todos os Tutoriais'}
                          </Link>
                          <div className="text-center text-gray-400 text-sm mt-2">
                            {userSystem === 'hiper' 
                              ? 'Acesse os módulos organizados' 
                              : 'Acesse a biblioteca completa de vídeos'
                            }
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card de Suporte */}
                      <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            Precisa de Ajuda?
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 text-sm mb-3">
                            Não encontrou o que procurava? Nossa equipe está pronta para ajudar.
                          </p>
                          <Link
                            to="/contato"
                            className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                          >
                            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            Entrar em Contato
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Card de Estatísticas Simples (fallback) */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Estatísticas
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Total de tutoriais:</span>
                          <span className="text-white font-semibold">{videos.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Sistema:</span>
                          <span className="text-white font-semibold">{getSystemName(userSystem)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Disponível 24/7:</span>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-green-400 font-semibold">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card de Acesso Rápido */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Acesso Rápido
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <Link
                          to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                          className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                        >
                          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Ver Todos os Tutoriais
                        </Link>
                        <div className="text-center text-gray-400 text-sm">
                          Acesse a biblioteca completa de vídeos
                        </div>
                      </div>
                    </div>

                    {/* Card de Suporte */}
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.8s_forwards]">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Precisa de Ajuda?
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-300 text-sm">
                          Não encontrou o que procurava? Nossa equipe está pronta para ajudar.
                        </p>
                        <Link
                          to="/contato"
                          className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                        >
                          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                          Entrar em Contato
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dica para o usuário */}
                <div className="mt-12 text-center opacity-0 animate-[fadeInUp_0.6s_ease-out_1s_forwards]">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-blue-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Dica
                      </h4>
                    </div>
                    <p className="text-gray-300 font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                      Use a aba <strong>{getSystemName(userSystem)}</strong> no menu para acessar todos os tutoriais organizados por categoria. 
                      Você também pode comentar nos vídeos para tirar dúvidas!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Divisor de Transição */}
        <div 
          className="h-32 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/src/assets/cloud-bg-darker.png')`,
            background: 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.8) 100%), url("/src/assets/cloud-bg-darker.png")'
          }}
        ></div>

        {/* Seção de recursos - Mais informativa */}
        <section className="py-20 relative overflow-hidden transition-colors duration-200 bg-slate-800">
          {/* Background decorativo */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: `url('/src/assets/cloud-bg-darker.png')`
            }}
          ></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-slate-600/10 to-slate-700/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-r from-slate-700/10 to-slate-800/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
                          <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mb-6 shadow-2xl">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                      Como funciona
                    </span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Acesse tutoriais organizados por categoria e aprenda no seu ritmo
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto mt-6"></div>
                </div>
              
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center group opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Organize por Categoria
                  </h3>
                  <p className="text-gray-300 leading-relaxed drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Tutoriais organizados por módulos e funcionalidades para facilitar seu aprendizado
                  </p>
                </div>
                
                <div className="text-center group opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Vídeos Práticos
                  </h3>
                  <p className="text-gray-300 leading-relaxed drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Demonstrações passo a passo das funcionalidades com exemplos reais
                  </p>
                </div>
                
                <div className="text-center group opacity-0 animate-[fadeInUp_0.6s_ease-out_0.8s_forwards]">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Sempre Atualizado
                  </h3>
                  <p className="text-gray-300 leading-relaxed drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Conteúdo atualizado com as últimas versões e funcionalidades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divisor de Transição */}
        <div 
          className="h-32 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/src/assets/cloud-bg-darker.png')`,
            background: 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.8) 100%), url("/src/assets/cloud-bg-darker.png")'
          }}
        ></div>

        {/* Seção de sistemas - Filtrada baseado no sistema do usuário */}
        {(isAdmin || !userSystem) && (
          <section className="py-16 relative bg-slate-800 transition-colors duration-200">
            {/* Background Image para Serviços */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
              style={{
                backgroundImage: `url('/src/assets/cloud-bg-darker.png')`
              }}
            ></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
                  <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                      {isAdmin ? 'Nossos Sistemas' : 'Escolha seu Sistema'}
                    </span>
                  </h2>
                  <p className="text-gray-300 max-w-2xl mx-auto font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    {isAdmin 
                      ? 'Soluções desenvolvidas para otimizar a gestão do seu negócio'
                      : 'Selecione o sistema que você utiliza para acessar os tutoriais específicos'
                    }
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto mt-4"></div>
                </div>
                
                <div className={`grid gap-12 ${isAdmin || !userSystem ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-2xl mx-auto'}`}>
                {/* PDVLegal Card - Mostrar se admin ou não tem sistema */}
                {(isAdmin || !userSystem) && (
                  <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-8 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mr-4 p-2 shadow-lg">
                      <img 
                        src="/pdv-legal-BLWLrCAG.png" 
                        alt="PDVLegal Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>PDVLegal</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-6 font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Sistema completo de Ponto de Venda desenvolvido para estabelecimentos 
                    comerciais que precisam de agilidade e confiabilidade.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span>Controle de vendas e estoque</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span>Emissão de cupons fiscais</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span>Relatórios gerenciais</span>
                    </div>
                  </div>
                  
                    <Link
                      to="/pdvlegal"
                      className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                    >
                      Acessar tutoriais
                      <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                )}

                {/* Hiper Card - Mostrar se admin ou não tem sistema */}
                {(isAdmin || !userSystem) && (
                  <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-8 hover:shadow-xl hover:border-purple-500/30 transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mr-4 p-2 shadow-lg">
                      <img 
                        src="/hiper-logo-D4juEd9-.png" 
                        alt="Hiper Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Hiper</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-6 font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Sistema integrado de gestão empresarial que oferece controle total 
                    sobre todos os aspectos do seu negócio.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>Gestão completa de estoque</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>Módulo financeiro avançado</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span>Integração com e-commerce</span>
                    </div>
                  </div>
                  
                    <Link
                      to="/hiper"
                      className="inline-flex items-center bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                    >
                      Acessar tutoriais
                      <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Seção personalizada para usuários com sistema específico */}
        {!authLoading && userSystem && (
          <section className="py-16 relative bg-slate-800 transition-colors duration-200">
            {/* Background Image Sutil */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-4"
              style={{
                backgroundImage: `url('/src/assets/cloud-bg2.png')`
              }}
            ></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Seu Sistema - {getSystemName(userSystem)}
                  </h2>
                  <p className="text-gray-300 max-w-2xl mx-auto font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                    Você tem acesso completo aos tutoriais do {getSystemName(userSystem)}
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-8 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center mr-4 p-2"
                        style={{ backgroundColor: getSystemColor(userSystem) }}
                      >
                        <img 
                          src={userSystem === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                          alt={`${getSystemName(userSystem)} Logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{getSystemName(userSystem)}</h3>
                    </div>
                    
                    <p className="text-gray-300 mb-6 font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                      {userSystem === 'pdvlegal' 
                        ? 'Sistema completo de Ponto de Venda desenvolvido para estabelecimentos comerciais que precisam de agilidade e confiabilidade.'
                        : 'Sistema integrado de gestão empresarial que oferece controle total sobre todos os aspectos do seu negócio.'
                      }
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {userSystem === 'pdvlegal' ? (
                        <>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            <span>Controle de vendas e estoque</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            <span>Emissão de cupons fiscais</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            <span>Relatórios gerenciais</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#A78BFA' }}></div>
                            <span>Gestão completa de estoque</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#A78BFA' }}></div>
                            <span>Módulo financeiro avançado</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#A78BFA' }}></div>
                            <span>Integração com e-commerce</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white"
                        style={{ backgroundColor: getSystemColor(userSystem) }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        Ver Todos os Tutoriais
                      </Link>
                      
                      {videos.length > 0 && (
                        <div className="flex items-center justify-center px-6 py-3 rounded-lg border-2 border-slate-600 text-gray-300">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                          {videos.length} Tutorial{videos.length !== 1 ? 's' : ''} Disponível{videos.length !== 1 ? 'eis' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Divisor de Transição */}
        <div 
          className="h-32 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/src/assets/cloud-bg-darker.png')`,
            background: 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.8) 100%), url("/src/assets/cloud-bg-darker.png")'
          }}
        ></div>

        {/* Seção de ajuda/suporte */}
        <section className="py-20 bg-slate-800 relative overflow-hidden transition-colors duration-200">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-8"
            style={{
              backgroundImage: `url('/src/assets/cloud-bg.png')`
            }}
          ></div>
          {/* Background decorativo */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-slate-700/5 via-slate-600/5 to-slate-700/5"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-slate-600/10 to-slate-700/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-slate-700/10 to-slate-800/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl mb-8 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300">
                  {/* Background Pattern */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                    style={{
                      backgroundImage: `url('/src/assets/info-img-DoVliB4e.png')`
                    }}
                  ></div>
                  <div className="relative z-10">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5L8.5 16 12 18.5 15.5 16 12 13.5z"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                    Precisa de ajuda?
                  </span>
                </h2>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
                  Não encontrou o que procurava? Nossa equipe está pronta para ajudar você
                </p>
                

                
                <Link
                  to="/contato"
                  className="group inline-flex items-center bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/25 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <svg className="w-6 h-6 mr-3 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Entrar em contato
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
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
