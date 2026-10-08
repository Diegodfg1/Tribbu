// Piezas reutilizables entre pantallas.
import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { KIDS, MATS, PEOPLE, SKILLS, kidKey } from './data';
import { DEMOS } from './scenes';
import { useStore } from './store';
import { useTheme } from './theme';
import { Check, Pill, Row, T } from './ui';

export function Glyph({ sk, size = 34 }) {
  const c = useTheme();
  const s = { fill: 'none', stroke: c.ink, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {sk === 'motricidad' && <Path d="M10 34c4-12 10-18 22-20M18 20l6 6" {...s} />}
      {sk === 'logica' && <><Rect x="8" y="8" width="12" height="12" rx="3" {...s} /><Rect x="24" y="24" width="12" height="12" rx="6" {...s} /></>}
      {sk === 'lenguaje' && <Path d="M8 12h28v16H20l-8 6v-6H8z" {...s} />}
      {sk === 'creatividad' && <Path d="M22 6l4 10 10 2-8 7 2 11-8-6-8 6 2-11-8-7 10-2z" {...s} />}
      {sk === 'calma' && <Path d="M8 26c5-6 9-6 14 0s9 6 14 0" {...s} />}
    </Svg>
  );
}

export function ActCard({ a, i = 0, onPress }) {
  const c = useTheme();
  const { S } = useStore();
  const k = KIDS[kidKey(S)];
  const miss = a.mats.filter((m) => !S.have.includes(m));
  const okAge = k.age >= a.age[0] && k.age <= a.age[1];
  const sw = [c.sun, c.skyBg, c.leafBg, c.berryBg, c.amberBg][i % 5];
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={{ flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.paper, borderRadius: 18, padding: 12, opacity: miss.length || !okAge ? 0.55 : 1 }}>
      <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: sw, alignItems: 'center', justifyContent: 'center' }}><Glyph sk={a.sk} /></View>
      <View style={{ flex: 1, gap: 4 }}>
        <T v="h3">{a.t}</T>
        <Row gap={4} wrap>
          <Pill tone={SKILLS[a.sk][1]}>{SKILLS[a.sk][0]}</Pill>
          <Pill>{`${a.min} min`}</Pill>
          <Pill>{`${a.age[0]}–${a.age[1]} años`}</Pill>
          {DEMOS[a.id] ? <Pill tone="sky">Animada</Pill> : null}
        </Row>
        {miss.length
          ? <T v="small" color={c.berry}>{`Te falta: ${miss.map((m) => MATS[m]).join(', ')}`}</T>
          : <T v="small">{a.mats.map((m) => MATS[m]).join(' · ')}</T>}
      </View>
    </Pressable>
  );
}

export function TaskRow({ t, first }) {
  const c = useTheme();
  const { update } = useStore();
  return (
    <View style={{ paddingVertical: 9, borderTopWidth: first ? 0 : 1, borderTopColor: c.line }}>
      <Check on={t.done} label={t.t} onPress={() => update((d) => { const x = d.tasks.find((y) => y.id === t.id); x.done = !x.done; })}>
        <T style={t.done ? { textDecorationLine: 'line-through', color: c.inkSoft } : null}>{t.t}</T>
        <View style={{ marginTop: 3 }}><Pill>{PEOPLE[t.who][0]}</Pill></View>
      </Check>
    </View>
  );
}

const ICONS = {
  hoy: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  jugar: 'M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM17 3a4 4 0 1 1 0 8a4 4 0 1 1 0-8M7 14l4 7H3zM17 13a4 4 0 1 1 0 8a4 4 0 1 1 0-8',
  agenda: 'M6 5h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM3 10h18M8 3v4M16 3v4',
  cocina: 'M4 11h16a8 8 0 0 1-16 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4',
  familia: 'M8 5a3 3 0 1 1 0 6a3 3 0 1 1 0-6M17 6.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14 20c0-2.5 1.5-5 3.5-5S22 17 22 20',
  casa: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
};
export function NavIcon({ name, color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d={ICONS[name]} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SunMark() {
  const c = useTheme();
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const r = (a * Math.PI) / 180;
    return `M${60 + 38 * Math.cos(r)} ${60 + 38 * Math.sin(r)}L${60 + 52 * Math.cos(r)} ${60 + 52 * Math.sin(r)}`;
  }).join('');
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120" style={{ position: 'absolute', right: -14, top: -14, opacity: 0.35 }}>
      <Circle cx="60" cy="60" r="26" fill={c.paper} />
      <Path d={rays} stroke={c.paper} strokeWidth={6} strokeLinecap="round" />
    </Svg>
  );
}

export function PinIcon() {
  const c = useTheme();
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path d="M8 15s5-5 5-8.5A5 5 0 0 0 3 6.5C3 10 8 15 8 15z" fill={c.leaf} />
      <Circle cx="8" cy="6.5" r="1.8" fill={c.paper} />
    </Svg>
  );
}
