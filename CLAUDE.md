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
**Fase 1 completa** (modo demostración, datos locales). **Fase 2 completa en código** (cuentas, familias, invitaciones, permisos, sincronización). Verificado: compila para Android e iOS (`npx expo export`); 39 pruebas de privacidad en Postgres (`supabase/tests/rls_test.sql`); recorrido de punta a punta en navegador con Postgres + PostgREST reales y un GoTrue simulado (mamá crea familia, invita a la abuela, ella entra con el código y solo ve lo que le toca). El modo en blanco se recorrió también de punta a punta en navegador (52 comprobaciones). **Aún no probado con un proyecto real de Supabase ni en un teléfono con Expo Go.**

- `App.js`, `index.js`, `app.json`, `package.json` (Expo SDK 57; versiones de `node_modules/expo/bundledNativeModules.json`), `.env.example`
- `src/blankStore.js` (modo en blanco)
- `src/data.js` (datos demo + `setDemoWorld()` / `setFamilyWorld()` que cambian KIDS, PEOPLE, SHIFT, MEMBERS… en su lugar), `theme.js`, `store.js` (tienda local/demo), `cloudStore.js` (tienda Supabase), `session.js` (AuthProvider), `supabase.js`, `ui.js`, `ai.js`, `scenes.js`, `parts.js`, `sheets.js`
- `src/screens/`: `Hoy`, `Jugar`, `Agenda`, `Cocina`, `Familia`, `FamiliaAdmin` (invitar, turnos, fichas, cuenta), `Casa`, `Auth` (entrar, crear cuenta, recuperar, onboarding)
- `supabase/schema.sql` (tablas, RLS, funciones `create_family` / `create_invite` / `accept_invite`), `supabase/tests/`

Tres modos de datos (`S.cloud`, `S.blank`, ninguno = demostración). `isOwn(S)` = cloud o blank = **sin datos de ejemplo**:
- **Demostración**: `store.js` + `fresh()`; usa las constantes de ejemplo de `data.js` (KIDS, RECIPES, MENU, CAMS, ARRIVALS, EXT_EVENTS…).
- **En blanco** (`blankStore.js`, clave `tribbu-blank-v1`): arranca vacío con configuración inicial (tu nombre + niños). Guarda todo en `S` incluida `S.world` (niños y personas), y `applyWorld(S)` sincroniza KIDS/PEOPLE/SHIFT/MEMBERS en cada `update()`. «Ver como» cambia `S.me` (el rol se deriva). Cámaras, avisos de llegada y calendarios vinculados son **simulaciones** con datos propios (`S.cams`, `S.camev`, `S.arr`, `S.extevents`). Se llega desde la bienvenida (sin `.env`) o desde la pantalla de entrada.
- **Nube** (`cloudStore.js`): ver abajo.
- Las pantallas leen de `S` mediante helpers de `data.js` (`menuOf`, `allRecipes`, `arrivalsOf`, `camsOf`, `camEventsOf`, `todayRecipe`) que devuelven los datos de ejemplo solo si `S` no trae los suyos. **Al agregar contenido de ejemplo nuevo, hazlo con ese patrón** para que no aparezca en modo en blanco ni en la nube.
- `useStore().family` (`saveKid`, `updateMember`, `removeMember`, `invite`, `listInvites`, `revokeInvite`) tiene versión nube y versión local; `FamiliaAdmin.js` solo usa esa interfaz.
- `confirmAction()` (en `ui.js`) para confirmaciones; `Alert.alert` no funciona en web.
- Cambiar `.env` exige `npx expo start --clear` (Metro guarda las variables en caché).

Cómo funciona la fase 2:
- Sin `.env` la app arranca en demostración. Con `.env` pide cuenta; la demostración sigue disponible ("Probar en modo demostración").
- La estructura de `S` es la misma en demo y nube. En la nube cada lista (feed, tasks, docs…) son filas de la tabla `items` y los ajustes de `settings`. `update()` calcula la diferencia y guarda; un refresco trae los cambios de otros (tiempo real + respaldo cada 30 s).
- **La privacidad la aplica la base de datos (RLS), no la app.** Si cambias qué ve un cuidador, cambia `can_read_item` / `caregiver_can_write` y agrega la prueba.
- Cada cuenta pertenece a una sola familia. Personas: `p1`, `p2` (papás), `c1`, `c2`… (cuidadores). En la nube, `split` de gastos = porcentaje del primer papá (`PARENTS[0]`).
- En la nube se ocultan las funciones que son simulación: cámaras, avisos de llegada, vincular calendarios, fotos. El menú de la semana es el ajuste `menu` (los cuidadores lo leen, no lo editan).

Limitaciones conocidas (decidir antes de publicar):
- Un cuidador puede reescribir los mensajes de la conversación de un evento (se guarda como un arreglo por evento). Mejor un renglón por mensaje.
- Los ajustes `pts`, `mile`, `have` se guardan completos: dos personas editándolos al mismo tiempo pueden pisarse.
- Sin modo sin conexión: si falla el guardado se avisa y se vuelve a cargar lo de la nube.
- No hay límite de intentos al probar códigos de invitación (10 caracteres, vencen a 7 días, una sola vez).
- Archivos y fotos (documentos, recetas) no se suben: falta Supabase Storage con reglas por documento compartido. `expo-document-picker` para PDFs.
- Avisos de llegada reales requieren `expo-location` + geocercas y una compilación con EAS (Expo Go no soporta ubicación en segundo plano).
- El correo gratis de Supabase tiene límite bajo; configurar SMTP propio. Activar "Confirm email" antes de publicar.
- Aviso de privacidad (ley mexicana) y consentimiento de cuidadores: pendientes.

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
