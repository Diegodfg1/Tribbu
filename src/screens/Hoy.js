import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { KIDS, SHIFT, arrivalsOf, caregiverOf, dateLong, dayEvents, dayOfYear, dk, evKey, favsOf, inShift, isCG, isNewAct, kidKey, monthName, nameOf, tasksSorted, today, unlockedActs } from '../data';
import { ActCard, PinIcon, SunMark, TaskRow } from '../parts';
import { TaskEditor } from '../editors';
import { ActivitySheet, BoardScreen, EventSheet, QuickLog } from '../sheets';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { summarizeDay } from '../ai';
import { Avatar, Between, Btn, Card, Pill, Row, T, useUI } from '../ui';

// La idea de hoy rota cada día: primero las nuevas del mes, luego las favoritas y después las demás.
function Idea() {
  const { S } = useStore();
  const { openSheet } = useUI();
  const k = KIDS[kidKey(S)];
  const fit = unlockedActs(S).filter((a) => k.age >= a.age[0] && k.age <= a.age[1] && a.mats.every((m) => S.have.includes(m)));
  const fav = favsOf(S);
  const pool = [...fit.filter((a) => isNewAct(a, S)), ...fit.filter((a) => fav.includes(a.id)), ...fit].filter((a, i, arr) => arr.indexOf(a) === i);
  if (!pool.length) return null;
  const pick = pool[dayOfYear() % pool.length];
  return (
    <>
      <T v="label">Idea para hoy, con lo que hay en casa</T>
      <ActCard a={pick} onPress={() => openSheet(<ActivitySheet id={pick.id} />)} />
    </>
  );
}

// Aviso de que hay actividades nuevas este mes.
function NewBanner() {
  const c = useTheme();
  const { S, update } = useStore();
  const n = unlockedActs(S).filter((a) => isNewAct(a, S)).length;
  if (!n) return null;
  return (
    <Card bg={c.amberBg} border={c.amberBg} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <T v="bold">{`✨ ${n} actividades nuevas en ${monthName(new Date())}`}</T>
        <T v="small" color={c.ink}>Cada mes se suman actividades nuevas para que no se repitan.</T>
      </View>
      <Btn sm kind="sun" onPress={() => update((d) => { d.view = 'jugar'; d.jtab = 'act'; d.afilter = 'new'; })}>Verlas</Btn>
    </Card>
  );
}

// Pendientes de la familia, a la vista en la pantalla inicial.
function PendingCard() {
  const { S, update } = useStore();
  const { openFull } = useUI();
  const open = tasksSorted(S.tasks).filter((t) => !t.done);
  return (
    <Card style={{ gap: 0 }}>
      <Between style={{ marginBottom: 4 }}>
        <T v="h3">Pendientes</T>
        <Btn sm kind="ghost" onPress={() => openFull(<TaskEditor id={null} />)}>Agregar</Btn>
      </Between>
      {open.length ? open.slice(0, 5).map((t, i) => <TaskRow key={t.id} t={t} first={i === 0} onEdit={(id) => openFull(<TaskEditor id={id} />)} />) : <T v="small">No hay pendientes. ¡Todo al día!</T>}
      {open.length > 5 ? <Btn sm kind="ghost" style={{ alignSelf: 'flex-start', marginTop: 6 }} onPress={() => update((d) => { d.view = 'agenda'; })}>{`Ver los ${open.length} en Agenda`}</Btn> : null}
    </Card>
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
  const { openFull, toast } = useUI();
  const [busy, setBusy] = useState(false);
  const kk = kidKey(S);
  const k = KIDS[kk];
  const care = caregiverOf(kk);

  if (isCG(S)) {
    const mine = S.tasks.filter((t) => t.who === SHIFT.who);
    const evs = dayEvents(S, dk(today)).fam.filter(inShift);
    return (
      <>
        <View style={{ backgroundColor: c.sun, borderRadius: 24, padding: 16, gap: 6, overflow: 'hidden' }}>
          <SunMark />
          <T v="label" color={c.sunInk}>Tu turno de hoy</T>
          <T v="h2" color={c.sunInk}>{`Cuidas a ${k.name} de ${SHIFT.from} a ${SHIFT.to}`}</T>
          <T color={c.sunInk}>Aquí tienes lo necesario para tu turno.</T>
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
        <NewBanner />
        <Idea />
      </>
    );
  }

  const evs = dayEvents(S, dk(today)).fam.filter((e) => e.kid === kk);
  const arr = arrivalsOf(S).filter((a) => S.locs[a.who]);
  const summarize = async () => {
    setBusy(true);
    const s = await summarizeDay(S);
    update((d) => { d.summary = s; });
    setBusy(false);
    toast('Resumen del día listo');
  };
  return (
    <>
      <View style={{ backgroundColor: c.sun, borderRadius: 24, padding: 16, gap: 8, overflow: 'hidden' }}>
        <SunMark />
        <T v="label" color={c.sunInk}>{`Hoy cuida a ${k.name}`}</T>
        {care ? (
          <Row>
            <Avatar letter={(care.name[0] || '?').toUpperCase()} bg={c.paper} fg={c.ink} size={38} />
            <View style={{ flex: 1 }}>
              <T v="bold" color={c.sunInk}>{care.name}</T>
              <T color={c.sunInk}>{`${care.from} a ${care.to} · solo ve lo de su turno`}</T>
            </View>
          </Row>
        ) : <T color={c.sunInk}>{`Todavía no hay un cuidador asignado a ${k.name}. Invítalo desde Familia.`}</T>}
      </View>
      {arr.length ? (
        <Card>
          <Between><T v="h3">Avisos de llegada</T><T v="label">Hoy</T></Between>
          {arr.map((a, i) => (
            <Row key={i}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.leafBg, alignItems: 'center', justifyContent: 'center' }}><PinIcon /></View>
              <T style={{ flex: 1 }}>{`${nameOf(a.who)} llegó a ${a.place}`}</T>
              <T v="num" style={{ fontSize: 14 }}>{a.t}</T>
            </Row>
          ))}
        </Card>
      ) : null}
      <NewBanner />
      <Card>
        <Between><T v="h3">Próximo</T><T v="label">{dateLong(today)}</T></Between>
        {evs.length ? evs.map((e) => <EventLine key={evKey(e)} e={e} sub={<Pill tone="sky">{e.tag}</Pill>} />) : <T v="small">Nada más hoy. Buen momento para jugar.</T>}
      </Card>
      <PendingCard />
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
