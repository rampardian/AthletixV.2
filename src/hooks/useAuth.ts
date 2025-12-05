import { useState, useEffect } from 'react';
import { supabase } from '@/utilities/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session fetch error:', error);
          // Clear invalid session data
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          setSession(null);
        } else {
          setSession(session);
        }
      } catch (err) {
        console.error('Unexpected session error:', err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event); // Helpful for debugging

        switch (event) {
          case 'SIGNED_IN':
            setSession(session);
            break;

          case 'SIGNED_OUT':
          case 'USER_DELETED':
            setSession(null);
            // Clear local storage
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            break;

          case 'TOKEN_REFRESHED':
            // Token was successfully refreshed
            setSession(session);
            break;

          case 'USER_UPDATED':
            setSession(session);
            break;

          default:
            setSession(session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      // Clear local storage
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
    } catch (err) {
      console.error('Logout error:', err);
      // Force clear even if signOut fails
      setSession(null);
      localStorage.clear();
    }
  };

  return { session, user: session?.user, loading, signOut };
}