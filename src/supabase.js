// Conexión con Supabase. Si faltan las llaves (archivo .env), la app funciona solo en modo demostración.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Expo reemplaza estas variables al compilar; deben escribirse completas, tal cual.
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const CLOUD = !!(URL && KEY);

export const supabase = CLOUD
  ? createClient(URL, KEY, {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  })
  : null;

// Traduce los errores más comunes a español sencillo.
export function friendly(err) {
  const m = String((err && err.message) || err || '');
  const rules = [
    [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
    [/email not confirmed/i, 'Aún no confirmas tu correo. Revisa tu bandeja de entrada.'],
    [/already registered|already been registered/i, 'Ya existe una cuenta con ese correo. Prueba iniciar sesión.'],
    [/password should be at least|weak password/i, 'La contraseña es muy corta o muy simple. Usa al menos 8 caracteres.'],
    [/rate limit|too many requests|over_email_send_rate_limit/i, 'Demasiados intentos. Espera unos minutos e inténtalo otra vez.'],
    [/token has expired|otp.*expired|invalid.*(token|otp)/i, 'El código es incorrecto o ya venció. Pide uno nuevo.'],
    [/network request failed|failed to fetch|network error/i, 'No hay conexión con internet o con el servidor.'],
    [/unable to validate email|invalid email/i, 'Ese correo no parece válido.'],
    [/código inválido o vencido/i, 'Ese código no existe, ya se usó o venció. Pide uno nuevo.'],
    [/ya pertenece a una familia/i, 'Esta cuenta ya pertenece a una familia.'],
    [/row-level security|permission denied/i, 'No tienes permiso para hacer eso.'],
  ];
  const hit = rules.find(([r]) => r.test(m));
  return hit ? hit[1] : `Algo salió mal: ${m || 'error desconocido'}`;
}
