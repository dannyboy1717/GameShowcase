"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "@/app/lib/supabase";

type AuthSessionContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthSessionContext = createContext<AuthSessionContextType | undefined>(undefined);

/**
 * Holds the single source of auth truth for the app.
 *
 * This was previously a plain hook, which meant every call site ran its own
 * getSession() and registered its own onAuthStateChange subscription — four
 * copies of the same state that could drift out of sync during sign-in or
 * sign-out. One provider keeps a single subscription.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthSessionContextType>(() => ({ user, session, loading }), [user, session, loading]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession(): AuthSessionContextType {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }

  return context;
}
