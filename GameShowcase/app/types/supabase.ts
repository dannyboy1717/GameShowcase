export type GameStatus = 
  | "Started" 
  | "Finished" 
  | "Completed" 
  | "Continuous" 
  | "Dropped" 
  | "Paused" 
  | "Plan to Play";
  
export type GamePlatform =
  | "Xbox"
  | "PS5"
  | "PS4"
  | "PS3"
  | "PS2"
  | "PS1"
  | "PC"
  | "PS Vita"
  | "PSP"
  | "3DS"
  | "DS"
  | "Switch"
  | "GBA"
  | "SNES"
  | "Switch 2";

export interface Game {
  id: number;
  /**
   * Owner. Every read is filtered by this and the RLS policy keys off it, so a
   * row without it is invisible to everyone — including the person who created
   * it. Always set explicitly on insert rather than trusting a column default.
   */
  user_id: string;
  Name: string | null;
  Started: string | null;
  Finished: string | null;
  Rating: number | null;
  Status: GameStatus | null;
  "Developer/Publisher": string | null;
  Platform: GamePlatform | null;
  Playtime: string | null;
  Bought: string | null;
  Cost: string | null;
  Comments: string | null;
  IgdbId: number | null;
  CoverUrl: string | null;
}