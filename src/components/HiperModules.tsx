import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, PlayCircle, BookOpen, Users, DollarSign, FileText, ShoppingCart, Package, CreditCard, BarChart3 } from 'lucide-react';
import VideoCard from './VideoCard';
import VideoModal from './VideoModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types/global';

interface ModuleProgress {
  total: number;
  completed: number;
  percentage: number;
}

interface SubModule {
  name: string;
  icon: React.ReactNode;
  categoryName: string;
  videos: Video[];
  progress: ModuleProgress;
}

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tagName: string;
  subModules: SubModule[];
  totalProgress: ModuleProgress;
}

const HiperModules: React.FC = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Definição da estrutura dos módulos
  const moduleStructure: Omit<Module, 'subModules' | 'totalProgress'>[] = [
    {
      id: 'gestao',
      name: 'Hiper Gestão',
      description: 'Gestão completa do seu negócio',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-700',
      tagName: 'Hiper Gestão'
    },
    {
      id: 'loja',
      name: 'Hiper Loja',
      description: 'Operações de vendas e atendimento',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-green-500 to-green-700',
      tagName: 'Hiper Loja'
    },
    {
      id: 'caixa',
      name: 'Hiper Caixa',
      description: 'Ponto de venda e operações de caixa',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-700',
      tagName: 'Hiper Caixa'
    }
  ];

  // Definição dos submódulos para cada módulo
  const subModuleStructure: Record<string, Omit<SubModule, 'videos' | 'progress'>[]> = {
    gestao: [
      { name: 'Produtos', icon: <Package className="w-5 h-5" />, categoryName: 'Cadastros' },
      { name: 'Estoque', icon: <Package className="w-5 h-5" />, categoryName: 'Estoque' },
      { name: 'Financeiro', icon: <DollarSign className="w-5 h-5" />, categoryName: 'Financeiro' },
      { name: 'Fiscal', icon: <FileText className="w-5 h-5" />, categoryName: 'Fiscal' }
    ],
    loja: [
      { name: 'Clientes', icon: <Users className="w-5 h-5" />, categoryName: 'Cadastros' },
      { name: 'Produtos', icon: <Package className="w-5 h-5" />, categoryName: 'Cadastros' },
      { name: 'Faturamento', icon: <FileText className="w-5 h-5" />, categoryName: 'Vendas' },
      { name: 'Operações', icon: <PlayCircle className="w-5 h-5" />, categoryName: 'Vendas' },
      { name: 'Etiquetas', icon: <BookOpen className="w-5 h-5" />, categoryName: 'Relatórios' }
    ],
    caixa: [
      { name: 'Faturamento', icon: <FileText className="w-5 h-5" />, categoryName: 'Faturamento' },
      { name: 'Operações', icon: <PlayCircle className="w-5 h-5" />, categoryName: 'Operações' }
    ]
  };

  useEffect(() => {
    fetchModulesData();
  }, [user]);

  const fetchModulesData = async () => {
    try {
      setLoading(true);

      // Buscar todos os vídeos do Hiper com suas tags e categorias
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          categoria:categorias(nome, cor),
          video_tags!inner(
            tag:tags(nome)
          )
        `)
        .eq('sistema', 'hiper')
        .eq('status', 'ativo');

      if (videosError) throw videosError;

      // Buscar progresso dos vídeos assistidos pelo usuário
      let watchedVideos: string[] = [];
      if (user) {
        const { data: historyData, error: historyError } = await supabase
          .from('video_history')
          .select('video_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (historyError) throw historyError;
        watchedVideos = historyData?.map(h => h.video_id) || [];
      }

      // Organizar vídeos por módulos e submódulos
      const processedModules = moduleStructure.map(module => {
        const moduleVideos = (videosData?.filter(video => 
          video.video_tags.some((vt: { tag: { nome: string } }) => vt.tag.nome === module.tagName)
        ) || []).map(video => ({
          ...video,
          sistema: (video.sistema === 'hiper' || video.sistema === 'pdvlegal') ? video.sistema as 'hiper' | 'pdvlegal' : 'hiper',
          status: (video.status === 'ativo' || video.status === 'inativo' || video.status === 'rascunho') ? video.status as 'ativo' | 'inativo' | 'rascunho' : 'ativo',
          // Corrigir categoria para garantir que tenha id, nome e cor
          categoria: (() => {
            if (video.categoria && typeof video.categoria === 'object') {
              return {
                id: 'id' in video.categoria ? String(video.categoria.id ?? '') : '',
                nome: 'nome' in video.categoria ? video.categoria.nome ?? '' : '',
                cor: 'cor' in video.categoria ? video.categoria.cor ?? '' : ''
              };
            }
            if (typeof video.categoria === 'string') {
              return video.categoria;
            }
            return { id: '', nome: '', cor: '' };
          })(),
        }));

        const subModules = subModuleStructure[module.id].map(subModule => {
          const subModuleVideos = moduleVideos.filter(video => 
            video.categoria && typeof video.categoria === 'object' && video.categoria.nome === subModule.categoryName
          );

          const completedCount = subModuleVideos.filter(video => 
            watchedVideos.includes(video.id)
          ).length;

          return {
            ...subModule,
            videos: subModuleVideos,
            progress: {
              total: subModuleVideos.length,
              completed: completedCount,
              percentage: subModuleVideos.length > 0 ? (completedCount / subModuleVideos.length) * 100 : 0
            }
          };
        });

        // Calcular progresso total do módulo
        const totalVideos = subModules.reduce((acc, sub) => acc + sub.progress.total, 0);
        const totalCompleted = subModules.reduce((acc, sub) => acc + sub.progress.completed, 0);

        return {
          ...module,
          subModules,
          totalProgress: {
            total: totalVideos,
            completed: totalCompleted,
            percentage: totalVideos > 0 ? (totalCompleted / totalVideos) * 100 : 0
          }
        };
      });

      setModules(processedModules);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    // Recarregar dados para atualizar progresso
    fetchModulesData();
  };

  // Escutar quando vídeos são marcados como assistidos para atualizar módulos
  useEffect(() => {
    const handleVideoWatched = () => {
      // Aguardar um pouco para o banco ser atualizado, então recarregar dados
      setTimeout(() => {
        fetchModulesData();
      }, 1000);
    };

    window.addEventListener('videoWatched', handleVideoWatched);
    
    return () => {
      window.removeEventListener('videoWatched', handleVideoWatched);
    };
  }, []);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Função utilitária para obter a URL da miniatura (igual ao VideoCard)
  const getThumbnailUrl = (video: Video): string => {
    if (video.thumbnail_path) {
      const { data } = supabase.storage.from('thumbnails').getPublicUrl(video.thumbnail_path);
      return data?.publicUrl || '/placeholder.svg';
    }
    if (video.miniatura) {
      return video.miniatura;
    }
    return '/placeholder.svg';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Módulos Hiper
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Aprenda o sistema Hiper de forma organizada através dos nossos módulos especializados
        </p>
      </div>

      {/* Módulos */}
      <div className="grid gap-8">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:border-orange-500/30 transition-all duration-300"
          >
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`bg-gradient-to-r ${module.color} rounded-xl p-3 text-white shadow-lg`}>
                    {module.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">{module.name}</CardTitle>
                    <p className="text-gray-400">{module.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline" className="border-orange-400 text-orange-400">
                      {module.totalProgress.completed}/{module.totalProgress.total} vídeos
                    </Badge>
                    <span className="text-orange-400 font-semibold">
                      {Math.round(module.totalProgress.percentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={module.totalProgress.percentage} 
                    className="w-32 h-2"
                  />
                </div>
              </div>
            </CardHeader>

            {expandedModules.has(module.id) && (
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {module.subModules.map((subModule, index) => (
                    <Card 
                      key={index}
                      className="bg-slate-700/50 border border-slate-600/50 hover:border-orange-500/30 transition-all duration-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-orange-400">
                              {subModule.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{subModule.name}</h3>
                              <p className="text-sm text-gray-400">{subModule.progress.total} vídeos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-white">
                                {subModule.progress.completed}/{subModule.progress.total}
                              </span>
                            </div>
                            <Progress 
                              value={subModule.progress.percentage} 
                              className="w-20 h-1"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      
                      {subModule.videos.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {subModule.videos.map((video) => (
                              <div 
                                key={video.id}
                                className="bg-slate-600/30 rounded-lg p-3 hover:bg-slate-600/50 transition-all duration-200 cursor-pointer"
                                onClick={() => handleVideoClick(video)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getThumbnailUrl(video)}
                                      alt={video.titulo}
                                      className="w-16 h-10 object-cover rounded"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white truncate">
                                      {video.titulo}
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                      {video.duracao} • {video.visualizacoes} visualizações
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <PlayCircle className="w-5 h-5 text-orange-400" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

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

export default HiperModules; 