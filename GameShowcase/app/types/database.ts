import { Game } from "./supabase";

export interface Database {
  public: {
    Tables: {
      Games: {
        Row: Game;
        Insert: Omit<Game, "id">;
        // user_id is excluded so an edit can never reassign ownership.
        Update: Partial<Omit<Game, "id" | "user_id">>;
      };
    };
  };
}