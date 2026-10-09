import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { KIDS, dateLong, dayShort, evKey, fromKey, whoText, evKids, evPeople } from '../data';
import { feedStats, mileSummary, taskStats, upcomingEvents } from '../stats';
import { ProgressBar } from '../parts';
import { EventSheet } from '../sheets';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Between, Card, Chip, Pill, Row, Seg, T, useUI } from '../ui';

// Una cifra grande con su título (sin gráfica: solo un número).
function Tile({ n, label, sub, flag }) {
  const c = useTheme();
  return (
    <View style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: c.paper, borderRadius: 16, borderWidth: 1.5, borderColor: c.line, padding: 12, gap: 2 }}
      accessible accessibilityLabel={`${label}: ${n}${sub ? '. ' + sub : ''}`}>
      <T v="label">{label}</T>
      <T v="h1" style={{ fontSize: 30, lineHeight: 36 }}>{String(n)}</T>
      {sub ? <T v="small" color={flag ? c.berry : c.inkSoft}>{(flag ? '⚠ ' : '') + sub}</T> : null}
    </View>
  );
}

// Columnas de registros por día: un solo color, hoy resaltado, números solo en hoy y en el máximo.
function Columns({ perDay, max, n }) {
  const c = useTheme();
  const H = 84;
  const peak = perDay.reduce((m, p, i) => (p.n > perDay[m].n ? i : m), 0);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: H + 34, gap: n > 10 ? 2 : 6 }}>
      {perDay.map((p, i) => {
        const isToday = i === perDay.length - 1;
        const show = isToday || (i === peak && p.n > 0);
        const h = p.n ? Math.max(4, Math.round((p.n / max) * H)) : 2;
        const lbl = n <= 10 ? dayShort(fromKey(p.d)).slice(0, 2) : (isToday ? 'hoy' : (i % 7 === 0 ? p.d.slice(8) : ''));
        return (
          <View key={p.d} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: H + 34 }} accessible accessibilityLabel={`${dateLong(fromKey(p.d))}: ${p.n} registros`}>
            <T v="small" style={{ height: 18, fontSize: 12 }}>{show ? String(p.n) : ''}</T>
            <View style={{ width: '100%', maxWidth: 24, height: h, backgroundColor: p.n ? (isToday ? c.sun : c.sky) : c.line, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
            <T v="small" style={{ fontSize: 11, height: 16 }}>{lbl}</T>
          </View>
        );
      })}
    </View>
  );
}

function Legend({ items }) {
  const c = useTheme();
  return (
    <Row wrap gap={14}>
      {items.map(([col, t]) => (
        <Row key={t} gap={6}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: col }} /><T v="small">{t}</T></Row>
      ))}
    </Row>
  );
}

// Barra horizontal con el nombre y la cifra en texto (el color solo acompaña).
function HBar({ name, n, max, color, extra }) {
  const c = useTheme();
  return (
    <View style={{ gap: 3 }} accessible accessibilityLabel={`${name}: ${n}${extra ? ', ' + extra : ''}`}>
      <Between><T v="bold" style={{ fontSize: 14 }}>{name}</T><T v="num" style={{ fontSize: 14 }}>{String(n)}</T></Between>
      <ProgressBar value={n} total={max} color={color || c.sky} height={10} label={name} />
    </View>
  );
}

