import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'student';
  phone?: string;
  address?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile - create if missing
          setTimeout(async () => {
            try {
              // First try to ensure profile exists (for existing users)
              await supabase.rpc('ensure_profile');
              
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

              if (error) {
                console.error('Error fetching profile:', error);
                return;
              }

              setProfile(profileData as Profile);
            } catch (error) {
              console.error('Error in auth state change:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile - create if missing
        setTimeout(async () => {
          try {
            // First try to ensure profile exists (for existing users)
            await supabase.rpc('ensure_profile');
            
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (error) {
              console.error('Error fetching profile:', error);
              setLoading(false);
              return;
            }

            setProfile(profileData as Profile);
          } catch (error) {
            console.error('Error fetching initial profile:', error);
          }
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'instructor' | 'student' = 'student') => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            role: role
          },
          skipConfirmation: true
        }
      });

      if (error) {
        toast({
          title: "Registratie mislukt",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Registratie succesvol",
        description: "Account is direct geactiveerd en klaar voor gebruik.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: "Inloggen mislukt",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Succesvol ingelogd",
        description: "Welkom terug!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Inloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Uitloggen mislukt",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd.",
      });
    } catch (error: any) {
      toast({
        title: "Uitloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };
};