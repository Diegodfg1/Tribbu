-- Pruebas de privacidad. Falla (con error) si algo no se comporta como dice CLAUDE.md.
-- Uso: psql -v ON_ERROR_STOP=1 -f stub_auth.sql -f ../schema.sql -f rls_test.sql
\set ON_ERROR_STOP on
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'mama@test'),
  ('00000000-0000-0000-0000-00000000000b', 'papa@test'),
  ('00000000-0000-0000-0000-00000000000c', 'abuela@test'),
  ('00000000-0000-0000-0000-00000000000d', 'extra@test');

create or replace function pg_temp.as_user(u text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false);
  execute 'set role authenticated';
end $$;
create or replace function pg_temp.fails(sql text) returns boolean language plpgsql as $$
begin execute sql; return false; exception when others then return true; end $$;
create or replace function pg_temp.check(ok boolean, msg text) returns void language plpgsql as $$
begin if not ok then raise exception 'FALLÓ: %', msg; else raise notice 'ok: %', msg; end if; end $$;

-- ---- Mamá crea la familia ----
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.create_family('Familia Prueba', 'Mamá', '[{"key":"k1","data":{"name":"Sofi","age":4}},{"key":"k2","data":{"name":"Mateo","age":7}}]'::jsonb) as fid \gset
select pg_temp.check(pg_temp.fails($q$select public.create_family('Otra', 'Mamá', '[{"key":"k1","data":{}}]')$q$), 'una cuenta no puede crear dos familias');

-- Mamá invita a un papá y a una cuidadora
select public.create_invite(:'fid', 'parent', 'Papá') as code_p \gset
select public.create_invite(:'fid', 'caregiver', 'Abuela Carmen', 'k1', '14:00', '19:00') as code_c \gset

-- Papá y abuela aceptan
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.check(public.accept_invite(lower(:'code_p')) = :'fid'::uuid, 'papá acepta invitación (código en minúsculas)');
select pg_temp.check(pg_temp.fails(format($q$select public.accept_invite(%L)$q$, :'code_p')), 'una invitación no se puede usar dos veces');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.check(pg_temp.fails($q$select public.accept_invite('NOEXISTE')$q$), 'código inválido se rechaza');
select pg_temp.check(pg_temp.fails($q$select public.create_invite((select family_id from members limit 1), 'parent', 'X')$q$), 'cuidadora no puede invitar');
select public.accept_invite(:'code_c');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
select pg_temp.check((select count(*) from public.families) = 0, 'extraño no ve ninguna familia');
select pg_temp.check(pg_temp.fails(format($q$insert into items values (%L,'feed','x','{"kid":"k1"}')$q$, :'fid')), 'extraño no puede escribir');
reset role;

-- ---- Mamá guarda datos de toda clase ----
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into public.items (family_id, collection, id, data) values
 (:'fid','feed','1','{"id":1,"who":"c1","kid":"k1","txt":"Comió todo"}'),
 (:'fid','feed','2','{"id":2,"who":"p1","kid":"k1","txt":"Cámara","parentsOnly":true}'),
 (:'fid','feed','3','{"id":3,"who":"p1","kid":"k2","txt":"De Mateo"}'),
 (:'fid','tasks','t1','{"id":1,"who":"c1","t":"Recoger","done":false}'),
 (:'fid','tasks','t2','{"id":2,"who":"p1","t":"Pagar","done":false}'),
 (:'fid','docs','d1','{"id":1,"t":"Cartilla","kid":"k1","shared":true}'),
 (:'fid','docs','d2','{"id":2,"t":"CURP","kid":"k1","shared":false}'),
 (:'fid','docs','d3','{"id":3,"t":"Póliza","shared":true}'),
 (:'fid','docs','d4','{"id":4,"t":"Cartilla Mateo","kid":"k2","shared":true}'),
 (:'fid','exp','e1','{"id":1,"t":"Colegiatura","amt":4800}'),
 (:'fid','shop','s1','{"id":1,"t":"Leche"}'),
 (:'fid','myevents','a|15:00|Ballet','{"d":"a","time":"15:00","t":"Ballet","kid":"k1"}'),
 (:'fid','myevents','a|20:00|Cena','{"d":"a","time":"20:00","t":"Cena","kid":"k1"}'),
 (:'fid','myevents','a|15:00|Natación','{"d":"a","time":"15:00","t":"Natación","kid":"k2"}'),
 (:'fid','evchat','a|15:00|Ballet','{"kid":"k1","msgs":[]}'),
 (:'fid','evchat','a|15:00|Natación','{"kid":"k2","msgs":[]}'),
 (:'fid','myrecs','r1','{"id":1,"t":"Receta"}');
insert into public.settings values (:'fid','cal','{"google":{"on":true}}'), (:'fid','copa','true'), (:'fid','menu','[["Lun",1]]'), (:'fid','favs','[3]'), (:'fid','since','"2026-10"') ;
update public.settings set value = '{"k1":14,"k2":26}' where family_id = :'fid' and key = 'pts';
update public.settings set value = '["calcetines"]' where family_id = :'fid' and key = 'have';
select pg_temp.check((select count(*) from public.items) = 17, 'mamá ve todo');
reset role;

-- ---- Papá (segundo padre) ve y escribe igual ----
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) from public.items) = 17, 'papá ve todo');
select pg_temp.check((select count(*) from public.kids) = 2, 'papá ve las dos fichas');
reset role;

