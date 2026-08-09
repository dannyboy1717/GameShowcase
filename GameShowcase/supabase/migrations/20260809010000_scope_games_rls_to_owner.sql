-- Scope the Games policy to the row owner.
--
-- The previous policy was `using (true) with check (true)` for the
-- authenticated role, which let any signed-in user read, modify and delete
-- every other user's library. Signup is self-serve, so that was reachable by
-- anyone.
--
-- PREREQUISITE: no rows may have a null user_id, or they become invisible to
-- everyone the moment this runs:
--   select count(*) from "Games" where user_id is null;

-- Guard rather than silently orphaning data.
do $$
begin
  if exists (select 1 from "Games" where user_id is null) then
    raise exception 'Games rows exist with a null user_id — backfill them before scoping the policy';
  end if;
end $$;

alter table "Games" enable row level security;

alter policy "Enable all for authenticated users only"
on "public"."Games"
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Belt and braces. addGame in hooks/useGames.tsx now sets user_id explicitly,
-- but this column had no default at all, which is how rows were being inserted
-- with a null owner and becoming invisible to the very user who created them.
-- Any future insert path that forgets user_id now gets a correct one instead of
-- silently orphaning a row.
alter table "Games" alter column user_id set default auth.uid();

-- A null user_id would satisfy no policy and be unreachable, so forbid it.
alter table "Games" alter column user_id set not null;
