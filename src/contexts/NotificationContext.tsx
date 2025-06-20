import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'new_video' | 'comment_reply' | 'new_comment';
  title: string;
  message: string;
  video_id?: string;
  comment_id?: string;
  related_user_id?: string;
  read: boolean;
  created_at: string;
  video?: {
    titulo: string;
    sistema: string;
  };
  related_user?: {
    full_name: string | null;
    username: string | null;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      // Query simplificada para evitar erro 400
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          title,
          message,
          video_id,
          comment_id,
          related_user_id,
          read,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Buscar dados relacionados separadamente se necessário
      const notificationsWithRelated = await Promise.all(
        (data || []).map(async (notification) => {
          let video = null;
          let related_user = null;

          // Buscar dados do vídeo se existir
          if (notification.video_id) {
            const { data: videoData } = await supabase
              .from('videos')
              .select('titulo, sistema')
              .eq('id', notification.video_id)
              .single();
            video = videoData;
          }

          // Buscar dados do usuário relacionado se existir
          if (notification.related_user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', notification.related_user_id)
              .single();
            related_user = userData;
          }

          return {
            ...notification,
            video,
            related_user
          };
        })
      );

      setNotifications(notificationsWithRelated);
      const unread = notificationsWithRelated.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  };

  // Cleanup de canal anterior
  const cleanupChannel = () => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.log('Erro ao remover canal (esperado se já foi removido):', error);
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  };

  // Configurar subscription apenas uma vez por usuário
  useEffect(() => {
    if (!user?.id) {
      cleanupChannel();
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Se já existe uma subscrição para este usuário, não criar outra
    if (isSubscribedRef.current && channelRef.current) {
      return;
    }

    // Limpar canal anterior
    cleanupChannel();

    // Buscar notificações iniciais
    fetchNotifications();

    // Criar novo canal com nome único
    const channelName = `notifications-${user.id}-${Date.now()}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Nova notificação recebida:', payload);
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          console.log('Status da subscrição:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Erro ao criar canal de notificações:', error);
    }

    return () => {
      cleanupChannel();
    };
  }, [user?.id]); // Apenas quando o ID do usuário muda

  const value: NotificationContextType = {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 