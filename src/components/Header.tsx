import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

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
            </nav>
          </div>

          {/* Removido completamente o sistema de login do cliente */}
          <div className="flex items-center">
            <span className="text-sm text-primary-600">
              Sistema restrito à equipe administrativa
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
