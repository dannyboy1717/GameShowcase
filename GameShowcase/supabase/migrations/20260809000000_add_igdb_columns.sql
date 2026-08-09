-- Store the IGDB match for a game, when one was picked from search.
-- Both columns are nullable: games added manually (and every pre-existing row)
-- simply leave them null.

alter table "Games"
  add column if not exists "IgdbId"   bigint,
  add column if not exists "CoverUrl" text;
