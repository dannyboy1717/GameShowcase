import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { getSupabase } from '../lib/supabase'
import Auth from '../components/Auth'
import { View, Text } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function AddGames() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let unsubscribe: () => void

    // we define an inner async function because useEffect can't be async directly
    const init = async () => {
      const supabase = await getSupabase()

      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

      unsubscribe = listener?.subscription.unsubscribe
      setReady(true)
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  if (!ready) {
    return <Text>Loading Supabase...</Text>
  }

  return (
    <View>
      <Auth />
      {session && session.user && <Text>{session.user.id}</Text>}
    </View>
  )
}