-- ---- Abuela Carmen (cuidadora de k1, 14:00–19:00) ----
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.check((select count(*) from public.items where collection='feed') = 1 and (select id from public.items where collection='feed') = '1', 'bitácora: solo del niño que cuida y sin avisos de cámaras');
select pg_temp.check((select count(*) from public.items where collection='tasks') = 1, 'pendientes: solo los suyos');
select pg_temp.check((select count(*) from public.items where collection='docs') = 2, 'documentos: solo compartidos de su niño o de la familia');
select pg_temp.check((select count(*) from public.items where collection in ('exp','shop')) = 0, 'no ve gastos ni compras');
select pg_temp.check((select count(*) from public.items where collection='myevents') = 1, 'agenda: solo eventos de su turno y su niño');
select pg_temp.check((select count(*) from public.items where collection='evchat') = 1, 'conversaciones: solo de su niño');
select pg_temp.check((select count(*) from public.items where collection='myrecs') = 1, 've recetas');
select pg_temp.check((select count(*) from public.kids) = 1 and (select key from public.kids) = 'k1', 'solo ve la ficha de su niño');
select pg_temp.check((select count(*) from public.settings) = 5 and (select count(*) from public.settings where key in ('have','pts','menu','favs','since')) = 5, 'ajustes: solo materiales, puntos, menú, favoritas y mes de inicio (no calendarios, ni coparentalidad)');
select pg_temp.check((select count(*) from public.invites) = 0, 'no ve invitaciones');
select pg_temp.check((select count(*) from public.members) = 3, 've quién forma la familia (nombres)');

-- Lo que SÍ puede escribir
insert into public.items (family_id, collection, id, data) values (:'fid','feed','10','{"id":10,"who":"c1","kid":"k1","kind":"Comió","txt":"ok"}');
select pg_temp.check(true, 'cuidadora registra en la bitácora');
update public.items set data = '{"id":1,"who":"c1","t":"Recoger","done":true}' where collection='tasks' and id='t1';
select pg_temp.check((select data->>'done' from public.items where id='t1') = 'true', 'cuidadora marca su pendiente');
insert into public.items (family_id, collection, id, data) values (:'fid','tasks','t1','{"id":1,"who":"c1","t":"Recoger","done":false}')
  on conflict (family_id, collection, id) do update set data = excluded.data;
select pg_temp.check(true, 'cuidadora puede usar upsert en su pendiente');
update public.settings set value = '{"k1":20,"k2":26}' where family_id = :'fid' and key = 'pts';
select pg_temp.check((select value->>'k1' from public.settings where key='pts') = '20', 'cuidadora da puntos');

-- Lo que NO puede hacer
select pg_temp.check(pg_temp.fails(format($q$insert into items values (%L,'feed','11','{"id":11,"who":"c1","kid":"k2","txt":"x"}')$q$, :'fid')), 'no escribe en la bitácora de otro niño');
select pg_temp.check(pg_temp.fails(format($q$insert into items values (%L,'feed','12','{"id":12,"who":"p1","kid":"k1","txt":"x"}')$q$, :'fid')), 'no escribe haciéndose pasar por otra persona');
select pg_temp.check(pg_temp.fails(format($q$insert into items values (%L,'feed','13','{"id":13,"who":"c1","kid":"k1","parentsOnly":true}')$q$, :'fid')), 'no crea avisos "solo papás"');
select pg_temp.check(pg_temp.fails(format($q$insert into items values (%L,'exp','x1','{"amt":1}')$q$, :'fid')), 'no crea gastos');
select pg_temp.check(pg_temp.fails(format($q$insert into items values (%L,'docs','x2','{"t":"x","shared":true}')$q$, :'fid')), 'no sube documentos');
select pg_temp.check(pg_temp.fails(format($q$insert into items values (%L,'tasks','x3','{"who":"p1","t":"x"}')$q$, :'fid')), 'no asigna pendientes a otros');
select pg_temp.check(pg_temp.fails($q$update public.items set data = '{"id":1,"who":"p1","t":"Recoger","done":false}' where collection='tasks' and id='t1'$q$), 'no puede pasar su pendiente a otra persona');
update public.items set data = jsonb_set(data, '{shared}', 'true') where collection='docs' and id='d2';
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select pg_temp.check((select (data->>'shared')::boolean from public.items where id='d2') = false, 'no comparte documentos privados');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
delete from public.items where collection='feed' and id='1';
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select pg_temp.check((select count(*) from public.items where id='1' and collection='feed') = 1, 'cuidadora no borra de la bitácora');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.check(pg_temp.fails(format($q$update settings set value='{"k1":0,"k2":26}' where family_id=%L and key='pts'$q$, :'fid')), 'cuidadora no puede quitar puntos (canjear)');
select pg_temp.check(pg_temp.fails(format($q$update settings set value='[]' where family_id=%L and key='menu'$q$, :'fid')) or (select value::text from public.settings where key='menu') = '[["Lun", 1]]', 'cuidadora no cambia el menú');
update public.settings set value = '[]' where family_id = :'fid' and key = 'favs';
select pg_temp.check((select value::text from public.settings where key='favs') = '[3]', 'cuidadora no cambia las actividades favoritas');
select pg_temp.check(pg_temp.fails(format($q$insert into settings values (%L,'copa','false') on conflict (family_id,key) do update set value=excluded.value$q$, :'fid')), 'cuidadora no cambia coparentalidad');
update public.members set role = 'parent' where user_id = auth.uid();
select pg_temp.check((select role from public.members where user_id = auth.uid()) = 'caregiver', 'cuidadora no puede ascenderse a papá');
update public.kids set data = '{"name":"Hackeado"}' where key = 'k1';
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select pg_temp.check((select data->>'name' from public.kids where key='k1') = 'Sofi', 'cuidadora no edita fichas');
-- papás pueden quitar a una cuidadora
delete from public.members where user_id = '00000000-0000-0000-0000-00000000000c';
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.check((select count(*) from public.items) = 0, 'cuidadora removida ya no ve nada');
reset role;
\echo TODAS LAS PRUEBAS PASARON
