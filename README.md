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

Dentro de la app, el selector "Papás / Abuela Carmen" arriba a la derecha muestra cómo cambia lo que ve cada quien.

## Estado
Fase 1: app completa con datos guardados en el teléfono (sin cuentas ni internet) para probar gratis con Expo Go. La IA es simulada.
