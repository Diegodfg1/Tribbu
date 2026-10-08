# Tribbu — instrucciones del proyecto

App móvil (iOS y Android) de apoyo a padres: actividades didácticas **sin pantallas** con materiales de casa, agenda familiar, cocina, bitácora del niño, red de cuidadores (abuelos, niñeras, hermanos) y asistente con IA. Mercado inicial: México, todo en español mexicano.

Prototipo de referencia (diseño y comportamiento aprobados por el dueño): https://claude.ai/artifact/GmgvX598PBoAgd9nQdQovj

## Cómo trabajar con el dueño
- No es necesariamente técnico: explica en lenguaje sencillo y guía paso a paso (instalar Node, abrir Expo Go, escanear el QR).
- Objetivo inmediato: **probar gratis en su celular con Expo Go**. No contratar nada de pago hasta la versión final.
- Responde y escribe todo el texto de la app en español mexicano.

## Fases
1. **Fase 1 (actual, gratis):** app completa con datos guardados en el teléfono (AsyncStorage) y un selector de rol "Papás / Abuela Carmen" para demostrar permisos. IA simulada en `src/ai.js`.
2. **Fase 2 (gratis):** cuentas reales y sincronización entre teléfonos con el plan gratuito de Supabase. Invitaciones a cuidadores. Permisos con Row Level Security (ver tabla abajo). Leer calendarios reales del teléfono con `expo-calendar`.
3. **Fase 3 (de pago, al final):** IA real con la API de Claude (modelo Haiku por defecto) a través de una Edge Function de Supabase. **La llave de la API nunca va dentro de la app.** Notificaciones push, compilación con EAS y publicación en App Store y Google Play.

## Decisiones técnicas
- Expo (última SDK estable) + React Native, **JavaScript** (no TypeScript) para mantenerlo simple.
- Solo librerías compatibles con **Expo Go** en la fase 1: `react-native-svg`, `@react-native-async-storage/async-storage`, `react-native-safe-area-context`, `expo-image-picker`, `expo-clipboard`, `expo-status-bar`, `expo-font`, `@expo-google-fonts/baloo-2`, `@expo-google-fonts/atkinson-hyperlegible`. Instalar siempre con `npx expo install` para que las versiones coincidan con la SDK.
- Sin librería de navegación por ahora: las pestañas se controlan con `S.view` en el estado (como en el prototipo).
- Estado: `src/store.js` (`update(draft => …)` copia, modifica y guarda). En la fase 2 se reemplaza por Supabase sin cambiar las pantallas más de lo necesario.
- Hojas, pantallas completas y avisos: `useUI()` en `src/ui.js` (`openSheet`, `openFull`, `toast`).
- Tema claro y oscuro en `src/theme.js`. Tipografías: Baloo 2 (títulos) y Atkinson Hyperlegible (texto).
- Animaciones "Ver cómo se juega" en `src/scenes.js` (Animated + react-native-svg). Más adelante pueden sustituirse por archivos Rive/Lottie.

## Estado de los archivos
Fase 1 completa en código. Verificado: compila para Android e iOS (`npx expo export`) y se recorrieron todas las pestañas y ambos roles en un navegador de prueba sin errores. **Aún no probado en un teléfono real con Expo Go.**
- `App.js`, `index.js`, `app.json`, `package.json` (Expo SDK 57; versiones tomadas de `node_modules/expo/bundledNativeModules.json`)
- `src/data.js`, `theme.js`, `store.js`, `ui.js`, `ai.js`, `scenes.js`, `parts.js`, `sheets.js`
- `src/screens/`: `Hoy`, `Jugar`, `Agenda`, `Cocina`, `Familia`, `Casa`

Notas:
- "Subir documento" en Casa usa el selector de fotos (`expo-image-picker`). Para PDFs en fase 2 añadir `expo-document-picker`.
- Los 2 avisos de `expo-doctor` en el entorno de la nube eran de red bloqueada, no del proyecto; correrlo en la computadora del dueño.
- Pendiente fase 2: sin cambios (Supabase, `expo-calendar`).

## Permisos por rol (deben respetarse en fase 1 y en las reglas de Supabase en fase 2)
| Sección | Papás | Cuidadores |
|---|---|---|
| Actividades y animaciones | Todo | Todo |
| Agenda | Todo | Solo eventos de su turno |
| Calendarios vinculados | Sí | No |
| Pendientes | Todos | Solo los suyos |
| Bitácora y mensajes | Todo | Del niño que cuida, sin avisos de cámaras |
| Ficha de emergencia | Sí | Sí |
| Menú y recetas | Todo | Menú de hoy y recetas |
| Compras | Sí | No |
| Documentos | Todos | Solo los compartidos |
| Gastos y coparentalidad | Sí | No |
| Cámaras y ubicación | Sí | No |
| Puntos | Dar y canjear | Solo dar |

## Privacidad (datos de menores)
- No guardar video de cámaras en servidores propios.
- Cuentas de trabajo vinculadas: por defecto el otro papá solo ve "Ocupado"; los cuidadores nunca las ven.
- La IA no da diagnósticos ni dosis; ante síntomas de alarma remite al pediatra o a emergencias.
- Aviso de privacidad conforme a la ley mexicana de protección de datos antes de publicar.
