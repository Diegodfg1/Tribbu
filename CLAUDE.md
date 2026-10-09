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
Escritos (sin ejecutar todavía; revisar y corregir al correr la app):
- `src/data.js` — datos de ejemplo, fechas, estado inicial `fresh()`, derivados por rol.
- `src/theme.js`, `src/store.js`, `src/ui.js`, `src/ai.js`, `src/scenes.js`, `src/parts.js`, `src/sheets.js`
- `src/screens/Hoy.js`, `src/screens/Jugar.js`, `src/screens/Agenda.js`

Pendientes:
- `src/screens/Cocina.js` — pestañas Menú / Compras / Recetas (la cuidadora solo ve "Menú de hoy" y Recetas). Botón para armar la lista de compras desde el menú, agrupada por pasillo (`aisleOf`). Importar receta desde enlace (en fase 1 crea un borrador). Usar `RecipeSheet` y `UploadRecipeSheet`.
- `src/screens/Familia.js` — bitácora del niño activo con nivel informativo/atención/urgente, ficha de emergencia, documentos compartidos, tabla "Qué ve cada quien" y red de cuidado (solo papás). La cuidadora no ve entradas con `parentsOnly`.
- `src/screens/Casa.js` (solo papás) — cámaras (`LiveCamSheet`, avisos a la bitácora como `parentsOnly`), documentos con interruptor "compartir con cuidadores" y subir documento, gastos compartidos con balance y modo coparentalidad (custodia semanal), avisos de llegada por cuidador, botón de modo pizarra.
- `App.js` — cargar fuentes, `SafeAreaProvider` > `StoreProvider` > `UIProvider` > Shell: encabezado (marca "Tribbu", selector de rol, niños; la cuidadora solo ve a Sofi y un aviso de vista restringida), pantalla activa en un `ScrollView` (padding 16, gap 16), barra de pestañas inferior con `NavIcon` (la cuidadora no tiene "Casa") y botón flotante "Pregúntale a Tribbu" que abre `ChatSheet`.
- `app.json` con nombre "Tribbu", slug "tribbu", `userInterfaceStyle: "automatic"`.
- Un botón discreto para reiniciar los datos de ejemplo (`reset` del store).

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
