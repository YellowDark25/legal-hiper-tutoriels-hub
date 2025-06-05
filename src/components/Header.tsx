
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserIcon, LogOutIcon } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-primary shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-white font-bold text-xl hover:text-accent-300 transition-colors">
            Tutoriais PDV & Hiper
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className={`text-white hover:text-accent-300 transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') ? 'bg-primary-700 text-accent-300' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/pdvlegal"
              className={`text-white hover:text-accent-300 transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/pdvlegal') ? 'bg-primary-700 text-accent-300' : ''
              }`}
            >
              PDVLegal
            </Link>
            <Link
              to="/hiper"
              className={`text-white hover:text-accent-300 transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/hiper') ? 'bg-primary-700 text-accent-300' : ''
              }`}
            >
              Hiper
            </Link>
            <Link
              to="/contato"
              className={`text-white hover:text-accent-300 transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/contato') ? 'bg-primary-700 text-accent-300' : ''
              }`}
            >
              Contato
            </Link>

            {/* User Authentication */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="text-white hover:text-accent-300 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <UserIcon className="w-4 h-4" />
                  Perfil
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-white hover:text-accent-300 hover:bg-primary-700"
                >
                  <LogOutIcon className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="secondary" size="sm">
                  Entrar
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-accent-300 focus:outline-none focus:text-accent-300"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
              ) : (
                <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary-700 animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className={`text-white hover:text-accent-300 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-primary-800 text-accent-300' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/pdvlegal"
                className={`text-white hover:text-accent-300 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/pdvlegal') ? 'bg-primary-800 text-accent-300' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                PDVLegal
              </Link>
              <Link
                to="/hiper"
                className={`text-white hover:text-accent-300 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/hiper') ? 'bg-primary-800 text-accent-300' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Hiper
              </Link>
              <Link
                to="/contato"
                className={`text-white hover:text-accent-300 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/contato') ? 'bg-primary-800 text-accent-300' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>

              {/* Mobile User Authentication */}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-white hover:text-accent-300 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-white hover:text-accent-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-white hover:text-accent-300 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
