"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

const Context = createContext<{ session: Session | null }>({ session: null });

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
      
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && pathname !== '/login') {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return (
    <Context.Provider value={{ session }}>
      {children}
    </Context.Provider>
  );
}

export const useSession = () => useContext(Context);