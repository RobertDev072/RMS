import "https://deno.land/x/xhr@0.4.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const users = [
    { email: "admin@rijschool.pro", password: "Test1234!", full_name: "Rijschool Admin", role: "admin" },
    { email: "instructor@rijschool.pro", password: "Test1234!", full_name: "Rijinstructeur", role: "instructor" },
    { email: "student@rijschool.pro", password: "Test1234!", full_name: "Leerling", role: "student" },
  ];

  const results: Array<{ email: string; id: string | null; ok: boolean; error: string | null }> = [];

  for (const u of users) {
    try {
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          full_name: u.full_name,
          role: u.role,
        },
      });

      if (error) {
        results.push({ email: u.email, id: null, ok: false, error: error.message });
      } else {
        results.push({ email: u.email, id: data.user?.id ?? null, ok: true, error: null });
      }
    } catch (e: any) {
      results.push({ email: u.email, id: null, ok: false, error: e?.message ?? "unknown error" });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});