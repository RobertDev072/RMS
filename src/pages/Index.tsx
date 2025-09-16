import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import RijschoolHeader from "@/components/RijschoolHeader";
import HeroSection from "@/components/HeroSection";
import LoginModal from "@/components/LoginModal";
import EnhancedAdminDashboard from "@/components/dashboards/EnhancedAdminDashboard";
import EnhancedInstructorDashboard from "@/components/dashboards/EnhancedInstructorDashboard";
import EnhancedStudentDashboard from "@/components/dashboards/EnhancedStudentDashboard";

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  const handleGetStarted = () => {
    setIsLoginModalOpen(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // Show dashboard based on user role
  if (user && profile) {
    switch (profile.role) {
      case 'admin':
        return <EnhancedAdminDashboard userName={profile.full_name} onLogout={signOut} />;
      case 'instructor':
        return <EnhancedInstructorDashboard userName={profile.full_name} onLogout={signOut} />;
      case 'student':
        return <EnhancedStudentDashboard userName={profile.full_name} onLogout={signOut} />;
    }
  }

  // Show landing page
  return (
    <div className="min-h-screen bg-background">
      <RijschoolHeader
        onLoginClick={() => setIsLoginModalOpen(true)}
        onRegisterClick={() => setIsLoginModalOpen(true)}
      />
      
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default Index;