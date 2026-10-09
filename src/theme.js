import { useColorScheme } from 'react-native';

// Tipografías (se cargan en App.js con @expo-google-fonts).
export const F = {
  display: 'Baloo2_800ExtraBold',
  displayB: 'Baloo2_700Bold',
  body: 'AtkinsonHyperlegible_400Regular',
  bold: 'AtkinsonHyperlegible_700Bold',
};

// Paleta "crayón y papel": tinta azul marino, sol, hoja, baya y cielo.
export const light = {
  bg: '#E9EEF4', paper: '#FFFFFF', paper2: '#F4F6FA', ink: '#1E2A4F', inkSoft: '#56607E', line: '#D7DDEA',
  sun: '#F2B632', sunInk: '#3A2A00', leaf: '#26774A', leafBg: '#E3F3EA', berry: '#C2335A', berryBg: '#FBE6EC',
  onAccent: '#FFFFFF', sky: '#305FCC', skyBg: '#E5ECFB', amberBg: '#FDF1D3', night: '#141B33', scrim: 'rgba(14,20,38,0.45)', dark: false,
};
export const dark = {
  bg: '#0E1426', paper: '#18213A', paper2: '#1F2A47', ink: '#EEF1FA', inkSoft: '#A7B0CC', line: '#2C3858',
  sun: '#F5C04A', sunInk: '#2A1E00', leaf: '#5CC48A', leafBg: '#173528', berry: '#F0729A', berryBg: '#3D1A28',
  onAccent: '#0E1426', sky: '#7FA3F2', skyBg: '#1D2A4F', amberBg: '#3A2F12', night: '#080C1A', scrim: 'rgba(0,0,0,0.6)', dark: true,
};

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light;
}

// Tonos para etiquetas: [fondo, texto]
export const tone = (c, name) => ({
  leaf: [c.leafBg, c.leaf], berry: [c.berryBg, c.berry], sky: [c.skyBg, c.sky], amber: [c.amberBg, c.ink], sun: [c.sun, c.sunInk], ink: [c.ink, c.paper],
}[name] || [c.paper2, c.ink]);
