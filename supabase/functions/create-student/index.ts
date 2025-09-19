import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, full_name, phone, license_type } = requestBody;

    // Validate required fields
    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: "Email, wachtwoord en naam zijn verplicht" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Wachtwoord moet minimaal 6 karakters lang zijn" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const { data: existingUser } = await adminClient.auth.admin.listUsers();
    const userExists = existingUser.users.some(u => u.email === cleanEmail);
    
    if (userExists) {
      return new Response(
        JSON.stringify({ error: "Een gebruiker met dit e-mailadres bestaat al" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user with admin client (bypasses email confirmation)
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: full_name,
        role: 'student'
      }
    });

    if (userError) {
      console.error("User creation error:", userError);
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "Gebruiker aanmaken mislukt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: userData.user.id,
        email: cleanEmail,
        full_name: full_name,
        phone: phone || null,
        role: 'student'
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up user if profile creation fails
      await adminClient.auth.admin.deleteUser(userData.user.id);
      return new Response(
        JSON.stringify({ error: `Profiel aanmaken mislukt: ${profileError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the created profile
    const { data: profile, error: profileFetchError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('user_id', userData.user.id)
      .single();

    if (profileFetchError || !profile) {
      console.error("Profile fetch error:", profileFetchError);
      await adminClient.auth.admin.deleteUser(userData.user.id);
      return new Response(
        JSON.stringify({ error: "Profiel ophalen mislukt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create student record
    const { error: studentError } = await adminClient
      .from('students')
      .insert({
        profile_id: profile.id,
        license_type: license_type || 'B',
        theory_exam_passed: false,
        lessons_remaining: 0
      });

    if (studentError) {
      console.error("Student creation error:", studentError);
      // Clean up user and profile if student creation fails
      await adminClient.auth.admin.deleteUser(userData.user.id);
      return new Response(
        JSON.stringify({ error: `Student record aanmaken mislukt: ${studentError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userData.user.id,
        email: cleanEmail,
        message: "Leerling succesvol aangemaakt en kan direct inloggen"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unexpected error in create-student function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Onbekende fout opgetreden" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});