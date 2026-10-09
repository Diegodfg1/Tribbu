// Tienda de datos con cuenta real: lee y guarda en Supabase, y se mantiene al día con los demás miembros.
// Expone lo mismo que la tienda local (S, update, reset), así las pantallas casi no cambian.
// La privacidad NO depende de este archivo: la aplica la base de datos (ver supabase/schema.sql).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { StoreCtx } from './store';
import { supabase, friendly } from './supabase';
import { BLANK_MENU, KIDS, setFamilyWorld } from './data';
import { T } from './ui';
import { useTheme } from './theme';

const LISTS = ['tasks', 'myrecs', 'feed', 'shop', 'docs', 'exp', 'myacts', 'stories'];
const NEWEST_FIRST = ['feed', 'tasks', 'exp', 'myrecs', 'stories']; // se agregan con unshift
const SETTING_KEYS = ['have', 'cal', 'locs', 'copa', 'camlog', 'pts', 'mile', 'summary', 'menu', 'favs', 'since', 'chores', 'rewards', 'mymats'];
const clone = (x) => JSON.parse(JSON.stringify(x));
const evId = (e) => `${e.d}|${e.time}|${e.t}`;
// Las rutas de archivos locales (file://…) no sirven en otros teléfonos: no se sincronizan.
const stripImg = (o) => {
  if (o && typeof o.img === 'string' && !/^https?:/i.test(o.img)) { const { img, ...rest } = o; return rest; }
  return o;
};

export function toRows(S) {
  const rows = new Map();
  LISTS.forEach((c) => (S[c] || []).forEach((it) => rows.set(`${c}|${it.id}`, { collection: c, id: String(it.id), data: stripImg(it) })));
  (S.myevents || []).forEach((e) => rows.set(`myevents|${evId(e)}`, { collection: 'myevents', id: evId(e), data: e }));
  Object.entries(S.evchat || {}).forEach(([k, msgs]) => {
    const ev = (S.myevents || []).find((e) => evId(e) === k);
    rows.set(`evchat|${k}`, { collection: 'evchat', id: k, data: { kid: ev ? ev.kid : null, kids: ev ? (ev.kids || (ev.kid ? [ev.kid] : [])) : [], people: ev ? (ev.people || []) : [], msgs } });
  });
  return rows;
}

const defaultSettings = () => ({
  have: [], cal: { google: { on: false, mode: 'ocupado' }, outlook: { on: false, mode: 'ocupado' }, icloud: { on: false, mode: 'detalle' } },
  locs: {}, copa: false, camlog: true, pts: {}, mile: {}, summary: null, menu: BLANK_MENU(), favs: [], since: null, chores: [], rewards: [], mymats: [],
});

export function buildState(rows, settings, local) {
  const S = { ...local, v: 1, cloud: true, ...defaultSettings() };
  LISTS.forEach((c) => { S[c] = []; });
  S.myevents = []; S.evchat = {};
  rows.forEach((r) => {
    if (LISTS.includes(r.collection)) S[r.collection].push(r.data);
    else if (r.collection === 'myevents') S.myevents.push(r.data);
    else if (r.collection === 'evchat') S.evchat[r.id] = r.data.msgs || [];
  });
  LISTS.forEach((c) => {
    const f = NEWEST_FIRST.includes(c) ? -1 : 1;
    S[c].sort((a, b) => f * ((Number(a.id) || 0) - (Number(b.id) || 0)));
  });
  settings.forEach((r) => { if (SETTING_KEYS.includes(r.key)) S[r.key] = r.value; });
  Object.keys(KIDS).forEach((k) => { if (typeof S.pts[k] !== 'number') S.pts[k] = 0; });
  return S;
}

// Diferencias entre dos estados: qué filas guardar y cuáles borrar.
export function diffState(prev, next) {
  const a = toRows(prev); const b = toRows(next);
  const up = []; const del = [];
  b.forEach((r, k) => { if (!a.has(k) || JSON.stringify(a.get(k).data) !== JSON.stringify(r.data)) up.push(r); });
  a.forEach((r, k) => { if (!b.has(k)) del.push(r); });
  const sUp = []; const sDel = [];
  SETTING_KEYS.forEach((k) => {
    if (JSON.stringify(prev[k]) === JSON.stringify(next[k])) return;
    if (next[k] == null) sDel.push(k); else sUp.push({ key: k, value: next[k] });
  });
  return { up, del, sUp, sDel, empty: !up.length && !del.length && !sUp.length && !sDel.length };
}

