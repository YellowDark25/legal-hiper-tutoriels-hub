import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
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
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-primary-700 font-medium truncate max-w-[160px]" title={user.email || ''}>
                  {user.email}
                </span>
              )}
              {user && isAdmin && (
                <Link 
                  to="/admin" 
                  className={`text-primary-700 hover:text-secondary transition-colors font-medium flex items-center space-x-1 px-3 py-1 rounded border border-primary-200 bg-primary-50 hover:bg-primary-100 ${
                    isActive('/admin') ? 'text-secondary border-secondary' : ''
                  }`}
                >
                  <ShieldIcon className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary text-white font-bold hover:bg-primary-800 transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
