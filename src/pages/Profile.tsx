
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserProfile from '@/components/user/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 py-8">
          <UserProfile />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
