import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js'
import { useEffect } from 'react';
import CryptoJS from 'crypto-js';

let supabaseClient: SupabaseClient | undefined;
let initPromise: Promise<void> | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (supabaseClient) return supabaseClient;
  if (!initPromise) initPromise = initSupabase();
  await initPromise;
  return supabaseClient!;
}

export async function initSupabase() {
  const { supabaseAnonKey, supabaseUrl } = await getSupabaseTable();
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabaseClient!.auth.startAutoRefresh();
    } else {
      supabaseClient!.auth.stopAutoRefresh();
    }
  });
}

async function getSupabaseTable() {
  const SECRET = 'Persona4BestGame';
  const timestamp = Date.now().toString();
  const hash = CryptoJS.HmacSHA256(timestamp, SECRET).toString();
  const headers = new Headers();
  headers.append('x-timestamp', timestamp);
  headers.append('x-api-key', `HMAC ${hash}`);
  const response = await fetch("https://danhug.com/api/games", {
    method: "GET",
    headers: headers,
  });
  const json = await response.json();
  const { key, url } = json;
  
  if (!key || !url) {
    throw new Error("Could not get supabase info from danhug.com");
  }
  return { supabaseAnonKey: key, supabaseUrl: url };
}