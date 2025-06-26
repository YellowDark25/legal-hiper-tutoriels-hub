import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  User, 
  LogOut, 
  Bell, 
  Home,
  Monitor,
  Briefcase,
  Phone,
  UserCheck
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const { user, isAdmin, userSystem, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getSystemName = (sistema: string) => {
    return sistema === 'pdvlegal' ? 'PDVLegal' : 'Hiper';
  };

  const getSystemColor = (sistema: string) => {
    return sistema === 'pdvlegal' ? '#2563EB' : '#7C3AED';
  };

  // Menu items para mobile
  const menuItems = [
    // Dashboard só aparece para admins
    ...(isAdmin ? [{ icon: Home, label: 'Dashboard', path: '/' }] : []),
    ...(isAdmin || !userSystem || userSystem === 'pdvlegal' 
      ? [{ icon: Monitor, label: 'PDVLegal', path: '/pdvlegal' }] 
      : []),
    ...(isAdmin || !userSystem || userSystem === 'hiper' 
      ? [{ icon: Briefcase, label: 'Hiper', path: '/hiper' }] 
      : []),
    { icon: Phone, label: 'Contato', path: '/contato' },
    ...(isAdmin ? [{ icon: UserCheck, label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-lg">NH</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                NexHub
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                Centro de Tutoriais
              </p>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Dashboard só aparece para admins */}
            {isAdmin && (
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
                Dashboard
            </Link>
            )}
            
            {(isAdmin || !userSystem || userSystem === 'pdvlegal') && (
              <Link
                to="/pdvlegal"
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                PDVLegal
              </Link>
            )}
            
            {(isAdmin || !userSystem || userSystem === 'hiper') && (
              <Link
                to="/hiper"
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Hiper
              </Link>
            )}
            
            <Link
              to="/contato"
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Contato
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Sistema do usuário */}
            {userSystem && !isAdmin && (
              <div className="hidden md:flex items-center">
                <Badge 
                  variant="outline" 
                  className="border-2 font-semibold"
                  style={{ 
                    borderColor: getSystemColor(userSystem),
                    color: getSystemColor(userSystem)
                  }}
                >
                  {getSystemName(userSystem)}
                </Badge>
              </div>
            )}

            {/* Notificações */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                onClick={() => setIsNotificationOpen(true)}
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                        Administrador
                      </p>
                    )}
                    {userSystem && !isAdmin && (
                      <p className="text-xs font-medium" style={{ color: getSystemColor(userSystem) }}>
                        Sistema: {getSystemName(userSystem)}
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg touch-target">
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0 bg-white dark:bg-gray-900">
                  <div className="flex flex-col h-full">
                    {/* Header do menu mobile */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">NH</span>
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-gray-900 dark:text-white">NexHub</h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Centro de Tutoriais</p>
                        </div>
                      </div>
                      
                      {/* Info do usuário no mobile */}
                      {user && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.email}
                          </p>
                          {isAdmin && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">
                              Administrador
                            </p>
                          )}
                          {userSystem && !isAdmin && (
                            <div className="flex items-center mt-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs border-2 font-semibold"
                                style={{ 
                                  borderColor: getSystemColor(userSystem),
                                  color: getSystemColor(userSystem)
                                }}
                              >
                                {getSystemName(userSystem)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation items */}
                    <nav className="flex-1 px-6 py-4">
                      <div className="space-y-2">
                        {menuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium touch-target group"
                          >
                            <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </nav>

                    {/* Theme toggle e notificações no mobile */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
                        <ThemeToggle />
                      </div>
                      
                      {user && (
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificações</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg touch-target"
                            onClick={() => setIsNotificationOpen(true)}
                          >
                            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            {unreadCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                              >
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Logout no mobile */}
                      {user && (
                        <Button
                          onClick={handleSignOut}
                          variant="outline"
                          className="w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 touch-target"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </header>
  );
};

export default Header;
