// Selectores de fecha y de hora que se despliegan en el mismo lugar (sin ventanas encimadas),
// para que funcionen igual dentro de hojas y de pantallas completas.
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { DAYS, MONTHS, dateLong, dk, fromKey, mins, todayKey } from './data';
import { F, useTheme } from './theme';
import { Btn, Chip, Row, T } from './ui';

const pad = (n) => String(n).padStart(2, '0');
const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Cuadrícula de un mes. value: 'AAAA-MM-DD'. marks: lista de fechas con eventos (se marcan con un punto).
export function MonthGrid({ value, onPick, marks = [] }) {
  const c = useTheme();
  const sel = fromKey(value);
  const [m, setM] = useState({ y: sel.getFullYear(), mo: sel.getMonth() });
  const first = new Date(m.y, m.mo, 1);
  const lead = (first.getDay() + 6) % 7; // lunes = 0
  const total = new Date(m.y, m.mo + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  const shift = (n) => setM(({ y, mo }) => { const d = new Date(y, mo + n, 1); return { y: d.getFullYear(), mo: d.getMonth() }; });
  const tk = todayKey();
  const set = new Set(marks);
  return (
    <View style={{ gap: 6, backgroundColor: c.paper2, borderRadius: 14, padding: 10 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel="Mes anterior" hitSlop={8} style={{ padding: 6 }}><T v="h3">‹</T></Pressable>
        <T v="h3" accessibilityLiveRegion="polite">{`${MONTHS[m.mo]} ${m.y}`}</T>
        <Pressable onPress={() => shift(1)} accessibilityRole="button" accessibilityLabel="Mes siguiente" hitSlop={8} style={{ padding: 6 }}><T v="h3">›</T></Pressable>
      </Row>
      <View style={{ flexDirection: 'row' }}>
        {WEEK.map((w, i) => <T key={i} v="small" style={{ flex: 1, textAlign: 'center' }}>{w}</T>)}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {r.map((n, ci) => {
            if (!n) return <View key={ci} style={{ flex: 1, height: 38 }} />;
            const k = `${m.y}-${pad(m.mo + 1)}-${pad(n)}`;
            const on = k === value;
            return (
              <Pressable key={ci} onPress={() => onPick(k)} accessibilityRole="button" accessibilityLabel={dateLong(fromKey(k))} accessibilityState={{ selected: on }}
                style={{ flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.ink : 'transparent', borderWidth: k === tk && !on ? 1.5 : 0, borderColor: c.sun }}>
                  <T style={{ fontFamily: on || k === tk ? F.bold : F.body, fontSize: 14, color: on ? c.paper : c.ink }}>{String(n)}</T>
                </View>
                {set.has(k) ? <View style={{ position: 'absolute', bottom: 1, width: 5, height: 5, borderRadius: 3, backgroundColor: on ? c.paper : c.sun }} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
      <Row gap={6}>
        <Btn sm kind="ghost" onPress={() => { const d = new Date(); setM({ y: d.getFullYear(), mo: d.getMonth() }); onPick(tk); }}>Hoy</Btn>
      </Row>
    </View>
  );
}

const fieldBox = (c) => ({ borderWidth: 1.5, borderColor: c.line, backgroundColor: c.paper, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' });

export function DateField({ label, value, onChange, marks }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const d = fromKey(value);
  return (
    <View style={{ gap: 6 }}>
      {label ? <T v="label">{label}</T> : null}
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={`${label || 'Fecha'}: ${dateLong(d)}`} style={fieldBox(c)}>
        <T v="bold">{`${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`}</T>
        <T v="small">{open ? 'Cerrar' : 'Cambiar'}</T>
      </Pressable>
      {open ? <MonthGrid value={value} marks={marks} onPick={(k) => { onChange(k); setOpen(false); }} /> : null}
    </View>
  );
}

// Hora en formato 24 h 'HH:MM'. Se elige la hora y los minutos de 5 en 5.
export function TimeField({ label, value, onChange }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const [h, mi] = value.split(':').map(Number);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const set = (nh, nm) => onChange(`${pad(nh)}:${pad(nm)}`);
  return (
    <View style={{ gap: 6, flex: 1 }}>
      {label ? <T v="label">{label}</T> : null}
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={`${label || 'Hora'}: ${value}`} style={fieldBox(c)}>
        <T v="bold">{value}</T>
        <T v="small">{open ? 'Cerrar' : 'Cambiar'}</T>
      </Pressable>
      {open ? (
        <View style={{ gap: 8, backgroundColor: c.paper2, borderRadius: 14, padding: 10 }}>
          <T v="label">Hora</T>
          <Row gap={6} wrap>{hours.map((x) => <Chip key={x} on={x === h} onPress={() => set(x, mi)}>{pad(x)}</Chip>)}</Row>
          <T v="label">Minutos</T>
          <Row gap={6} wrap>{minutes.map((x) => <Chip key={x} on={x === mi} onPress={() => { set(h, x); setOpen(false); }}>{pad(x)}</Chip>)}</Row>
        </View>
      ) : null}
    </View>
  );
}

export const addMinutes = (t, n) => { const m = Math.min(23 * 60 + 59, mins(t) + n); return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
export { dk };
