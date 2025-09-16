import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Seed = () => {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      setStatus("running");
      const { data, error } = await supabase.functions.invoke("seed_test_users");
      if (error) {
        setStatus("error");
        setMessage(error.message ?? "Er ging iets mis");
      } else {
        setStatus("done");
        setMessage(JSON.stringify(data, null, 2));
      }
    };
    run();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Testaccounts aanmaken</h1>
      <p className="mb-4">Deze pagina maakt drie testaccounts aan (admin, instructeur en leerling).</p>
      <ul className="mb-4 list-disc pl-6 space-y-1">
        <li>admin@rijschool.pro / Test1234!</li>
        <li>instructor@rijschool.pro / Test1234!</li>
        <li>student@rijschool.pro / Test1234!</li>
      </ul>
      <p className="mb-6">Log hierna in via de Inloggen-knop op de homepage.</p>
      <pre className="bg-muted p-3 rounded-md overflow-auto text-sm">
        {status === "running" ? "Bezig met aanmaken..." : message}
      </pre>
    </main>
  );
};

export default Seed;
