import { Button } from "@/components/ui/button";
import { Car, Menu, User } from "lucide-react";
import { useState } from "react";

interface RijschoolHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const RijschoolHeader = ({ onLoginClick, onRegisterClick }: RijschoolHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Rijschool Pro</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">
            Functies
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">
            Prijzen
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-smooth">
            Contact
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={onLoginClick}>
            Inloggen
          </Button>
          <Button 
            onClick={onRegisterClick}
            className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-button"
          >
            Gratis Proberen
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border md:hidden animate-slide-up">
            <div className="container mx-auto p-4 space-y-4">
              <nav className="space-y-3">
                <a href="#features" className="block py-2 text-muted-foreground hover:text-foreground">
                  Functies
                </a>
                <a href="#pricing" className="block py-2 text-muted-foreground hover:text-foreground">
                  Prijzen
                </a>
                <a href="#contact" className="block py-2 text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </nav>
              <div className="flex flex-col gap-3 pt-3 border-t border-border">
                <Button variant="ghost" onClick={onLoginClick} className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Inloggen
                </Button>
                <Button 
                  onClick={onRegisterClick}
                  className="w-full bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-button"
                >
                  Gratis Proberen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default RijschoolHeader;