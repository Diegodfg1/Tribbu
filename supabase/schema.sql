-- Tribbu · esquema de Supabase (fase 2)
-- Pégalo completo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Idea general:
--   * Una familia tiene miembros: papás (role = 'parent') y cuidadores (role = 'caregiver').
--   * Los datos de la app viven en 4 tablas: kids (fichas), items (listas: bitácora, pendientes,
--     documentos, gastos, eventos…), settings (ajustes de la familia) e invites (invitaciones).
--   * Las reglas de privacidad (Row Level Security) se aplican AQUÍ, en la base de datos, no en la app.
--     Aunque alguien modifique la app, un cuidador nunca recibe lo que no le corresponde.

-- ============================================================
-- Tablas
-- ============================================================
create table if not exists public.families (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 80),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  family_id    uuid not null references public.families(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null check (role in ('parent', 'caregiver')),
  person_key   text not null,                       -- p1, p2, c1, c2… (identifica a la persona en los datos)
  display_name text not null check (char_length(display_name) between 1 and 60),
  kid_key      text,                                -- cuidadores: el niño que cuidan
  shift_from   text not null default '00:00' check (shift_from ~ '^[0-2][0-9]:[0-5][0-9]$'),
  shift_to     text not null default '23:59' check (shift_to   ~ '^[0-2][0-9]:[0-5][0-9]$'),
  created_at   timestamptz not null default now(),
  primary key (family_id, user_id),
  unique (family_id, person_key),
  unique (user_id)                                  -- cada cuenta pertenece a una sola familia
);

create table if not exists public.kids (
  family_id uuid not null references public.families(id) on delete cascade,
  key       text not null,
  data      jsonb not null,                         -- name, age, allergy, blood, ped, ins, routine
  primary key (family_id, key)
);

create table if not exists public.items (
  family_id  uuid not null references public.families(id) on delete cascade,
  collection text not null check (collection in ('tasks','myrecs','feed','shop','docs','exp','myevents','evchat')),
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (family_id, collection, id)
);

create table if not exists public.settings (
  family_id  uuid not null references public.families(id) on delete cascade,
  key        text not null,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (family_id, key)
);

create table if not exists public.invites (
  code         text primary key,
  family_id    uuid not null references public.families(id) on delete cascade,
  role         text not null check (role in ('parent', 'caregiver')),
  person_key   text not null,
  display_name text not null,
  kid_key      text,
  shift_from   text not null default '00:00',
  shift_to     text not null default '23:59',
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days',
  used_by      uuid,
  used_at      timestamptz
);

-- Claves de ajustes permitidas (se vuelve a crear para que el esquema se pueda correr otra vez).
alter table public.settings drop constraint if exists settings_key_check;
alter table public.settings add constraint settings_key_check
  check (key in ('have','cal','locs','copa','camlog','pts','mile','summary','menu'));

create index if not exists items_family_collection on public.items (family_id, collection);

-- ============================================================
-- Funciones de apoyo (security definer para evitar recursión en las reglas)
-- ============================================================
create or replace function public.is_parent(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members m
                 where m.family_id = fid and m.user_id = auth.uid() and m.role = 'parent');
$$;

create or replace function public.is_member(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members m
                 where m.family_id = fid and m.user_id = auth.uid());
$$;

-- ¿Puede la persona actual LEER esta fila de "items"?
--   papás: todo.  cuidadores: solo lo que la tabla de permisos del proyecto les concede.
create or replace function public.can_read_item(fid uuid, c text, d jsonb) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where m.family_id = fid and m.user_id = auth.uid()
      and (
        m.role = 'parent'
        or case c
          -- Bitácora: del niño que cuida, sin avisos de cámaras (parentsOnly)
          when 'feed'     then coalesce((d->>'parentsOnly')::boolean, false) = false
                               and d->>'kid' = m.kid_key
          -- Pendientes: solo los suyos
          when 'tasks'    then d->>'who' = m.person_key
          -- Conversación de un evento: de eventos del niño que cuida
          when 'evchat'   then d->>'kid' = m.kid_key
          -- Agenda: solo eventos de su turno
          when 'myevents' then d->>'kid' = m.kid_key
                               and d->>'time' >= m.shift_from and d->>'time' < m.shift_to
          -- Recetas de la familia
          when 'myrecs'   then true
          -- Documentos: solo los compartidos (y del niño que cuida o de toda la familia)
          when 'docs'     then coalesce((d->>'shared')::boolean, false)
                               and (d->>'kid' is null or d->>'kid' = m.kid_key)
          -- Compras ('shop') y gastos ('exp'): nunca
          else false
        end
      )
  );
$$;

