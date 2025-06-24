import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ThemeProvider from "@/contexts/ThemeProvider";
import Index from "./pages/Index";
import PDVLegal from "./pages/PDVLegal";
import Hiper from "./pages/Hiper";
import Contato from "./pages/Contato";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper para proteger rotas públicas (clientes)
function ClientProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  // Se não está logado, redireciona para login
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<ClientProtectedRoute><Index /></ClientProtectedRoute>} />
                <Route path="/pdvlegal" element={<ClientProtectedRoute><PDVLegal /></ClientProtectedRoute>} />
                <Route path="/hiper" element={<ClientProtectedRoute><Hiper /></ClientProtectedRoute>} />
                <Route path="/contato" element={<ClientProtectedRoute><Contato /></ClientProtectedRoute>} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
