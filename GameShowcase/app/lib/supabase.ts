import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import { Game } from '../types/Game';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

let supabaseClient: SupabaseClient

// This function will be called ONCE when the app starts.
export async function initializeSupabase(): Promise<SupabaseClient> {
  if (supabaseClient) return supabaseClient

  const SECRET = 'Persona4BestGame'
  const timestamp = Date.now().toString()
  const hash = CryptoJS.HmacSHA256(timestamp, SECRET).toString()
  const headers = new Headers()
  headers.append('x-timestamp', timestamp)
  headers.append('x-api-key', `HMAC ${hash}`)

  console.log('Fetching Supabase credentials from API...')
  const response = await fetch('https://danhug.com/api/games', {
    method: 'GET',
    headers: headers,
  });
  console.log("Got those credentials!!");

  if (!response.ok) {
    throw new Error('Failed to fetch Supabase credentials from API.')
  }

  const json = await response.json()
  const { key, url } = json

  if (!key || !url) {
    throw new Error('Invalid Supabase credentials received from API.')
  }

  supabaseClient = createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })

  AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabaseClient.auth.startAutoRefresh()
    } else {
      supabaseClient.auth.stopAutoRefresh()
    }
  })

  return supabaseClient
}

// This is the function your hooks and components will use.
// It's synchronous and assumes initialization is already done.
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client has not been initialized yet.')
  }
  return supabaseClient
}

type FetchResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

export async function getGamesAsync(): Promise<FetchResult<Game[]>> {
  console.log("Fetching games from Supabase...");
  let supabaseInstance;
  try {
    supabaseInstance = await getSupabase();
  } catch (initError) {
    console.error("Error initializing Supabase client:", initError);
    return { data: null, error: new Error("Failed to initialize Supabase client.") };
  }

  try {
    const { data, error } = await supabaseInstance
      .from("Games")
      .select("*")
      .order("id");

    if (error) {
      console.error("Error fetching games:", error);
      // Return with error and null data
      return { data: null, error: error };
    }

    const gamesData: Game[] = (data as Game[]) || [];
    console.log("Fetched games:", gamesData.length);
    return { data: gamesData, error: null };

  } catch (e: any) {
    console.error("Unexpected error during games fetch:", e);
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

async function fetchGames(): Promise<Game[]> {
  const supabase = getSupabase() // Synchronous call
  const { data, error } = await supabase
    .from('Games') // Note: Supabase table names are case-sensitive
    .select('*')

  if (error) throw error
  console.log("Fetched games from Supabase:", data?.length);
  return data || []
}

export function useGames() {
  const client = useQueryClient()

  const query = useQuery<Game[], Error>({
    queryKey: ['games'], // Use lowercase for query keys by convention
    queryFn: fetchGames,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  useEffect(() => {
    const supabase = getSupabase() // Synchronous call

    const channel = supabase
      .channel('public-games-channel') // Give the channel a unique name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Games' },
        () => {
          client.invalidateQueries({ queryKey: ['games'] })
        }
      )
      .subscribe()

    // The cleanup function is now also fully synchronous.
    return () => {
      supabase.removeChannel(channel)
    }
  }, [client])
  return query;
}