-- ¿Puede un CUIDADOR escribir esta fila? (los papás se validan aparte)
create or replace function public.caregiver_can_write(fid uuid, c text, d jsonb)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.members m
    where m.family_id = fid and m.user_id = auth.uid() and m.role = 'caregiver'
      and case c
        -- Registrar en la bitácora: a su nombre, del niño que cuida, nunca "solo papás"
        when 'feed'   then d->>'who' = m.person_key and d->>'kid' = m.kid_key
                           and coalesce((d->>'parentsOnly')::boolean, false) = false
        -- Pendientes: solo los suyos (marcarlos como hechos)
        when 'tasks'  then d->>'who' = m.person_key
        -- Escribir en la conversación de un evento
        when 'evchat' then d->>'kid' = m.kid_key
        else false
      end
  );
$$;

-- ============================================================
-- Seguridad a nivel de fila (RLS)
-- ============================================================
alter table public.families enable row level security;
alter table public.members  enable row level security;
alter table public.kids     enable row level security;
alter table public.items    enable row level security;
alter table public.settings enable row level security;
alter table public.invites  enable row level security;

drop policy if exists families_select on public.families;
create policy families_select on public.families for select to authenticated
  using (public.is_member(id));
drop policy if exists families_update on public.families;
create policy families_update on public.families for update to authenticated
  using (public.is_parent(id)) with check (public.is_parent(id));
-- (las familias se crean con la función create_family)

drop policy if exists members_select on public.members;
create policy members_select on public.members for select to authenticated
  using (public.is_member(family_id));
drop policy if exists members_update on public.members;
create policy members_update on public.members for update to authenticated
  using (public.is_parent(family_id)) with check (public.is_parent(family_id));
-- Los papás pueden quitar cuidadores; cualquiera puede salirse él mismo.
drop policy if exists members_delete on public.members;
create policy members_delete on public.members for delete to authenticated
  using ((public.is_parent(family_id) and role = 'caregiver') or user_id = auth.uid());

drop policy if exists kids_select on public.kids;
create policy kids_select on public.kids for select to authenticated
  using (
    public.is_parent(family_id)
    or exists (select 1 from public.members m
               where m.family_id = kids.family_id and m.user_id = auth.uid() and m.kid_key = kids.key)
  );
drop policy if exists kids_write on public.kids;
create policy kids_write on public.kids for all to authenticated
  using (public.is_parent(family_id)) with check (public.is_parent(family_id));

drop policy if exists items_select on public.items;
create policy items_select on public.items for select to authenticated
  using (public.can_read_item(family_id, collection, data));
drop policy if exists items_insert on public.items;
create policy items_insert on public.items for insert to authenticated
  with check (public.is_parent(family_id) or public.caregiver_can_write(family_id, collection, data));
drop policy if exists items_update on public.items;
create policy items_update on public.items for update to authenticated
  using (public.is_parent(family_id) or public.can_read_item(family_id, collection, data))
  with check (public.is_parent(family_id) or public.caregiver_can_write(family_id, collection, data));
drop policy if exists items_delete on public.items;
create policy items_delete on public.items for delete to authenticated
  using (public.is_parent(family_id));

-- Ajustes: los cuidadores ven "have" (materiales), "pts" (puntos) y "menu"; solo modifican "have" y "pts".
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated
  using (public.is_parent(family_id) or (public.is_member(family_id) and key in ('have', 'pts', 'menu')));
drop policy if exists settings_insert on public.settings;
create policy settings_insert on public.settings for insert to authenticated
  with check (public.is_parent(family_id) or (public.is_member(family_id) and key in ('have', 'pts')));
drop policy if exists settings_update on public.settings;
create policy settings_update on public.settings for update to authenticated
  using (public.is_parent(family_id) or (public.is_member(family_id) and key in ('have', 'pts')))
  with check (public.is_parent(family_id) or (public.is_member(family_id) and key in ('have', 'pts')));
drop policy if exists settings_delete on public.settings;
create policy settings_delete on public.settings for delete to authenticated
  using (public.is_parent(family_id));

-- Los cuidadores solo pueden DAR puntos, no quitarlos (canjear es de los papás).
create or replace function public.guard_points() returns trigger
language plpgsql security definer set search_path = public as $$
declare k text;
begin
  if new.key = 'pts' and tg_op = 'UPDATE' and not public.is_parent(new.family_id) then
    for k in select jsonb_object_keys(old.value) loop
      if coalesce((new.value->>k)::numeric, 0) < coalesce((old.value->>k)::numeric, 0) then
        raise exception 'Solo los papás pueden canjear puntos';
      end if;
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists settings_guard_points on public.settings;
create trigger settings_guard_points before update on public.settings
  for each row execute function public.guard_points();

-- Invitaciones: los papás las ven y las revocan; se crean y aceptan con funciones.
drop policy if exists invites_select on public.invites;
create policy invites_select on public.invites for select to authenticated
  using (public.is_parent(family_id));
drop policy if exists invites_delete on public.invites;
create policy invites_delete on public.invites for delete to authenticated
  using (public.is_parent(family_id));

