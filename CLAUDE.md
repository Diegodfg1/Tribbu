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
- `src/blankStore.js` (modo en blanco), `src/pickers.js` (fecha/hora/calendario), `src/editors.js` (evento y pendiente), `src/library.js` (actividades mensuales), `src/nutri.js` (recetas nutritivas)
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

Segunda tanda de mejoras (hecha):
- `src/milestones.js` (176 hitos por edad, fuentes CDC 2022 y EDI de México; guía, no diagnóstico), `screens/Hitos.js` (estadísticas y marcado), `src/ideas.js` (actividad nueva a partir de un objeto de casa; plantillas, no IA), `src/stories.js` + `screens/Cuentos.js` (cuentos con plantillas: tema + protagonistas niños/papás/personaje), `screens/Puntos.js` (quehaceres y recompensas propios), `src/stats.js` + `screens/Resumen.js` (tablero en Hoy → Resumen, solo papás), `src/logo.js` (logotipo de la marca).
- Eventos llevan `kids` y `people`; pendientes llevan `whos`. `S.mile[`${niño}|${id}`]` = fecha en que se logró. Nuevas listas: `S.chores`, `S.rewards`, `S.mymats`, `S.myacts`, `S.stories` (en la nube: ajustes `chores,rewards,mymats`, colecciones `myacts,stories`). Si ya corriste `schema.sql`, vuelve a correrlo.
- Marca aplicada (colores, logotipo, ícono en `assets/`, sin emojis, color fijo por habilidad vía `skillColors`).

Convenciones de datos (las pantallas dependen de ellas):
- **Bitácora** (`S.feed`): cada registro lleva `d` (AAAA-MM-DD) y `t` (HH:MM) de **cuándo ocurrió**, no de cuándo se anotó. Créalos siempre con `mkFeed(S, {...})`; `feedDay(x)` deduce la fecha de registros antiguos. La pantalla Familia los muestra por día y por niño, ordenados con `feedSort`.
- **Pendientes** (`S.tasks`): `{id, t, who, done, due?}`. `tasksSorted()` los ordena. Se ven en Hoy, Agenda y Pizarra; se crean y editan en `TaskEditor` (`editors.js`).
- **Eventos familiares** (`S.myevents`, llave `evKey` = `fecha|hora|título`): se crean/editan/borran en `EventEditor`. En la demostración los eventos de ejemplo no se pueden borrar de verdad: se ocultan con `S.delev`. Al renombrar o mover un evento, la conversación (`S.evchat`) cambia de llave.
- **Fechas y horas**: `src/pickers.js` (`DateField`, `TimeField`, `MonthGrid`) se despliega **en el mismo lugar**, sin ventanas encimadas. No uses `Modal` dentro de otro `Modal` (en iPhone la segunda no se presenta); las pantallas completas (`openFull`) y las hojas (`openSheet`) son Modals distintos.
- **Avisos**: `toast()` en cada acción del usuario (cualquier acción nueva debe llamarlo). Se muestran arriba de la pantalla.
- **Actividades**: `ACTS` = 12 originales (`unlock: -1`, siempre visibles) + `MORE_ACTS` de `library.js` con `unlock` = mes de uso en que se desbloquean (0 = primer mes). `S.since` ('AAAA-MM') es el mes en que la familia empezó; `monthsUsed(S)`, `unlockedActs(S)`, `isNewAct(a, S)`. `S.favs` = ids favoritos (solo los papás los cambian). La biblioteca es finita (8 grupos de 4): después de eso se necesita contenido nuevo o IA (fase 3). `S.afilter` ('all'|'fav'|'new') es solo local.
- **Ideas nutritivas** (`nutri.js`): recetas **originales** de Tribbu con criterios del Plato del Bien Comer (NOM-043-SSA2), la guía de alimentación complementaria de la OMS (2023) y advertencias de atragantamiento y miel. **No** son recetas publicadas por esas instituciones y no se les debe atribuir; solo se citan como fuente de los criterios (las URL se verificaron). `allergenHits()` compara la alergia del niño con los alérgenos de la receta (con sinónimos); por defecto se ocultan las recetas con alérgenos del niño. Al agregar recetas: ingredientes, pasos, alérgenos, `ageMin`, nota de seguridad y fuentes.

Cómo funciona la fase 2:
- Sin `.env` la app arranca en demostración. Con `.env` pide cuenta; la demostración sigue disponible ("Probar en modo demostración").
- La estructura de `S` es la misma en demo y nube. En la nube cada lista (feed, tasks, docs…) son filas de la tabla `items` y los ajustes de `settings`. `update()` calcula la diferencia y guarda; un refresco trae los cambios de otros (tiempo real + respaldo cada 30 s).
- **La privacidad la aplica la base de datos (RLS), no la app.** Si cambias qué ve un cuidador, cambia `can_read_item` / `caregiver_can_write` y agrega la prueba.
- Cada cuenta pertenece a una sola familia. Personas: `p1`, `p2` (papás), `c1`, `c2`… (cuidadores). En la nube, `split` de gastos = porcentaje del primer papá (`PARENTS[0]`).
- En la nube se ocultan las funciones que son simulación: cámaras, avisos de llegada, vincular calendarios, fotos. El menú de la semana es el ajuste `menu` (los cuidadores lo leen, no lo editan).

Limitaciones conocidas (decidir antes de publicar):
- Un cuidador puede reescribir los mensajes de la conversación de un evento (se guarda como un arreglo por evento). Mejor un renglón por mensaje.
- Ajustes nuevos en la nube: `menu`, `favs`, `since` (los cuidadores los leen; solo los papás los cambian).
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

## Marca (aprobada para usar en la app)
La identidad completa está en `docs/marca/`. Léela antes de tocar colores, textos o íconos.
- `docs/marca/README.md`: tono de voz, uso de color, tipografía, logotipo e iconografía.
- `docs/marca/tokens.json`: valores exactos de color (claro y oscuro), tipografía, espacios y radios.
- `docs/marca/logos/`: logotipo, símbolo e ícono de app en SVG (texto convertido a trazos).

Cambios que hay que aplicar en `src/theme.js` y en la app:
- `leaf` pasa de #2F8F5B a **#26774A** y `sky` de #3E6FD8 a **#305FCC** (en tema claro), para que el texto cumpla contraste 4.5:1. El tema oscuro no cambia.
- Agregar `onAccent` (#FFFFFF en claro, #0E1426 en oscuro) para texto sobre rellenos de baya, cielo, hoja o tinta.
- Colores por habilidad: Motricidad = hoja, Lógica = cielo, Lenguaje = sol, Creatividad = baya, Calma = tinta.
- Marca en el encabezado: usar el logotipo de `docs/marca/logos/` (con `react-native-svg`) en lugar del texto "Tribbu" con puntos.
- Ícono de la app y pantalla de inicio (`app.json`): exportar `tribbu-icono-app.svg` a PNG de 1024 × 1024 en `assets/icon.png`; splash con fondo `noche` (#141B33) y el símbolo al centro.
- Textos: seguir las reglas de tono de `docs/marca/README.md` (de tú, sin culpa, empezar por la acción, sin emojis en la app).
