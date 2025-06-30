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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-200">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/ChatGPT Image 18 de jun. de 2025, 16_43_11.png"
              alt="NexHub Logo"
              className="h-10 w-auto sm:h-12 object-contain max-w-[140px] sm:max-w-[180px] md:max-w-none"
              loading="eager"
            />
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Dashboard só aparece para admins */}
            {isAdmin && (
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium text-sm"
            >
                Dashboard
            </Link>
            )}
            
            {(isAdmin || !userSystem || userSystem === 'pdvlegal') && (
              <Link
                to="/pdvlegal"
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium text-sm"
              >
                PDVLegal
              </Link>
            )}
            
            {(isAdmin || !userSystem || userSystem === 'hiper') && (
              <Link
                to="/hiper"
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium text-sm"
              >
                Hiper
              </Link>
            )}
            
            <Link
              to="/contato"
              className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium text-sm"
            >
              Contato
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium text-sm"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            
            {/* Sistema do usuário */}
            {userSystem && !isAdmin && (
              <div className="hidden sm:flex items-center">
                <Badge 
                  variant="outline" 
                  className="border-2 font-semibold text-xs"
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
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full touch-target-sm"
                onClick={() => setIsNotificationOpen(true)}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs"
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
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2 touch-target-sm">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
                  <Button variant="ghost" size="sm" className="p-2 touch-target-sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[300px] safe-top safe-bottom">
                  <div className="flex flex-col h-full">
                    {/* Header do Sheet com informações do usuário */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
                      </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 space-y-2">
                      {menuItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.path}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 touch-target"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </nav>

                    {/* Footer do Sheet */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 touch-target"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sair
                      </Button>
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