-- Marca de tiempo automática
create or replace function public.touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); new.updated_by = auth.uid(); return new; end $$;
drop trigger if exists items_touch on public.items;
create trigger items_touch before insert or update on public.items for each row execute function public.touch();
drop trigger if exists settings_touch on public.settings;
create or replace function public.touch_settings() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger settings_touch before insert or update on public.settings for each row execute function public.touch_settings();

-- ============================================================
-- Funciones que usa la app (RPC)
-- ============================================================
-- Crear una familia: la persona queda como primer papá/mamá y se guardan los niños.
-- p_kids: [{"key":"k1","data":{"name":"Sofi","age":4,...}}, ...]
create or replace function public.create_family(p_name text, p_my_name text, p_kids jsonb)
returns uuid
language plpgsql security definer set search_path = public as $$
declare fid uuid; k jsonb;
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  if exists (select 1 from members where user_id = auth.uid()) then
    raise exception 'Esta cuenta ya pertenece a una familia';
  end if;
  if jsonb_typeof(p_kids) <> 'array' or jsonb_array_length(p_kids) < 1 or jsonb_array_length(p_kids) > 8 then
    raise exception 'Agrega entre 1 y 8 niños';
  end if;
  insert into families (name, created_by) values (p_name, auth.uid()) returning id into fid;
  insert into members (family_id, user_id, role, person_key, display_name)
    values (fid, auth.uid(), 'parent', 'p1', p_my_name);
  for k in select * from jsonb_array_elements(p_kids) loop
    insert into kids (family_id, key, data) values (fid, k->>'key', k->'data');
  end loop;
  insert into settings (family_id, key, value) values
    (fid, 'have', '[]'::jsonb), (fid, 'pts', '{}'::jsonb);
  return fid;
end $$;

-- Crear una invitación (solo papás). Devuelve el código para compartir.
create or replace function public.create_invite(
  p_family uuid, p_role text, p_name text, p_kid text default null,
  p_from text default '00:00', p_to text default '23:59')
returns text
language plpgsql security definer set search_path = public as $$
declare pfx text; n int := 1; pk text; c text;
begin
  if not public.is_parent(p_family) then raise exception 'Solo los papás pueden invitar'; end if;
  if p_role not in ('parent', 'caregiver') then raise exception 'Rol inválido'; end if;
  if p_role = 'caregiver' and not exists (select 1 from kids where family_id = p_family and key = p_kid) then
    raise exception 'Elige el niño que va a cuidar';
  end if;
  pfx := case when p_role = 'parent' then 'p' else 'c' end;
  loop
    pk := pfx || n;
    exit when not exists (select 1 from members where family_id = p_family and person_key = pk)
          and not exists (select 1 from invites where family_id = p_family and person_key = pk and used_at is null);
    n := n + 1;
  end loop;
  c := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into invites (code, family_id, role, person_key, display_name, kid_key, shift_from, shift_to)
    values (c, p_family, p_role, pk, p_name, case when p_role = 'caregiver' then p_kid end, p_from, p_to);
  return c;
end $$;

-- Aceptar una invitación con su código. Devuelve el id de la familia.
create or replace function public.accept_invite(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv invites;
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  if exists (select 1 from members where user_id = auth.uid()) then
    raise exception 'Esta cuenta ya pertenece a una familia';
  end if;
  select * into inv from invites where code = upper(trim(p_code)) for update;
  if not found or inv.used_at is not null or inv.expires_at < now() then
    raise exception 'Código inválido o vencido';
  end if;
  insert into members (family_id, user_id, role, person_key, display_name, kid_key, shift_from, shift_to)
    values (inv.family_id, auth.uid(), inv.role, inv.person_key, inv.display_name, inv.kid_key, inv.shift_from, inv.shift_to);
  update invites set used_by = auth.uid(), used_at = now() where code = inv.code;
  return inv.family_id;
end $$;

-- ============================================================
-- Permisos de ejecución y de tablas
-- ============================================================
revoke all on function public.create_family(text, text, jsonb) from public, anon;
revoke all on function public.create_invite(uuid, text, text, text, text, text) from public, anon;
revoke all on function public.accept_invite(text) from public, anon;
grant execute on function public.create_family(text, text, jsonb) to authenticated;
grant execute on function public.create_invite(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
grant execute on function public.is_parent(uuid), public.is_member(uuid) to authenticated;
grant execute on function public.can_read_item(uuid, text, jsonb), public.caregiver_can_write(uuid, text, jsonb) to authenticated;

grant select, update on public.families to authenticated;
grant select, update, delete on public.members to authenticated;
grant select, insert, update, delete on public.kids, public.items, public.settings to authenticated;
grant select, delete on public.invites to authenticated;

-- ============================================================
-- Tiempo real (la app se actualiza sola cuando otro miembro cambia algo)
-- ============================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.items;    exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.settings; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.kids;     exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.members;  exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.invites;  exception when duplicate_object then null; end;
  end if;
end $$;
