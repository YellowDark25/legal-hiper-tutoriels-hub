import { useEffect, useState, ReactNode } from 'react';
import { ThemeContext, Theme } from './theme-context';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Efeito para carregar o tema salvo ou usar a preferência do sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Aplica o tema salvo ou usa a preferência do sistema
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    // Adiciona a classe ao elemento html
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(initialTheme);
    
    setMounted(true);
    
    // Listener para mudanças na preferência de tema do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!savedTheme) { // Só atualiza se não houver tema salvo
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setTheme(newTheme);
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Função para alternar o tema
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Atualiza a classe no elemento html
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  // Não renderiza a árvore de componentes até que o tema seja carregado
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
