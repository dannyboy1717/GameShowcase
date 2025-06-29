export interface Game {
  id: number;
  Name: string;
  Platform: string;
  Started: string | null;
  Finished: string | null;
  Status: string;
  Rating: number | null;
  Playtime: string | null;
  "Developer/Publisher": string | null;
  Cost: string | null;
  Comments: string | null;
  Bought: string | null;
}