import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import 'react-native-url-polyfill/auto'
import Auth from '../components/Auth'
import { getSupabase } from '../lib/supabase'

export default function UserManagement() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let unsubscribe: () => void

    const init = async () => {
      console.log("Initializing Supabase...");
      const supabase = await getSupabase();

      console.log("Getting session...");
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      console.log("Session:", session);
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      })

      console.log("Setting up auth listener...");
      unsubscribe = listener?.subscription.unsubscribe;
      setReady(true);
    }

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    }
  }, [])

  if (!ready) {
    return <Text>Loading Supabase...</Text>
  }

  return (
    <View className="bg-white dark:bg-black min-h-screen">
      {!session && <Auth />}
      {session && session.user && <Text className="text-black dark:text-white">{session.user.id}</Text>}
    </View>
  )
}
