import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ACTS, ARRIVALS, KIDS, PEOPLE, SHIFT, dateLong, dayEvents, dk, evKey, inShift, isCG, kidKey, today } from '../data';
import { ActCard, PinIcon, SunMark, TaskRow } from '../parts';
import { DEMOS } from '../scenes';
import { ActivitySheet, BoardScreen, EventSheet, LogSheet } from '../sheets';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { summarizeDay } from '../ai';
import { Avatar, Between, Btn, Card, Pill, Row, T, useUI } from '../ui';

function QuickLog() {
  const c = useTheme();
  const { S } = useStore();
  const { openSheet } = useUI();
  const items = [['Comió', 'C', c.leafBg], ['Siesta', 'Z', c.skyBg], ['Baño', 'B', c.amberBg], ['Ánimo', 'A', c.sun], ['Medicina', 'M', c.berryBg], ['Golpe', '!', c.berryBg]];
  return (
    <>
      <T v="label">{`Registro rápido de ${KIDS[kidKey(S)].name}`}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map(([n, i, bg]) => (
          <Pressable key={n} onPress={() => openSheet(<LogSheet kind={n} />)} accessibilityRole="button"
            style={{ width: '31.5%', borderWidth: 1.5, borderColor: c.line, backgroundColor: c.paper, borderRadius: 16, paddingVertical: 10, alignItems: 'center', gap: 4 }}>
            <Avatar letter={i} bg={bg} fg={c.ink} size={30} />
            <T v="bold" style={{ fontSize: 12.5 }}>{n}</T>
          </Pressable>
        ))}
      </View>
    </>
  );
}

function Idea() {
  const { S } = useStore();
  const { openSheet } = useUI();
  const k = KIDS[kidKey(S)];
  const fit = ACTS.filter((a) => k.age >= a.age[0] && k.age <= a.age[1] && a.mats.every((m) => S.have.includes(m)));
  const pick = fit.find((a) => DEMOS[a.id]) || fit[0];
  if (!pick) return null;
  return (
    <>
      <T v="label">Idea para hoy, con lo que hay en casa</T>
      <ActCard a={pick} onPress={() => openSheet(<ActivitySheet id={pick.id} />)} />
    </>
  );
}

function EventLine({ e, sub }) {
  const c = useTheme();
  const { openSheet } = useUI();
  return (
    <Pressable onPress={() => openSheet(<EventSheet k={evKey(e)} />)} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6 }}>
      <T v="num" style={{ width: 50 }}>{e.time}</T>
      <View style={{ flex: 1, gap: 3 }}><T v="bold">{e.t}</T>{sub}</View>
    </Pressable>
  );
}

export default function Hoy() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openFull } = useUI();
  const [busy, setBusy] = useState(false);
  const kk = kidKey(S);
  const k = KIDS[kk];

  if (isCG(S)) {
    const mine = S.tasks.filter((t) => t.who === SHIFT.who);
    const evs = dayEvents(S, dk(today)).fam.filter(inShift);
    return (
      <>
        <View style={{ backgroundColor: c.sun, borderRadius: 24, padding: 16, gap: 6, overflow: 'hidden' }}>
          <SunMark />
          <T v="label" color={c.sunInk}>Tu turno de hoy</T>
          <T v="h2" color={c.sunInk}>{`Cuidas a ${k.name} de ${SHIFT.from} a ${SHIFT.to}`}</T>
          <T color={c.sunInk}>La recoges en el Kínder Montessori a las 14:00.</T>
        </View>
        <Card>
          <T v="h3">Lo que necesitas saber</T>
          <Row><T v="small" style={{ width: 90 }}>Alergia</T><T v="bold" color={c.berry} style={{ flex: 1 }}>{k.allergy}</T></Row>
          {k.routine.map(([a, b]) => <Row key={a}><T v="small" style={{ width: 90 }}>{a}</T><T v="bold" style={{ flex: 1 }}>{b}</T></Row>)}
          <Row><T v="small" style={{ width: 90 }}>Pediatra</T><T v="bold" style={{ flex: 1 }}>{k.ped}</T></Row>
        </Card>
        <Card>
          <T v="h3">Durante tu turno</T>
          {evs.length ? evs.map((e) => <EventLine key={evKey(e)} e={e} sub={<T v="small">{`${(S.evchat[evKey(e)] || []).length} mensajes en el evento`}</T>} />) : <T v="small">Sin eventos en tu horario.</T>}
        </Card>
        <Card>
          <T v="h3">Tus pendientes</T>
          {mine.map((t, i) => <TaskRow key={t.id} t={t} first={i === 0} />)}
        </Card>
        <QuickLog />
        <Idea />
      </>
    );
  }

  const evs = dayEvents(S, dk(today)).fam.filter((e) => e.kid === kk);
  const arr = ARRIVALS.filter((a) => S.locs[a.who]);
  const summarize = async () => {
    setBusy(true);
    const s = await summarizeDay(S);
    update((d) => { d.summary = s; });
    setBusy(false);
  };
  return (
    <>
      <View style={{ backgroundColor: c.sun, borderRadius: 24, padding: 16, gap: 8, overflow: 'hidden' }}>
        <SunMark />
        <T v="label" color={c.sunInk}>{`Hoy cuida a ${k.name}`}</T>
        <Row>
          <Avatar letter={kk === 'sofi' ? 'C' : 'J'} bg={c.paper} fg={c.ink} size={38} />
          <View style={{ flex: 1 }}>
            <T v="bold" color={c.sunInk}>{kk === 'sofi' ? 'Abuela Carmen' : 'Abuelo Jorge'}</T>
            <T color={c.sunInk}>{`${kk === 'sofi' ? '14:00 a 19:00' : '16:00 a 20:00'} · solo ve lo de su turno`}</T>
          </View>
        </Row>
      </View>
      {arr.length ? (
        <Card>
          <Between><T v="h3">Avisos de llegada</T><T v="label">Hoy</T></Between>
          {arr.map((a, i) => (
            <Row key={i}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.leafBg, alignItems: 'center', justifyContent: 'center' }}><PinIcon /></View>
              <T style={{ flex: 1 }}>{`${PEOPLE[a.who][0]} llegó a ${a.place}`}</T>
              <T v="num" style={{ fontSize: 14 }}>{a.t}</T>
            </Row>
          ))}
        </Card>
      ) : null}
      <Card>
        <Between><T v="h3">Próximo</T><T v="label">{dateLong(today)}</T></Between>
        {evs.length ? evs.map((e) => <EventLine key={evKey(e)} e={e} sub={<Pill tone="sky">{e.tag}</Pill>} />) : <T v="small">Nada más hoy. Buen momento para jugar.</T>}
      </Card>
      <Card>
        <Between><T v="h3">Resumen del día</T><Pill tone="sky">Con IA</Pill></Between>
        {S.summary
          ? <View style={{ backgroundColor: c.paper2, borderRadius: 12, padding: 10 }}><T>{S.summary}</T></View>
          : <T v="small">Tribbu junta lo que registraron los cuidadores y te lo resume en un párrafo.</T>}
        <Btn sm kind={S.summary ? 'ghost' : 'ink'} disabled={busy} onPress={summarize} style={{ alignSelf: 'flex-start' }}>
          {busy ? 'Resumiendo…' : S.summary ? 'Actualizar resumen' : 'Generar resumen de hoy'}
        </Btn>
      </Card>
      <QuickLog />
      <Idea />
      <Btn kind="ghost" onPress={() => openFull(<BoardScreen />)}>Abrir modo pizarra para la tablet de la cocina</Btn>
    </>
  );
}
