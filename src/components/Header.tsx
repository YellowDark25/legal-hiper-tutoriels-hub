
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import NotificationPanel from './NotificationPanel';
import { UserIcon, LogOutIcon } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-primary">
              TutorialHub
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className={`text-gray-700 hover:text-primary transition-colors ${
                  isActive('/') ? 'text-primary font-medium' : ''
                }`}
              >
                Início
              </Link>
              <Link 
                to="/pdvlegal" 
                className={`text-gray-700 hover:text-primary transition-colors ${
                  isActive('/pdvlegal') ? 'text-primary font-medium' : ''
                }`}
              >
                PDV Legal
              </Link>
              <Link 
                to="/hiper" 
                className={`text-gray-700 hover:text-primary transition-colors ${
                  isActive('/hiper') ? 'text-primary font-medium' : ''
                }`}
              >
                Hiper
              </Link>
              <Link 
                to="/contato" 
                className={`text-gray-700 hover:text-primary transition-colors ${
                  isActive('/contato') ? 'text-primary font-medium' : ''
                }`}
              >
                Contato
              </Link>
              {user && (
                <Link 
                  to="/admin" 
                  className={`text-gray-700 hover:text-primary transition-colors ${
                    isActive('/admin') ? 'text-primary font-medium' : ''
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationPanel />
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Perfil
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
