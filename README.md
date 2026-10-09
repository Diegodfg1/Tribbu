# Tribbu

App de apoyo a padres para iOS y Android: actividades didácticas sin pantallas con materiales de casa, agenda familiar, cocina, bitácora del niño, red de cuidadores y asistente con IA.

- `CLAUDE.md`: contexto completo del proyecto, fases y decisiones. Claude Code lo lee automáticamente.
- `prototipo-tribbu.html`: prototipo navegable de referencia. Ábrelo en el navegador.
- `App.js` y `src/`: código de la app (React Native con Expo).

## Probarla gratis en tu celular (paso a paso)

1. **Instala Node.js** (versión LTS) desde https://nodejs.org. Siguiente, siguiente, finalizar.
2. **Instala Expo Go** en tu celular desde la App Store (iPhone) o Google Play (Android).
3. **Descarga este proyecto**: en GitHub, botón verde "Code" → "Download ZIP", y descomprímelo. (O con `git clone` si ya usas Git.)
4. **Abre una terminal dentro de la carpeta del proyecto**:
   - Mac: clic derecho a la carpeta → "Nuevo terminal en la carpeta".
   - Windows: dentro de la carpeta, escribe `cmd` en la barra de direcciones y presiona Enter.
5. Escribe `npm install` y presiona Enter. Tarda unos minutos.
6. Escribe `npx expo start` y presiona Enter. Aparece un código QR.
7. **Escanéalo**: iPhone con la cámara, Android desde dentro de Expo Go. Tu celular y la computadora deben estar en la misma red Wi-Fi.
8. Si no conecta, usa `npx expo start --tunnel`.

## Los modos de la app

Al abrir Tribbu por primera vez eliges cómo probarla (sin cuenta, todo se guarda solo en tu teléfono):

- **Modo de prueba en blanco**: la app completa **sin datos de ejemplo**. Tú cargas a tus hijos, cuidadores, agenda, recetas, compras, gastos, etc. Para ver qué vería cada persona, usa **«Ver como»** arriba (por ejemplo, la Abuela Carmen que agregaste). En **Familia → Agregar persona** das de alta a otro papá o mamá y a cuidadores con su turno. Las cámaras, los avisos de llegada y los calendarios de Google, Outlook o iCloud son **simulaciones** que puedes probar con tus propios datos. Al final de la pantalla Familia hay un botón para **borrar todo y empezar de nuevo**.
- **Demostración con datos de ejemplo**: una familia ya cargada (Sofi, Mateo y sus abuelos) para ver la app llena.
- **Con cuenta** (cuando conectes Supabase, ver abajo): cada persona entra con su correo y la información se comparte entre teléfonos.

Puedes cambiar de modo desde **Familia → Cuenta y modo**. Cada modo guarda sus datos por separado.

## Activar cuentas e invitaciones (Supabase, gratis)

Sin esto la app funciona igual, pero solo en **modo demostración** (datos de ejemplo en tu teléfono). Con esto, cada persona tiene su cuenta y los datos se comparten entre teléfonos. Toma unos 15 minutos y no cuesta nada.

1. **Crea tu proyecto.** Entra a https://supabase.com, crea una cuenta (puedes usar Google) y toca **New project**. Nombre: `Tribbu`. Elige una contraseña de base de datos y guárdala. Región: la más cercana a México (por ejemplo East US). Plan: **Free**. Espera un par de minutos a que termine.
2. **Crea las tablas y las reglas de privacidad.** En el menú izquierdo abre **SQL Editor** → **New query**. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo** su contenido, pégalo y toca **Run**. Debe decir "Success. No rows returned".
3. **Para probar sin complicaciones**, apaga la confirmación de correo: **Authentication → Sign In / Providers → Email** y desactiva **Confirm email**. (Antes de publicar la app, vuelve a activarla.)
4. **Para "Olvidé mi contraseña"**, la app usa un código de 6 dígitos. En **Authentication → Email Templates → Reset Password**, agrega en el cuerpo del correo esta línea: `Tu código es: {{ .Token }}`. Si dejaste activa la confirmación de correo, haz lo mismo en **Confirm signup**.
5. **Copia tus llaves.** En **Project Settings → API** copia el **Project URL** y la llave **anon public** (también puede llamarse *publishable*). **Nunca uses la llave `service_role`** ni la compartas.
6. **Pégalas en la app.** En la carpeta del proyecto crea el archivo `.env` copiando `.env.example` (en la terminal: `cp .env.example .env`) y reemplaza los dos valores. En Mac los archivos que empiezan con punto están ocultos; para verlos presiona `Cmd + Shift + .` en Finder.
7. **Reinicia la app** con `npx expo start --clear` (el `--clear` es importante: sin él, Expo puede seguir usando las llaves anteriores).

Para probar invitaciones: crea tu cuenta y tu familia, ve a **Familia → Invitar**, crea una invitación para "cuidador" y copia el código. Cierra sesión, crea otra cuenta (otro correo) y elige **Tengo un código**. Así ves los dos lados en el mismo teléfono.

Los límites del plan gratis de correos de Supabase son bajos (unos pocos correos por hora). Para el lanzamiento se configura un servicio de correo propio.

## Pruebas de privacidad

Las reglas de quién ve qué viven en la base de datos (`supabase/schema.sql`) y se pueden probar con `supabase/tests/rls_test.sql` sobre un Postgres local (ver el encabezado de ese archivo).

## Estado
- **Fase 1** lista: app completa en modo demostración.
- **Modo en blanco** listo: toda la app con tus propios datos, solo en el teléfono.
- **Fase 2** lista en código: cuentas, familias, invitaciones, permisos por rol y sincronización. Probada de punta a punta con una base de datos Postgres local; pendiente de probar con tu proyecto real de Supabase y en tu teléfono.
- **Fase 3** pendiente: IA real, notificaciones, ubicación para avisos de llegada, archivos y fotos, y publicación en las tiendas.
