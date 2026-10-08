import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { KIDS, SHIFT, isCG, kidKey } from './src/data';
import { NavIcon } from './src/parts';
import { ChatSheet } from './src/sheets';
import { StoreProvider, useStore } from './src/store';
import { F, useTheme } from './src/theme';
import { Avatar, Btn, Row, Seg, T, UIProvider, useUI } from './src/ui';
import Agenda from './src/screens/Agenda';
import Casa from './src/screens/Casa';
import Cocina from './src/screens/Cocina';
import Familia from './src/screens/Familia';
import Hoy from './src/screens/Hoy';
import Jugar from './src/screens/Jugar';

const SCREENS = { hoy: Hoy, jugar: Jugar, agenda: Agenda, cocina: Cocina, familia: Familia, casa: Casa };
const LABELS = { hoy: 'Hoy', jugar: 'Jugar', agenda: 'Agenda', cocina: 'Cocina', familia: 'Familia', casa: 'Casa' };
const tabsFor = (S) => (isCG(S) ? ['hoy', 'jugar', 'agenda', 'cocina', 'familia'] : ['hoy', 'jugar', 'agenda', 'cocina', 'familia', 'casa']);

function Header() {
  const c = useTheme();
  const { S, update } = useStore();
  const { toast } = useUI();
  const insets = useSafeAreaInsets();
  const cg = isCG(S);
  const kids = cg ? [SHIFT.kid] : Object.keys(KIDS);
  const setRole = (role) => {
    update((d) => { d.role = role; if (role === 'cuidador' && d.view === 'casa') d.view = 'hoy'; });
    toast(role === 'cuidador' ? 'Ahora ves la app como Abuela Carmen' : 'Ahora ves la app como papás');
  };
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 10, gap: 10, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: F.display, fontSize: 28, color: c.ink }}>Tribbu</Text>
        <Seg options={[['padres', 'Papás'], ['cuidador', 'Abuela Carmen']]} value={S.role} onChange={setRole} />
      </View>
      <Row gap={8}>
        {kids.map((k) => {
          const on = k === kidKey(S);
          return (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }}
              onPress={() => { if (!cg) update((d) => { d.kid = k; }); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingLeft: 5, paddingRight: 12, borderRadius: 99, borderWidth: 1.5, borderColor: on ? c.ink : c.line, backgroundColor: on ? c.paper : 'transparent' }}>
              <Avatar letter={KIDS[k].name[0]} bg={k === 'sofi' ? c.sun : c.leafBg} fg={k === 'sofi' ? c.sunInk : c.ink} size={28} />
              <T v="bold">{`${KIDS[k].name} `}<T v="small">{`${KIDS[k].age} años`}</T></T>
            </Pressable>
          );
        })}
      </Row>
      {cg ? (
        <View style={{ backgroundColor: c.amberBg, borderRadius: 12, padding: 10 }}>
          <T v="small" color={c.ink}>{`🔒 Vista de cuidadora: Abuela Carmen solo ve su turno con Sofi (${SHIFT.from} a ${SHIFT.to}), lo necesario para cuidarla y todas las actividades.`}</T>
        </View>
      ) : null}
    </View>
  );
}

function TabBar({ tabs }) {
  const c = useTheme();
  const { S, update } = useStore();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.paper, borderTopWidth: 1, borderTopColor: c.line, paddingBottom: insets.bottom, paddingTop: 6 }}>
      {tabs.map((t) => {
        const on = t === S.view;
        return (
          <Pressable key={t} onPress={() => update((d) => { d.view = t; })} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 }}>
            <NavIcon name={t} color={on ? c.ink : c.inkSoft} />
            <Text style={{ fontFamily: on ? F.bold : F.body, fontSize: 11, color: on ? c.ink : c.inkSoft }}>{LABELS[t]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Shell() {
  const c = useTheme();
  const { S, reset } = useStore();
  const { openSheet, toast } = useUI();
  const tabs = tabsFor(S);
  const view = tabs.includes(S.view) ? S.view : 'hoy';
  const Screen = SCREENS[view];
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      <Header />
      <ScrollView key={view + S.role} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 90 }}>
        <Screen />
        <Btn sm kind="ghost" style={{ alignSelf: 'center', opacity: 0.6 }} onPress={() => { reset(); toast('Datos de ejemplo restablecidos'); }}>
          Reiniciar datos de ejemplo
        </Btn>
      </ScrollView>
      <Pressable onPress={() => openSheet(<ChatSheet />)} accessibilityRole="button" accessibilityLabel="Pregúntale a Tribbu"
        style={{ position: 'absolute', right: 16, bottom: 14 + 64, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.sun, borderRadius: 99, paddingVertical: 11, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}>
        <Text style={{ fontFamily: F.bold, fontSize: 14, color: c.sunInk }}>✦ Pregúntale a Tribbu</Text>
      </Pressable>
      <TabBar tabs={tabs} />
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold, AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <UIProvider>
          <Shell />
        </UIProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