export default function Resumen() {
  const c = useTheme();
  const { S } = useStore();
  const { openSheet } = useUI();
  const [n, setN] = useState(7);
  const [kid, setKid] = useState('all');
  const [tabla, setTabla] = useState(false);
  const kids = Object.keys(KIDS);
  const f = feedStats(S, n, kid);
  const up = upcomingEvents(S, kid);
  const tk = taskStats(S, kid);
  const ms = mileSummary(S, kid);
  const maxKind = Math.max(1, ...f.byKind.map((x) => x.n));
  const maxTask = Math.max(1, ...tk.people.map((p) => p.open + p.done));
  const periodo = n === 7 ? 'últimos 7 días' : 'últimos 30 días';

  return (
    <>
      <Card style={{ gap: 10 }}>
        <T v="h3">Resumen de la familia</T>
        <Row wrap>
          <Seg options={[[7, '7 días'], [30, '30 días']]} value={n} onChange={setN} />
          <Seg options={[[false, 'Gráficas'], [true, 'Tabla']]} value={tabla} onChange={setTabla} />
        </Row>
        {kids.length > 1 ? (
          <Row wrap gap={6}>
            <Chip on={kid === 'all'} onPress={() => setKid('all')}>Todos</Chip>
            {kids.map((k) => <Chip key={k} on={kid === k} onPress={() => setKid(k)}>{KIDS[k].name}</Chip>)}
          </Row>
        ) : null}
      </Card>

      <Row wrap gap={10} style={{ alignItems: 'stretch' }}>
        <Tile n={up.total} label="Eventos próximos" sub="en los siguientes 7 días" />
        <Tile n={f.total} label="Registros" sub={periodo} />
        <Tile n={tk.open} label="Pendientes abiertos" sub={tk.overdue ? `${tk.overdue} vencidos` : 'ninguno vencido'} flag={tk.overdue > 0} />
        <Tile n={ms.reduce((a, m) => a + m.all, 0)} label="Hitos logrados" sub="en total" />
      </Row>

      <Card style={{ gap: 10 }}>
        <T v="h3">Registros por día</T>
        {tabla ? (
          f.perDay.slice().reverse().map((p) => <Between key={p.d}><T v="small">{dateLong(fromKey(p.d))}</T><T v="num" style={{ fontSize: 14 }}>{String(p.n)}</T></Between>)
        ) : f.total ? <Columns perDay={f.perDay} max={f.max} n={n} /> : <T v="small">Todavía no hay registros en este periodo. Anota uno desde Hoy con los botones rápidos.</T>}
        {!tabla && f.total ? <T v="small">El día de hoy va resaltado.</T> : null}
      </Card>

      <Card style={{ gap: 10 }}>
        <T v="h3">Registros por tipo</T>
        {f.byKind.length ? f.byKind.map((x) => <HBar key={x.kind} name={x.kind} n={x.n} max={maxKind} />) : <T v="small">Sin registros en este periodo.</T>}
      </Card>

      <Card style={{ gap: 6 }}>
        <Between><T v="h3">Eventos de la semana</T><Pill tone="sky">{`${up.total}`}</Pill></Between>
        {up.days.map(({ d, i, evs }) => (
          <View key={d} style={{ paddingVertical: 4, gap: 2, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <Between><T v="bold" style={{ fontSize: 14 }}>{i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dateLong(fromKey(d))}</T><T v="small">{evs.length ? `${evs.length} ${evs.length === 1 ? 'evento' : 'eventos'}` : 'libre'}</T></Between>
            {evs.map((e) => (
              <Pressable key={evKey(e)} onPress={() => openSheet(<EventSheet k={evKey(e)} />)} accessibilityRole="button" style={{ flexDirection: 'row', gap: 8, paddingVertical: 3 }}>
                <T v="num" style={{ width: 46, fontSize: 14 }}>{e.time}</T>
                <T style={{ flex: 1 }}>{e.t}</T>
                <T v="small">{whoText(evKids(e), evPeople(e))}</T>
              </Pressable>
            ))}
          </View>
        ))}
      </Card>

      <Card style={{ gap: 10 }}>
        <T v="h3">Pendientes por persona</T>
        <Legend items={[[c.sky, 'Abiertos'], [c.line, 'Hechos']]} />
        {tk.people.length ? tk.people.map((p) => (
          <View key={p.w || 'x'} style={{ gap: 3 }} accessible accessibilityLabel={`${p.name}: ${p.open} abiertos, ${p.done} hechos`}>
            <Between><T v="bold" style={{ fontSize: 14 }}>{p.name}</T><T v="small">{`${p.open} abiertos · ${p.done} hechos`}</T></Between>
            {tabla ? null : (
              <View style={{ flexDirection: 'row', height: 10, gap: 2 }}>
                {p.open ? <View style={{ flex: p.open, backgroundColor: c.sky, borderRadius: 5 }} /> : null}
                {p.done ? <View style={{ flex: p.done, backgroundColor: c.line, borderRadius: 5 }} /> : null}
              </View>
            )}
          </View>
        )) : <T v="small">No hay pendientes. ¡Todo al día!</T>}
      </Card>

      <Card style={{ gap: 10 }}>
        <T v="h3">Desarrollo</T>
        {ms.map((m) => (
          <View key={m.kid} style={{ gap: 4 }}>
            <Between><T v="bold">{m.name}</T><T v="small">{m.label}</T></Between>
            <ProgressBar value={m.done} total={m.total} color={c.leaf} height={10} label={`Hitos de ${m.name}`} />
            <T v="small">{`${m.done} de ${m.total} hitos de su edad${m.pending ? ` · ${m.pending} de edades anteriores sin marcar` : ''}`}</T>
          </View>
        ))}
        <T v="small">Los hitos son una guía, no un diagnóstico. Ve el detalle por área en Jugar → Hitos.</T>
      </Card>
    </>
  );
}
