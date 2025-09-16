import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import RijschoolHeader from "@/components/RijschoolHeader";
import HeroSection from "@/components/HeroSection";
import LoginModal from "@/components/LoginModal";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import InstructorDashboard from "@/components/dashboards/InstructorDashboard";
import StudentDashboard from "@/components/dashboards/StudentDashboard";

interface User {
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student';
}

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleLogin = (email: string, password: string, role: string) => {
    // Demo login logic - in real app this would use Supabase Auth
    const demoUsers: Record<string, User> = {
      "admin@demo.nl": { email: "admin@demo.nl", name: "Administrateur", role: "admin" },
      "instructeur@demo.nl": { email: "instructeur@demo.nl", name: "Jan Pietersen", role: "instructor" },
      "leerling@demo.nl": { email: "leerling@demo.nl", name: "Emma van der Berg", role: "student" }
    };

    const foundUser = demoUsers[email];
    if (foundUser && (password === "admin123" || password === "inst123" || password === "leer123")) {
      setUser(foundUser);
      setIsLoginModalOpen(false);
      toast({
        title: "Succesvol ingelogd",
        description: `Welkom terug, ${foundUser.name}!`,
      });
    } else {
      toast({
        title: "Inloggen mislukt",
        description: "Controleer je e-mailadres en wachtwoord.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
  };

  const handleGetStarted = () => {
    setIsLoginModalOpen(true);
  };

  // Show dashboard based on user role
  if (user) {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard userName={user.name} onLogout={handleLogout} />;
      case 'instructor':
        return <InstructorDashboard userName={user.name} onLogout={handleLogout} />;
      case 'student':
        return <StudentDashboard userName={user.name} onLogout={handleLogout} />;
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
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;