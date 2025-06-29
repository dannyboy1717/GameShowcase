import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Game } from '../types/Game';

let supabaseClient: SupabaseClient | undefined;
let initPromise: Promise<void> | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (supabaseClient) { console.log("got client"); return supabaseClient; }
  if (!initPromise) initPromise = initSupabase();
  await initPromise;
  return supabaseClient!;
}

export async function initSupabase() {
  const { supabaseAnonKey, supabaseUrl } = await getSupabaseDetails();
  if (!supabaseAnonKey || !supabaseUrl) {
    console.log("Supabase details are not available");
    throw new Error("Supabase details are not available");
  }
  
  console.log("Initializing Supabase with URL:", supabaseUrl, "and Anon Key:", supabaseAnonKey);
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

async function getSupabaseDetails() {
  // TODO: Replace with env variable
  const SECRET = "Persona4BestGame";
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

export async function getGames(): Promise<Game[] | undefined> {
  console.log("Fetching games from Supabase...");
  const supabase = await getSupabase();
  let { data, error } = await supabase
                                .from('Games')
                                .select('*')
                                .order('id');
  if (error) {
    console.error("Error fetching games:", error);
    throw error;
  }

  if (data) {
    console.log("Fetched games:", (data as Game[]).length);
    return data as Game[];
  }
}