async function fetchPages(table, fid, order) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    let q = supabase.from(table).select('*').eq('family_id', fid);
    order.forEach((o) => { q = q.order(o); });
    const { data, error } = await q.range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export function CloudStoreProvider({ fam, children }) {
  const c = useTheme();
  const { familyId, meKey, role } = fam;
  const [S, setS] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [sync, setSync] = useState({ n: 0, text: '' }); // aviso de error de guardado para la interfaz
  const ref = useRef(null);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const dirty = useRef(false);
  const timer = useRef(null);
  const live = useRef(false);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const [kids, members, items, settings] = await Promise.all([
        supabase.from('kids').select('*').eq('family_id', familyId),
        supabase.from('members').select('*').eq('family_id', familyId),
        fetchPages('items', familyId, ['collection', 'id']),
        fetchPages('settings', familyId, ['key']),
      ]);
      if (kids.error) throw kids.error;
      if (members.error) throw members.error;
      if (!alive.current) return;
      setFamilyWorld({ kids: kids.data, members: members.data, meKey });
      const prev = ref.current;
      const kidKeys = Object.keys(KIDS);
      const local = {
        kid: prev && KIDS[prev.kid] ? prev.kid : kidKeys[0] || '',
        view: (prev && prev.view) || 'hoy', jtab: (prev && prev.jtab) || 'act', ctab: (prev && prev.ctab) || 'menu', skill: prev ? prev.skill : null, afilter: (prev && prev.afilter) || 'all',
        role: role === 'parent' ? 'padres' : 'cuidador', me: meKey,
      };
      const next = buildState(items, settings, local);
      ref.current = next; setS(next); setLoadError(null);
    } catch (e) {
      if (alive.current && !ref.current) setLoadError(friendly(e));
    }
  }, [familyId, meKey, role]);

  const refresh = useCallback(() => {
    if (pending.current > 0) { dirty.current = true; return Promise.resolve(); }
    return load();
  }, [load]);

  const scheduleRefresh = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(refresh, 400);
  }, [refresh]);

  useEffect(() => {
    alive.current = true;
    load();
    const ch = supabase.channel(`familia-${familyId}`);
    ['items', 'settings', 'kids', 'members'].forEach((table) => {
      ch.on('postgres_changes', { event: '*', schema: 'public', table, filter: `family_id=eq.${familyId}` }, scheduleRefresh);
    });
    ch.subscribe((status) => { live.current = status === 'SUBSCRIBED'; });
    // Respaldo: si el tiempo real no está disponible, se actualiza cada 30 segundos.
    const poll = setInterval(() => { if (!live.current && AppState.currentState === 'active') refresh(); }, 30000);
    const app = AppState.addEventListener('change', (st) => { if (st === 'active') refresh(); });
    return () => {
      alive.current = false;
      clearTimeout(timer.current); clearInterval(poll); app.remove();
      supabase.removeChannel(ch);
    };
  }, [familyId, load, refresh, scheduleRefresh]);

  const apply = useCallback(async ({ up, del, sUp, sDel }) => {
    if (up.length) {
      const { error } = await supabase.from('items').upsert(up.map((r) => ({ family_id: familyId, ...r })), { onConflict: 'family_id,collection,id' });
      if (error) throw error;
    }
    const byCol = {};
    del.forEach((r) => { (byCol[r.collection] = byCol[r.collection] || []).push(r.id); });
    for (const col of Object.keys(byCol)) {
      const { error } = await supabase.from('items').delete().eq('family_id', familyId).eq('collection', col).in('id', byCol[col]);
      if (error) throw error;
    }
    if (sUp.length) {
      const { error } = await supabase.from('settings').upsert(sUp.map((r) => ({ family_id: familyId, ...r })), { onConflict: 'family_id,key' });
      if (error) throw error;
    }
    if (sDel.length) {
      const { error } = await supabase.from('settings').delete().eq('family_id', familyId).in('key', sDel);
      if (error) throw error;
    }
  }, [familyId]);

  const update = useCallback((fn) => {
    const prev = ref.current;
    if (!prev) return;
    const next = clone(prev);
    fn(next);
    ref.current = next; setS(next);
    const d = diffState(prev, next);
    if (d.empty) return;
    pending.current += 1;
    queue.current = queue.current
      .then(() => apply(d))
      .catch((e) => { dirty.current = true; setSync((s) => ({ n: s.n + 1, text: `No se pudo guardar: ${friendly(e)}` })); })
      .finally(() => {
        pending.current -= 1;
        if (pending.current === 0 && dirty.current) { dirty.current = false; load(); }
      });
  }, [apply, load]);

  const reset = useCallback(() => {}, []);

  // Acciones de la familia (las usa la pantalla Familia; en modo en blanco hay una versión local).
  const family = useMemo(() => ({
    local: false,
    async saveKid(key, data) {
      const { error } = await supabase.from('kids').upsert({ family_id: familyId, key, data }, { onConflict: 'family_id,key' });
      if (error) throw error;
      await refresh();
    },
    async updateMember(key, { kid, from, to }) {
      const { error } = await supabase.from('members').update({ kid_key: kid, shift_from: from, shift_to: to }).eq('family_id', familyId).eq('person_key', key);
      if (error) throw error;
      await refresh();
    },
    async removeMember(key) {
      const { error } = await supabase.from('members').delete().eq('family_id', familyId).eq('person_key', key);
      if (error) throw error;
      await refresh();
    },
    // Devuelve el código de invitación.
    async invite({ role, name, kid, from, to }) {
      const { data, error } = await supabase.rpc('create_invite', {
        p_family: familyId, p_role: role, p_name: name, p_kid: role === 'caregiver' ? kid : null,
        p_from: role === 'caregiver' ? from : '00:00', p_to: role === 'caregiver' ? to : '23:59',
      });
      if (error) throw error;
      return data;
    },
    async listInvites() {
      const { data } = await supabase.from('invites').select('*').eq('family_id', familyId).is('used_at', null).gt('expires_at', new Date().toISOString()).order('created_at');
      return data || [];
    },
    async revokeInvite(code) { await supabase.from('invites').delete().eq('code', code); },
  }), [familyId, refresh]);

  if (!S) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, padding: 24, gap: 12 }}>
        {loadError ? <T style={{ textAlign: 'center' }}>{loadError}</T> : <ActivityIndicator color={c.ink} />}
        <T v="small">{loadError ? 'Cierra y vuelve a abrir la app para reintentar.' : 'Cargando tu familia…'}</T>
      </View>
    );
  }
  return <StoreCtx.Provider value={{ S, update, reset, refresh, sync, familyId, family }}>{children}</StoreCtx.Provider>;
}
