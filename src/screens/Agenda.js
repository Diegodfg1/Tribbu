import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  BASE_EVENTS, EXT_EVENTS, KIDS, MEMBERS, MONTHS, SHIFT, SRC, dateLong, dayEvents, dayLong, dayShort, dk, evKey, fromKey, inShift, isCG, isOwn, mins, overlaps, tasksSorted, today, todayKey,
} from '../data';
import { EventEditor, TaskEditor } from '../editors';
import { TaskRow } from '../parts';
import { MonthGrid } from '../pickers';
import { CalendarsSheet, EventSheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Pill, Row, T, useUI } from '../ui';

const Sq = ({ color }) => <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />;

function EventRow({ e, ext, first, dayLbl }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  const box = { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: first ? 0 : 1, borderTopColor: c.line };
  const time = (
    <View style={{ width: 50 }}>
      <T v="num">{e.time}</T>
      <T v="small">{e.end}</T>
    </View>
  );
  if (e.src !== 'familia') {
    return (
      <View style={box}>{time}
        <View style={{ flex: 1, gap: 3 }}>
          <T v="bold" color={c.inkSoft}>{e.t}</T>
          <Row gap={6}><Sq color={c[SRC[e.src].color]} /><T v="small" style={{ flex: 1 }}>{SRC[e.src].n + (S.cal[e.src].mode === 'ocupado' ? ' · el otro papá ve «Ocupado»' : '')}</T></Row>
        </View>
      </View>
    );
  }
  const clash = ext.find((x) => overlaps(e, x));
  const n = (S.evchat[evKey(e)] || []).length;
  return (
    <View style={box}>{time}
      <View style={{ flex: 1, gap: 4 }}>
        <Pressable onPress={() => openSheet(<EventSheet k={evKey(e)} />)}><T v="bold">{e.t}</T></Pressable>
        <Row gap={4} wrap>
          <Sq color={c.sun} /><Pill tone="sky">{e.tag}</Pill><Pill>{KIDS[e.kid].name}</Pill>
          {n ? <Pill tone="leaf">{`${n} mensaje${n > 1 ? 's' : ''}`}</Pill> : null}
        </Row>
        {clash ? (
          <View style={{ backgroundColor: c.amberBg, borderRadius: 10, padding: 8, gap: 6, marginTop: 4 }}>
            <T v="small" color={c.ink}>{`Choca con «${clash.t}» (${SRC[clash.src].n}).`}</T>
            <Btn sm style={{ alignSelf: 'flex-start' }} onPress={() => {
              const g = MEMBERS.find((x) => x.role === 'caregiver');
              if (!g) { toast('Primero invita a un cuidador desde Familia'); return; }
              update((d) => { d.tasks.unshift({ id: Date.now(), t: `Cubrir: ${e.t} (${dayLbl}, ${e.time})`, who: g.key, done: false }); });
              toast(`Le pedimos apoyo a ${g.name}`);
            }}>Pedir apoyo a la red</Btn>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ParentsAgenda() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, openFull, toast } = useUI();
  const [sel, setSel] = useState(todayKey());
  const [showCal, setShowCal] = useState(false);
  const selD = fromKey(sel);
  const monday = new Date(selD);
  monday.setDate(selD.getDate() - ((selD.getDay() + 6) % 7));
  const days = [0, 1, 2, 3, 4, 5, 6].map((n) => { const d = new Date(monday); d.setDate(monday.getDate() + n); return d; });
  const { all, ext } = dayEvents(S, sel);
  const dayLbl = dateLong(selD);
  const linked = Object.keys(S.cal).filter((k) => S.cal[k].on).length;
  const marks = [...new Set([...BASE_EVENTS, ...S.myevents, ...(S.extevents || EXT_EVENTS)].map((e) => e.d))];
  const tones = [c.sun, c.leafBg, c.berryBg];
  const hr = (t) => mins(t) / 60;
  const shifts = MEMBERS.filter((m) => m.role === 'caregiver' && KIDS[m.kid])
    .map((m, i) => [`${m.name} · ${KIDS[m.kid].name}`, hr(m.from), hr(m.to), tones[i % 3]]);
  if (!isOwn(S)) shifts.push(['Tú', 19, 22, c.skyBg]);
  const pos = (h) => Math.max(0, Math.min(100, ((h - 8) / 14) * 100));
  const move = (n) => { const d = new Date(selD); d.setDate(d.getDate() + 7 * n); setSel(dk(d)); };
  const tasks = tasksSorted(S.tasks);
  const doneCount = tasks.filter((t) => t.done).length;
  const short = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
  return (
    <>
      <Between><T v="h2">Agenda familiar</T><Btn sm kind="ghost" onPress={() => openSheet(<CalendarsSheet />)}>{`Calendarios · ${linked + 1}`}</Btn></Between>
      <Between>
        <Pressable onPress={() => move(-1)} accessibilityRole="button" accessibilityLabel="Semana anterior" hitSlop={8} style={{ paddingHorizontal: 10 }}><T v="h2">‹</T></Pressable>
        <Pressable onPress={() => setShowCal((v) => !v)} accessibilityRole="button" accessibilityLabel="Ir a una fecha" style={{ flex: 1, alignItems: 'center' }}>
          <T v="bold">{`${short(days[0])} – ${short(days[6])}`}</T>
          <T v="small" color={c.sky}>{showCal ? 'Cerrar calendario' : 'Ir a otra fecha'}</T>
        </Pressable>
        <Pressable onPress={() => move(1)} accessibilityRole="button" accessibilityLabel="Semana siguiente" hitSlop={8} style={{ paddingHorizontal: 10 }}><T v="h2">›</T></Pressable>
      </Between>
      {showCal ? <MonthGrid value={sel} marks={marks} onPick={(k) => { setSel(k); setShowCal(false); }} /> : null}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {days.map((d) => {
          const k = dk(d); const on = k === sel; const has = marks.includes(k) && dayEvents(S, k).all.length > 0;
          return (
            <Pressable key={k} onPress={() => setSel(k)} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 14, backgroundColor: on ? c.ink : 'transparent', borderWidth: k === todayKey() && !on ? 1.5 : 0, borderColor: c.sun, gap: 1 }}>
              <T v="small" color={on ? c.paper : c.inkSoft} style={{ fontFamily: F.bold, fontSize: 11 }}>{dayShort(d)}</T>
              <T style={{ fontFamily: F.displayB, fontSize: 18, color: on ? c.paper : c.ink }}>{String(d.getDate())}</T>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: has ? c.sun : 'transparent' }} />
            </Pressable>
          );
        })}
      </View>
      <Card style={{ gap: 0 }}>
        <T v="label" style={{ marginBottom: 4 }}>{`${dayLbl} · toca un evento para ver su conversación`}</T>
        {all.length ? all.map((e, i) => <EventRow key={`${e.src}${e.time}${e.t}`} e={e} ext={ext} first={i === 0} dayLbl={dayLbl} />) : <T v="small">Sin eventos este día.</T>}
        <Btn kind="sun" style={{ marginTop: 10 }} onPress={() => openFull(<EventEditor date={sel} onDone={setSel} />)}>+ Agregar evento</Btn>
      </Card>
      <Card style={{ gap: 0 }}>
        <Between style={{ marginBottom: 4 }}><T v="h3">Pendientes</T><T v="label">{`${tasks.length - doneCount} abiertos`}</T></Between>
        {tasks.length ? tasks.map((t, i) => <TaskRow key={t.id} t={t} first={i === 0} onEdit={(id) => openFull(<TaskEditor id={id} />)} />) : <T v="small">No hay pendientes.</T>}
        <Row style={{ marginTop: 10 }} wrap>
          <Btn kind="sun" onPress={() => openFull(<TaskEditor id={null} />)}>+ Agregar pendiente</Btn>
          {doneCount ? <Btn kind="ghost" onPress={() => { update((d) => { d.tasks = d.tasks.filter((t) => !t.done); }); toast(`Se quitaron ${doneCount} pendientes completados`); }}>Quitar completados</Btn> : null}
        </Row>
      </Card>
      <Card>
        <Between><T v="h3">Turnos de cuidado de hoy</T><T v="label">8:00 – 22:00</T></Between>
        {shifts.length ? shifts.map(([n, a, b, col]) => (
          <View key={n} style={{ height: 26, borderRadius: 8, backgroundColor: c.paper2, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos(a)}%`, width: `${pos(b) - pos(a)}%`, backgroundColor: col, borderRadius: 8, justifyContent: 'center', paddingLeft: 8 }}>
              <T v="small" color={c.ink} numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 11 }}>{`${n} ${Math.round(a)}–${Math.round(b)}h`}</T>
            </View>
          </View>
        )) : <T v="small">Aún no hay cuidadores con turno. Agrégalos en Familia.</T>}
      </Card>
    </>
  );
}

function CaregiverAgenda() {
  const c = useTheme();
  const { S } = useStore();
  const { openSheet } = useUI();
  const evs = dayEvents(S, dk(today)).fam.filter(inShift);
  const span = mins(SHIFT.to) - mins(SHIFT.from);
  const pos = (t) => ((mins(t) - mins(SHIFT.from)) / span) * 100;
  return (
    <>
      <Between><T v="h2">Tu agenda de cuidado</T><T v="label">{dayLong(today)}</T></Between>
      <Card>
        <Between><T v="h3">{`Tu turno con ${KIDS[SHIFT.kid] ? KIDS[SHIFT.kid].name : ''}`}</T><T v="label">{`${SHIFT.from} – ${SHIFT.to}`}</T></Between>
        <View style={{ height: 34, borderRadius: 8, backgroundColor: c.amberBg, overflow: 'hidden' }}>
          {evs.map((e) => (
            <View key={e.t} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos(e.time)}%`, width: `${Math.min(100 - pos(e.time), pos(e.end) - pos(e.time))}%`, backgroundColor: c.sun, borderRadius: 8, justifyContent: 'center', paddingLeft: 6 }}>
              <T v="small" color={c.sunInk} style={{ fontFamily: F.bold, fontSize: 11 }}>{e.time}</T>
            </View>
          ))}
        </View>
        {evs.map((e, i) => (
          <Pressable key={evKey(e)} onPress={() => openSheet(<EventSheet k={evKey(e)} />)}
            style={{ flexDirection: 'row', gap: 10, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <View style={{ width: 50 }}><T v="num">{e.time}</T><T v="small">{e.end}</T></View>
            <View style={{ flex: 1 }}><T v="bold">{e.t}</T><T v="small">{`${(S.evchat[evKey(e)] || []).length} mensajes · toca para ver`}</T></View>
          </Pressable>
        ))}
      </Card>
      <Card style={{ gap: 0 }}>
        <T v="h3" style={{ marginBottom: 4 }}>Tus pendientes</T>
        {S.tasks.filter((t) => t.who === SHIFT.who).map((t, i) => <TaskRow key={t.id} t={t} first={i === 0} />)}
      </Card>
      <T v="small">Los papás deciden qué compartir contigo. Aquí no aparecen sus calendarios personales o de trabajo, gastos ni documentos privados.</T>
    </>
  );
}

export default function Agenda() {
  const { S } = useStore();
  return isCG(S) ? <CaregiverAgenda /> : <ParentsAgenda />;
}
