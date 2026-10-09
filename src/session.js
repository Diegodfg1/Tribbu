// Sesión de la persona: demostración, sin sesión, sin familia o lista.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLOUD, supabase } from './supabase';
import { setDemoWorld } from './data';

const MODE_KEY = 'tribbu-modo';
const Ctx = createContext(null);

// phase: loading | welcome | demo | blank | out | nofamily | ready
export function AuthProvider({ children }) {
  const [phase, setPhase] = useState('loading');
  const [user, setUser] = useState(null);
  const [fam, setFam] = useState(null); // { familyId, meKey, role }
  const demoRef = useRef(false);

  const loadMember = useCallback(async (u) => {
    const { data, error } = await supabase.from('members').select('family_id, person_key, role').eq('user_id', u.id).maybeSingle();
    if (error) throw error;
    setUser(u);
    if (!data) { setFam(null); setPhase('nofamily'); return; }
    setFam({ familyId: data.family_id, meKey: data.person_key, role: data.role });
    setPhase('ready');
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const mode = await AsyncStorage.getItem(MODE_KEY).catch(() => null);
      if (mode === 'demo' || mode === 'blank') {
        demoRef.current = true; setDemoWorld(); if (alive) setPhase(mode); return;
      }
      if (!CLOUD) { setDemoWorld(); if (alive) setPhase('welcome'); return; }
      try {
        const { data } = await supabase.auth.getSession();
        if (!alive) return;
        if (data.session) await loadMember(data.session.user); else setPhase('out');
      } catch (e) { if (alive) setPhase('out'); }
    })();
    if (!CLOUD) return () => { alive = false; };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // No se llama a Supabase directamente aquí dentro (puede bloquearse); se difiere.
      setTimeout(() => {
        if (!alive || demoRef.current) return;
        if (event === 'SIGNED_OUT') { setUser(null); setFam(null); setPhase('out'); }
        else if (event === 'SIGNED_IN' && session) { loadMember(session.user).catch(() => setPhase('out')); }
      }, 0);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [loadMember]);

  const reload = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) await loadMember(data.user);
  }, [loadMember]);

  const api = {
    phase, user, fam, canAccount: CLOUD,
    reload,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    },
    // Devuelve 'ok' si ya quedó dentro, o 'confirm' si falta confirmar el correo.
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      return data.session ? 'ok' : 'confirm';
    },
    async verifyCode(email, token, type) {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type });
      if (error) throw error;
    },
    async sendRecovery(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
    },
    async setPassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    async signOut() {
      setDemoWorld();
      await supabase.auth.signOut();
      setUser(null); setFam(null); setPhase('out');
    },
    async createFamily({ familyName, myName, kids }) {
      const { error } = await supabase.rpc('create_family', { p_name: familyName, p_my_name: myName, p_kids: kids });
      if (error) throw error;
      await reload();
    },
    async acceptInvite(code) {
      const { error } = await supabase.rpc('accept_invite', { p_code: code });
      if (error) throw error;
      await reload();
    },
    async startDemo() {
      demoRef.current = true; setDemoWorld();
      await AsyncStorage.setItem(MODE_KEY, 'demo').catch(() => {});
      setPhase('demo');
    },
    // Modo de prueba en blanco: sin datos de ejemplo, todo se guarda solo en este teléfono.
    async startBlank() {
      demoRef.current = true; setDemoWorld();
      await AsyncStorage.setItem(MODE_KEY, 'blank').catch(() => {});
      setPhase('blank');
    },
    async leaveDemo() {
      demoRef.current = false; setDemoWorld();
      await AsyncStorage.removeItem(MODE_KEY).catch(() => {});
      if (!CLOUD) { setPhase('welcome'); return; }
      setPhase('loading');
      const { data } = await supabase.auth.getSession();
      if (data.session) await loadMember(data.session.user).catch(() => setPhase('out')); else setPhase('out');
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
