import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Car, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "student" as 'admin' | 'instructor' | 'student',
    phone: "",
  });

  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setLoading(true);
    const result = await signIn(loginEmail, loginPassword);
    setLoading(false);

    if (!result.error) {
      onClose();
      setLoginEmail("");
      setLoginPassword("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.name) return;
    
    if (registerData.password !== registerData.confirmPassword) {
      alert("Wachtwoorden komen niet overeen");
      return;
    }

    setLoading(true);
    const result = await signUp(registerData.email, registerData.password, registerData.name, registerData.role);
    setLoading(false);

    if (!result.error) {
      onClose();
      setRegisterData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        role: "student",
        phone: "",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header */}
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Rijschool Pro</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w/full grid-cols-1 mb-6">
                <TabsTrigger value="login">Inloggen</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle>Welkom terug</CardTitle>
                    <CardDescription>
                      Log in om toegang te krijgen tot je rijschool dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">E-mailadres</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="jouw@email.nl"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Wachtwoord</Label>
                        <div className="relative mt-1">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Je wachtwoord"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-button"
                        disabled={loading}
                      >
                        {loading ? 'Inloggen...' : 'Inloggen'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;