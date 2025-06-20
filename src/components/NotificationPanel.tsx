import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Video, 
  MessageCircle, 
  UserPlus, 
  Trash2, 
  CheckCheck,
  Eye,
  X
} from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { userSystem, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'comment_reply':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'new_comment':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_video':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'comment_reply':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'new_comment':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navegar para o vídeo relacionado se existir
    if (notification.video_id && notification.video) {
      const videoSistema = notification.video.sistema;
      
      if (isAdmin) {
        // Admin pode ir para qualquer sistema
        if (videoSistema === 'pdvlegal') {
          navigate('/pdvlegal');
        } else if (videoSistema === 'hiper') {
          navigate('/hiper');
        }
      } else if (userSystem) {
        // Usuário comum só pode ir para seu sistema
        if (userSystem === videoSistema) {
          if (userSystem === 'pdvlegal') {
            navigate('/pdvlegal');
          } else if (userSystem === 'hiper') {
            navigate('/hiper');
          }
        }
      }
    }

    onClose();
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 sm:w-[480px] bg-white dark:bg-gray-900">
        <SheetHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Bell className="w-5 h-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="w-full mt-2 text-sm"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Você está em dia! Quando houver novidades, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md
                    ${notification.read 
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                      : getNotificationColor(notification.type)
                    }
                  `}
                >
                  {/* Indicador de não lida */}
                  {!notification.read && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {notification.title}
                      </h4>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Informações do vídeo */}
                      {notification.video && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mb-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            📹 {notification.video.titulo}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Sistema: {notification.video.sistema === 'pdvlegal' ? 'PDVLegal' : 'Hiper'}
                          </p>
                        </div>
                      )}

                      {/* Informações do usuário relacionado */}
                      {notification.related_user && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          👤 {notification.related_user.full_name || notification.related_user.username || 'Usuário'}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
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
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
