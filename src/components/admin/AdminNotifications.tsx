import React, { useState } from 'react';
import { Bell, MessageCircle, Video, User, Clock, Eye, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const AdminNotifications: React.FC = () => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'new_comment' | 'new_video'>('all');

  // Filtrar notificações de admin (new_comment principalmente)
  const adminNotifications = notifications.filter(n => 
    n.type === 'new_comment' || n.type === 'new_video'
  );

  const filteredNotifications = filter === 'all' 
    ? adminNotifications 
    : adminNotifications.filter(n => n.type === filter);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'há pouco tempo';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_comment':
        return <MessageCircle className="w-5 h-5 text-orange-500" />;
      case 'new_video':
        return <Video className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'new_comment':
        return 'bg-orange-500';
      case 'new_video':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.video_id) {
      // Abrir em nova aba ou navegar para o vídeo
      toast({
        title: "Vídeo encontrado",
        description: `Vídeo: ${notification.video?.titulo || 'Título não disponível'}`,
      });
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-400" />
            <CardTitle className="text-white">Central de Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-orange-500">
                {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
              : 'border-gray-600 text-white hover:bg-white/10'
            }
          >
            Todas ({adminNotifications.length})
          </Button>
          <Button
            variant={filter === 'new_comment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new_comment')}
            className={filter === 'new_comment' 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
              : 'border-gray-600 text-white hover:bg-white/10'
            }
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Comentários ({adminNotifications.filter(n => n.type === 'new_comment').length})
          </Button>
          <Button
            variant={filter === 'new_video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new_video')}
            className={filter === 'new_video' 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
              : 'border-gray-600 text-white hover:bg-white/10'
            }
          >
            <Video className="w-4 h-4 mr-1" />
            Vídeos ({adminNotifications.filter(n => n.type === 'new_video').length})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              {filter === 'all' 
                ? 'Nenhuma notificação encontrada.' 
                : `Nenhuma notificação do tipo selecionado.`
              }
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 rounded-lg cursor-pointer transition-all duration-200 border 
                    ${!notification.read 
                      ? 'bg-white/10 border-orange-400/50 hover:bg-white/15 hover:border-l-4 hover:border-l-orange-400' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-l-4 hover:border-l-orange-400'
                    }
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium text-sm ${
                          !notification.read ? 'text-white' : 'text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm ${
                        !notification.read ? 'text-gray-200' : 'text-gray-400'
                      } mb-2`}>
                        {notification.message}
                      </p>
                      
                      {notification.video && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-800/50 rounded">
                          <Video className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-300 truncate flex-1">
                            {notification.video.titulo}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-gray-600 text-gray-300"
                          >
                            {notification.video.sistema === 'pdvlegal' ? 'PDVLegal' : 'Hiper'}
                          </Badge>
                        </div>
                      )}
                      
                      {notification.related_user && (
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            Por: {notification.related_user.full_name || notification.related_user.username || 'Usuário'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`text-xs ${getNotificationBadgeColor(notification.type)} text-white`}
                          >
                            {notification.type === 'new_comment' ? 'Comentário' : 'Vídeo'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-orange-400 hover:bg-orange-400/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminNotifications; 