import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  KIDS, PEOPLE, SHIFT, SRC, addD, dayEvents, dayLong, dayShort, dk, evKey, fromKey, inShift, isCG, mins, overlaps, today,
} from '../data';
import { TaskRow } from '../parts';
import { CalendarsSheet, EventSheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Chip, Field, Pill, Row, T, useUI } from '../ui';

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
              update((d) => { d.tasks.unshift({ id: Date.now(), t: `Cubrir: ${e.t} (${dayLbl}, ${e.time})`, who: 'carmen', done: false }); });
              toast('Le pedimos apoyo a Abuela Carmen');
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
  const { openSheet, toast } = useUI();
  const [sel, setSel] = useState(dk(today));
  const [form, setForm] = useState({ t: '', d: dk(today), time: '17:00', kid: S.kid });
  const [task, setTask] = useState({ t: '', who: 'carmen' });
  const days = [0, 1, 2, 3, 4, 5, 6].map(addD);
  const { all, ext } = dayEvents(S, sel);
  const dayLbl = dayLong(fromKey(sel));
  const linked = Object.keys(S.cal).filter((k) => S.cal[k].on).length;
  const shifts = [['Abuela Carmen · Sofi', 14, 19, c.sun], ['Abuelo Jorge · Mateo', 16, 20, c.leafBg], ['Tú', 19, 22, c.skyBg]];
  const pos = (h) => ((h - 8) / 14) * 100;
  const addEvent = () => {
    if (!form.t.trim() || !/^\d{1,2}:\d{2}$/.test(form.time)) { toast('Escribe un título y una hora como 17:00'); return; }
    const time = form.time.padStart(5, '0');
    update((d) => { d.myevents.push({ d: form.d, time, t: form.t.trim(), kid: form.kid, tag: 'Familia' }); });
    setSel(form.d); setForm((f) => ({ ...f, t: '' })); toast('Evento agregado al calendario familiar');
  };
  return (
    <>
      <Between><T v="h2">Agenda familiar</T><Btn sm kind="ghost" onPress={() => openSheet(<CalendarsSheet />)}>{`Calendarios · ${linked + 1}`}</Btn></Between>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {days.map((d) => {
          const k = dk(d); const on = k === sel; const has = dayEvents(S, k).all.length > 0;
          return (
            <Pressable key={k} onPress={() => setSel(k)} accessibilityState={{ selected: on }}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 14, backgroundColor: on ? c.ink : 'transparent', gap: 1 }}>
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
      </Card>
      <Card>
        <Between><T v="h3">Nuevo evento familiar</T><Row gap={6}><Sq color={c.sun} /><T v="small">Tribbu familiar</T></Row></Between>
        <Field placeholder="P. ej. clase de música" value={form.t} onChangeText={(t) => setForm((f) => ({ ...f, t }))} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {days.map((d) => <Chip key={dk(d)} on={form.d === dk(d)} onPress={() => setForm((f) => ({ ...f, d: dk(d) }))}>{`${dayShort(d)} ${d.getDate()}`}</Chip>)}
        </ScrollView>
        <Row>
          <Field style={{ width: 90 }} placeholder="17:00" value={form.time} onChangeText={(time) => setForm((f) => ({ ...f, time }))} keyboardType="numbers-and-punctuation" />
          {Object.entries(KIDS).map(([k, v]) => <Chip key={k} on={form.kid === k} onPress={() => setForm((f) => ({ ...f, kid: k }))}>{v.name}</Chip>)}
        </Row>
        <Btn sm onPress={addEvent} style={{ alignSelf: 'flex-start' }}>Agregar</Btn>
        <T v="small">Los cuidadores solo lo ven si cae en su turno.</T>
      </Card>
      <Card>
        <Between><T v="h3">Turnos de cuidado de hoy</T><T v="label">8:00 – 22:00</T></Between>
        {shifts.map(([n, a, b, col]) => (
          <View key={n} style={{ height: 26, borderRadius: 8, backgroundColor: c.paper2, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos(a)}%`, width: `${pos(b) - pos(a)}%`, backgroundColor: col, borderRadius: 8, justifyContent: 'center', paddingLeft: 8 }}>
              <T v="small" color={c.ink} numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 11 }}>{`${n} ${a}–${b}h`}</T>
            </View>
          </View>
        ))}
      </Card>
      <Card style={{ gap: 0 }}>
        <Between style={{ marginBottom: 4 }}><T v="h3">Pendientes</T><T v="label">{`${S.tasks.filter((t) => !t.done).length} abiertos`}</T></Between>
        {S.tasks.map((t, i) => <TaskRow key={t.id} t={t} first={i === 0} />)}
        <View style={{ gap: 8, marginTop: 8 }}>
          <Field placeholder="Nuevo pendiente, p. ej. comprar leche" value={task.t} onChangeText={(t) => setTask((x) => ({ ...x, t }))} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {Object.entries(PEOPLE).map(([k, [n]]) => <Chip key={k} on={task.who === k} onPress={() => setTask((x) => ({ ...x, who: k }))}>{n}</Chip>)}
          </ScrollView>
          <Btn sm style={{ alignSelf: 'flex-start' }} onPress={() => {
            if (!task.t.trim()) return;
            update((d) => { d.tasks.unshift({ id: Date.now(), t: task.t.trim(), who: task.who, done: false }); });
            toast(`Pendiente asignado a ${PEOPLE[task.who][0]}`); setTask((x) => ({ ...x, t: '' }));
          }}>Asignar</Btn>
        </View>
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
        <Between><T v="h3">Tu turno con Sofi</T><T v="label">{`${SHIFT.from} – ${SHIFT.to}`}</T></Between>
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
