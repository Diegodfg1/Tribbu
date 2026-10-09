// Modo de prueba EN BLANCO: la app completa, sin datos de ejemplo, guardada solo en este teléfono.
// Sirve para ir cargando tu propia información sin necesitar cuenta ni internet.
// Mismas pantallas que la nube; aquí las "personas" (papás y cuidadores) se agregan directamente
// y con "Ver como" cambias de persona para comprobar qué ve cada quien.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLANK_MENU, KIDS, monthOf, setFamilyWorld } from './data';
import { StoreCtx } from './store';
import { OnboardingScreen } from './screens/Auth';

const KEY = 'tribbu-blank-v1';
const clone = (x) => JSON.parse(JSON.stringify(x));

export function blankState({ myName, kids }) {
  const rows = kids.map((k, i) => ({ key: `k${i + 1}`, data: { name: k.name, age: k.age, allergy: k.allergy || 'Ninguna conocida' } }));
  const pts = {};
  rows.forEach((r) => { pts[r.key] = 0; });
  return {
    v: 1, blank: true, kid: rows[0].key, role: 'padres', me: 'p1', view: 'hoy', jtab: 'act', ctab: 'menu', skill: null, afilter: 'all', favs: [], since: monthOf(new Date()),
    have: [], tasks: [], myrecs: [], feed: [], shop: [], docs: [], exp: [], myevents: [], evchat: {}, mile: {}, pts,
    cal: { google: { on: false, mode: 'ocupado' }, outlook: { on: false, mode: 'ocupado' }, icloud: { on: false, mode: 'detalle' } },
    copa: false, locs: {}, camlog: true, summary: null,
    menu: BLANK_MENU(), cams: [], camev: [], arr: [], extevents: [],
    world: { kids: rows, members: [{ person_key: 'p1', display_name: myName, role: 'parent', kid_key: null, shift_from: '00:00', shift_to: '23:59' }] },
  };
}

// Sincroniza KIDS, PEOPLE, SHIFT… con lo guardado y deriva el rol de quien se está viendo.
export function applyWorld(S) {
  setFamilyWorld({ kids: S.world.kids, members: S.world.members, meKey: S.me });
  const m = S.world.members.find((x) => x.person_key === S.me) || S.world.members[0];
  S.me = m.person_key;
  S.role = m.role === 'caregiver' ? 'cuidador' : 'padres';
  if (!KIDS[S.kid]) S.kid = Object.keys(KIDS)[0];
}

export function BlankStoreProvider({ onLeave, children }) {
  const [S, setS] = useState(null);
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      let saved = null;
      try { saved = raw ? JSON.parse(raw) : null; } catch (e) { saved = null; }
      if (saved && saved.blank && saved.world) { applyWorld(saved); ref.current = saved; setS(saved); }
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  const save = (next) => AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  const update = useCallback((fn) => {
    const prev = ref.current;
    if (!prev) return;
    const next = clone(prev);
    fn(next);
    applyWorld(next);
    ref.current = next; setS(next); save(next);
  }, []);
  const create = useCallback((cfg) => {
    const next = blankState(cfg);
    applyWorld(next);
    ref.current = next; setS(next); save(next);
  }, []);
  // Borra todo lo cargado y vuelve a la configuración inicial.
  const wipe = useCallback(() => {
    AsyncStorage.removeItem(KEY).catch(() => {});
    ref.current = null; setS(null);
  }, []);

  const family = useMemo(() => ({
    local: true,
    async saveKid(key, data) {
      update((d) => {
        const i = d.world.kids.findIndex((k) => k.key === key);
        if (i >= 0) d.world.kids[i].data = data; else d.world.kids.push({ key, data });
        if (typeof d.pts[key] !== 'number') d.pts[key] = 0;
      });
    },
    async updateMember(key, { kid, from, to }) {
      update((d) => { const m = d.world.members.find((x) => x.person_key === key); if (m) { m.kid_key = kid; m.shift_from = from; m.shift_to = to; } });
    },
    async removeMember(key) {
      update((d) => {
        d.world.members = d.world.members.filter((x) => x.person_key !== key);
        if (d.me === key) d.me = d.world.members.find((x) => x.role === 'parent').person_key;
        if (d.view === 'casa' && d.role === 'cuidador') d.view = 'hoy';
      });
    },
    // Aquí no hay código: la persona se agrega directamente. Devuelve null.
    async invite({ role, name, kid, from, to }) {
      update((d) => {
        const pfx = role === 'parent' ? 'p' : 'c';
        let n = 1;
        while (d.world.members.some((m) => m.person_key === pfx + n)) n += 1;
        d.world.members.push({ person_key: pfx + n, display_name: name, role, kid_key: role === 'caregiver' ? kid : null, shift_from: role === 'caregiver' ? from : '00:00', shift_to: role === 'caregiver' ? to : '23:59' });
      });
      return null;
    },
    async listInvites() { return []; },
    async revokeInvite() {},
  }), [update]);

  if (!ready) return null;
  if (!S) return <OnboardingScreen local onLocalCreate={create} onLeave={onLeave} />;
  return <StoreCtx.Provider value={{ S, update, reset: wipe, wipe, family }}>{children}</StoreCtx.Provider>;
}
