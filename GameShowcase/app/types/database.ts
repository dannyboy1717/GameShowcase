import { Game } from "./supabase";

export interface Database {
  public: {
    Tables: {
      Games: {
        Row: Game;
        Insert: Omit<Game, "id">;
        Update: Partial<Omit<Game, "id">>;
      };
    };
  };
}