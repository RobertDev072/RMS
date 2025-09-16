import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import heroImage from "@/assets/hero-driving-school.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Professioneel
            <br />
            <span className="bg-gradient-to-r from-white to-accent-foreground bg-clip-text text-transparent">
              Rijschool Management
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Beheer lessen, instructeurs en leerlingen met onze mobiel-geoptimaliseerde 
            app. Integratie met CBR, automatische planning en real-time beschikbaarheid.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-primary hover:bg-white/90 shadow-elevated text-lg px-8 py-3 h-auto"
            >
              Start Vandaag
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3 h-auto"
            >
              Bekijk Demo
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Slimme Planning</h3>
              <p className="text-white/80 text-sm text-center">
                Automatische conflict-detectie en optimale tijdslots
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Real-time Updates</h3>
              <p className="text-white/80 text-sm text-center">
                Direct notificaties voor wijzigingen en herinneringen
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Multi-gebruiker</h3>
              <p className="text-white/80 text-sm text-center">
                Aparte dashboards voor admins, instructeurs en leerlingen
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm">CBR Gecertificeerd</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;