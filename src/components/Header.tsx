
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
    <header className="bg-neutral-50 shadow-sm border-b border-primary-200 fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-primary-900">
              NexHub
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className={`text-primary-700 hover:text-secondary transition-colors font-medium ${
                  isActive('/') ? 'text-secondary border-b-2 border-secondary' : ''
                }`}
              >
                Início
              </Link>
              <Link 
                to="/pdvlegal" 
                className={`text-primary-700 hover:text-secondary transition-colors font-medium ${
                  isActive('/pdvlegal') ? 'text-secondary border-b-2 border-secondary' : ''
                }`}
              >
                PDV Legal
              </Link>
              <Link 
                to="/hiper" 
                className={`text-primary-700 hover:text-secondary transition-colors font-medium ${
                  isActive('/hiper') ? 'text-secondary border-b-2 border-secondary' : ''
                }`}
              >
                Hiper
              </Link>
              <Link 
                to="/contato" 
                className={`text-primary-700 hover:text-secondary transition-colors font-medium ${
                  isActive('/contato') ? 'text-secondary border-b-2 border-secondary' : ''
                }`}
              >
                Contato
              </Link>
              {user && (
                <Link 
                  to="/admin" 
                  className={`text-primary-700 hover:text-secondary transition-colors font-medium ${
                    isActive('/admin') ? 'text-secondary border-b-2 border-secondary' : ''
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
                  <Button variant="ghost" size="sm" className="text-primary-700 hover:text-secondary hover:bg-primary-100">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Perfil
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-primary-700 hover:text-secondary hover:bg-primary-100">
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-secondary hover:bg-secondary-600 text-neutral-50">
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
