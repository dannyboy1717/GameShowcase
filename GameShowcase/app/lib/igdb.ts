import { supabase } from "./supabase";
import { GamePlatform } from "../types/supabase";

/** Normalized game returned by the igdb-search Edge Function. */
export type IgdbGame = {
  id: number;
  name: string;
  releaseYear: number | null;
  developer: string | null;
  coverUrl: string | null;
  thumbUrl: string | null;
  /** Raw IGDB platform names — map with mapIgdbPlatforms before use. */
  platforms: string[];
};

/**
 * IGDB tracks far more platforms than this app does, and names them
 * differently. Keys are verified against IGDB's /v4/platforms list.
 *
 * Anything absent is dropped rather than guessed at — the GamePlatform union
 * has no entry for N64, NES, GameCube, Game Boy, Linux, mobile or VR, so those
 * simply don't preselect and the user picks a platform in the form.
 */
const IGDB_PLATFORM_MAP: Record<string, GamePlatform> = {
  "PC (Microsoft Windows)": "PC",

  Xbox: "Xbox",
  "Xbox 360": "Xbox",
  "Xbox One": "Xbox",
  "Xbox Series X|S": "Xbox",

  PlayStation: "PS1",
  "PlayStation 2": "PS2",
  "PlayStation 3": "PS3",
  "PlayStation 4": "PS4",
  "PlayStation 5": "PS5",
  "PlayStation Vita": "PS Vita",
  "PlayStation Portable": "PSP",

  "Nintendo Switch": "Switch",
  "Nintendo Switch 2": "Switch 2",
  "Nintendo 3DS": "3DS",
  "New Nintendo 3DS": "3DS",
  "Nintendo DS": "DS",
  "Nintendo DSi": "DS",
  "Game Boy Advance": "GBA",
  "Super Nintendo Entertainment System": "SNES",
  "Super Famicom": "SNES",
};

/**
 * Maps IGDB platform names onto the platforms this app supports, preserving
 * IGDB's ordering and dropping unknown entries. Duplicates are collapsed, since
 * several IGDB platforms can map to the same one here (e.g. every Xbox).
 */
export function mapIgdbPlatforms(names: string[]): GamePlatform[] {
  const mapped = names
    .map((name) => IGDB_PLATFORM_MAP[name])
    .filter((platform): platform is GamePlatform => Boolean(platform));

  return Array.from(new Set(mapped));
}

/**
 * Searches IGDB via the Edge Function, which holds the API credentials.
 *
 * Never throws: search is an optional convenience on top of manual entry, so a
 * failure here degrades to an empty result list rather than blocking the user
 * from adding a game.
 */
export async function searchIgdbGames(query: string): Promise<IgdbGame[]> {
  try {
    const { data, error } = await supabase.functions.invoke<{ results?: IgdbGame[] }>("igdb-search", {
      body: { query },
    });

    if (error) {
      console.warn("IGDB search failed:", error.message);
      return [];
    }

    return data?.results ?? [];
  } catch (err) {
    console.warn("IGDB search failed:", err);
    return [];
  }
}
