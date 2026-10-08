import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fresh } from './data';

// Estado de la app guardado en el teléfono.
// Fase 2: este archivo se conecta a Supabase para sincronizar entre teléfonos.
const KEY = 'tribbu-estado-v1';
const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [S, setS] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        let saved = null;
        try { saved = raw ? JSON.parse(raw) : null; } catch (e) { saved = null; }
        setS(saved && saved.v === 1 ? saved : fresh());
      })
      .catch(() => setS(fresh()));
  }, []);

  // update(draft => { draft.algo = ... }) — copia, modifica y guarda.
  const update = useCallback((fn) => {
    setS((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const f = fresh();
    setS(f);
    AsyncStorage.setItem(KEY, JSON.stringify(f)).catch(() => {});
  }, []);

  if (!S) return null;
  return <StoreCtx.Provider value={{ S, update, reset }}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
