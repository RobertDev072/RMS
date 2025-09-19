import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const CreateTestUsers = () => {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const createUsers = async () => {
    setStatus("running");
    setMessage("Bezig met aanmaken van testgebruikers...");
    
    try {
      const { data, error } = await supabase.functions.invoke("seed_test_users");
      
      if (error) {
        setStatus("error");
        setMessage(error.message ?? "Er ging iets mis bij het aanmaken van gebruikers");
      } else {
        setStatus("done");
        const results = data?.results || [];
        let successMessage = "Testgebruikers aangemaakt:\n\n";
        
        results.forEach((result: any) => {
          if (result.ok) {
            successMessage += `✅ ${result.email} - Succesvol aangemaakt\n`;
          } else {
            successMessage += `❌ ${result.email} - Fout: ${result.error}\n`;
          }
        });
        
        setMessage(successMessage);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(`Onverwachte fout: ${err.message}`);
    }
  };

  useEffect(() => {
    createUsers();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === "running" && <Loader2 className="h-5 w-5 animate-spin" />}
              {status === "done" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
              Testgebruikers Aanmaken
            </CardTitle>
            <CardDescription>
              Deze pagina maakt automatisch drie testaccounts aan voor de rijschool applicatie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Te maken accounts:</h3>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Admin:</strong> admin@rijschool.pro / Test1234!</li>
                <li>• <strong>Instructeur:</strong> instructor@rijschool.pro / Test1234!</li>
                <li>• <strong>Student:</strong> student@rijschool.pro / Test1234!</li>
              </ul>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{message}</pre>
            </div>
            
            {status === "error" && (
              <Button onClick={createUsers} className="w-full">
                Opnieuw proberen
              </Button>
            )}
            
            {status === "done" && (
              <div className="text-center">
                <p className="text-green-600 mb-4">✅ Klaar! Je kunt nu inloggen met de testaccounts.</p>
                <Button onClick={() => window.location.href = "/"}>
                  Ga naar Homepage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTestUsers;