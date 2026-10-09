// Pantallas completas para crear o editar un evento familiar y un pendiente.
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KIDS, MEMBERS, dayEvents, evKey, evKids, evPeople, mins, nameOf, taskWhos, todayKey } from './data';
import { DateField, TimeField, addMinutes } from './pickers';
import { useStore } from './store';
import { useTheme } from './theme';
import { Btn, Chip, Field, Row, T, confirmAction, useUI } from './ui';

const TAGS = ['Familia', 'Escuela', 'Clase', 'Salud', 'Turno'];

// Selector de varios niños y varias personas (papás o cuidadores) con atajos de «todos».
function WhoPicker({ kids, people, onKids, onPeople, withKids = true }) {
  const allKids = Object.keys(KIDS);
  const allPeople = MEMBERS.map((m) => m.key);
  const toggle = (arr, k) => (arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);
  const kidsAll = allKids.length > 0 && allKids.every((k) => kids.includes(k));
  const peopleAll = allPeople.length > 0 && allPeople.every((p) => people.includes(p));
  return (
    <>
      <Row gap={6} wrap>
        <Chip on={(!withKids || kidsAll) && peopleAll} onPress={() => { const on = (!withKids || kidsAll) && peopleAll; if (withKids) onKids(on ? [] : allKids); onPeople(on ? [] : allPeople); }}>Toda la familia</Chip>
      </Row>
      {withKids ? (
        <View style={{ gap: 6 }}>
          <T v="label">Niños</T>
          <Row gap={6} wrap>
            {allKids.length > 1 ? <Chip on={kidsAll} onPress={() => onKids(kidsAll ? [] : allKids)}>Todos los niños</Chip> : null}
            {allKids.map((k) => <Chip key={k} on={kids.includes(k)} onPress={() => onKids(toggle(kids, k))}>{KIDS[k].name}</Chip>)}
          </Row>
        </View>
      ) : null}
      <View style={{ gap: 6 }}>
        <T v="label">{withKids ? 'Papás y cuidadores' : 'Personas'}</T>
        <Row gap={6} wrap>
          {allPeople.length > 1 ? <Chip on={peopleAll} onPress={() => onPeople(peopleAll ? [] : allPeople)}>{withKids ? 'Todos los adultos' : 'Todos'}</Chip> : null}
          {allPeople.map((p) => <Chip key={p} on={people.includes(p)} onPress={() => onPeople(toggle(people, p))}>{nameOf(p)}</Chip>)}
        </Row>
      </View>
    </>
  );
}

function Screen({ title, onClose, children }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancelar" hitSlop={10}><T v="bold" color={c.sky}>Cancelar</T></Pressable>
        <T v="h3">{title}</T>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 40 }}>{children}</ScrollView>
    </View>
  );
}

// ---------- Evento familiar ----------
// k: llave del evento a editar (o null para uno nuevo). date: fecha sugerida. onDone(fecha): al guardar.
export function EventEditor({ k, date, onDone }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { closeFull, toast } = useUI();
  const editing = !!k;
  const orig = editing ? dayEvents(S, k.split('|')[0]).fam.find((x) => evKey(x) === k) : null;
  const kids = Object.keys(KIDS);
  const [f, setF] = useState(() => (orig
    ? { t: orig.t, kids: evKids(orig), people: evPeople(orig), d: orig.d, time: orig.time, end: orig.end, tag: orig.tag || 'Familia' }
    : { t: '', kids: [kids.includes(S.kid) ? S.kid : kids[0]], people: [], d: date || todayKey(), time: '17:00', end: '18:00', tag: 'Familia' }));
  const set = (x) => (v) => setF((o) => ({ ...o, [x]: v }));
  const marks = [...new Set([...S.myevents.map((e) => e.d)])];
  // Al cambiar el inicio, el fin se mueve igual para conservar la duración.
  const setStart = (time) => setF((o) => {
    const dur = mins(o.end) - mins(o.time);
    return { ...o, time, end: addMinutes(time, dur > 0 ? dur : 60) };
  });

  const save = () => {
    if (!f.t.trim()) { toast('Escribe el nombre del evento'); return; }
    if (mins(f.end) <= mins(f.time)) { toast('La hora de fin debe ser después de la de inicio'); return; }
    if (!f.kids.length && !f.people.length) { toast('Elige para quién es: un niño, un papá o un cuidador'); return; }
    const ev = { d: f.d, time: f.time, end: f.end, t: f.t.trim(), kid: f.kids[0] || '', kids: f.kids, people: f.people, tag: f.tag };
    const newKey = evKey(ev);
    if (!editing && dayEvents(S, f.d).fam.some((x) => evKey(x) === newKey)) { toast('Ya existe un evento igual a esa hora'); return; }
    update((d) => {
      if (orig) {
        d.myevents = d.myevents.filter((x) => evKey(x) !== k);
        if (orig.base) d.delev = [...(d.delev || []), k];
        if (newKey !== k && d.evchat[k]) { d.evchat[newKey] = d.evchat[k]; delete d.evchat[k]; }
      }
      d.myevents.push(ev);
    });
    closeFull();
    toast(editing ? 'Evento actualizado' : 'Evento agregado al calendario familiar');
    onDone && onDone(f.d);
  };
  const remove = () => confirmAction('¿Eliminar este evento?', `«${orig.t}» y su conversación se borran para todos.`, 'Eliminar', () => {
    update((d) => {
      d.myevents = d.myevents.filter((x) => evKey(x) !== k);
      if (orig.base) d.delev = [...(d.delev || []), k];
      delete d.evchat[k];
    });
    closeFull();
    toast('Evento eliminado');
    onDone && onDone(orig.d);
  });

  return (
    <Screen title={editing ? 'Editar evento' : 'Nuevo evento'} onClose={closeFull}>
      <View style={{ gap: 6 }}>
        <T v="label">Qué es</T>
        <Field placeholder="P. ej. clase de música" value={f.t} onChangeText={set('t')} autoFocus={!editing} />
      </View>
      <DateField label="Fecha" value={f.d} onChange={set('d')} marks={marks} />
      <Row style={{ alignItems: 'flex-start' }}>
        <TimeField label="Inicio" value={f.time} onChange={setStart} />
        <TimeField label="Fin" value={f.end} onChange={set('end')} />
      </Row>
      <View style={{ gap: 8 }}>
        <T v="label">Para quién (puedes elegir varios)</T>
        <WhoPicker kids={f.kids} people={f.people} onKids={set('kids')} onPeople={set('people')} />
      </View>
      <View style={{ gap: 6 }}>
        <T v="label">Tipo</T>
        <Row gap={6} wrap>{TAGS.map((x) => <Chip key={x} on={f.tag === x} onPress={() => set('tag')(x)}>{x}</Chip>)}</Row>
      </View>
      <T v="small">Un cuidador lo ve si cae en su turno y es de un niño que cuida, o si lo elegiste a él directamente.</T>
      <Btn kind="sun" onPress={save}>{editing ? 'Guardar cambios' : 'Guardar evento'}</Btn>
      {editing ? <Btn kind="ghost" onPress={remove}>Eliminar evento</Btn> : null}
    </Screen>
  );
}

// ---------- Pendiente ----------
export function TaskEditor({ id, onDone }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { closeFull, toast } = useUI();
  const orig = id != null ? S.tasks.find((t) => t.id === id) : null;
  const [f, setF] = useState(() => (orig
    ? { t: orig.t, whos: taskWhos(orig), due: orig.due || null }
    : { t: '', whos: [(MEMBERS.find((m) => m.role === 'caregiver') || MEMBERS[0] || { key: '' }).key].filter(Boolean), due: null }));
  const set = (x) => (v) => setF((o) => ({ ...o, [x]: v }));
  const save = () => {
    if (!f.t.trim()) { toast('Escribe qué hay que hacer'); return; }
    if (!f.whos.length) { toast('Elige quién lo va a hacer'); return; }
    update((d) => {
      if (orig) { const x = d.tasks.find((t) => t.id === id); x.t = f.t.trim(); x.who = f.whos[0]; x.whos = f.whos; if (f.due) x.due = f.due; else delete x.due; }
      else d.tasks.unshift({ id: Date.now(), t: f.t.trim(), who: f.whos[0], whos: f.whos, done: false, ...(f.due ? { due: f.due } : {}) });
    });
    closeFull();
    toast(orig ? 'Pendiente actualizado' : `Pendiente asignado a ${f.whos.length > 1 ? `${f.whos.length} personas` : nameOf(f.whos[0])}`);
    onDone && onDone();
  };
  const remove = () => confirmAction('¿Eliminar este pendiente?', `«${orig.t}»`, 'Eliminar', () => {
    update((d) => { d.tasks = d.tasks.filter((t) => t.id !== id); });
    closeFull(); toast('Pendiente eliminado'); onDone && onDone();
  });
  return (
    <Screen title={orig ? 'Editar pendiente' : 'Nuevo pendiente'} onClose={closeFull}>
      <View style={{ gap: 6 }}>
        <T v="label">Qué hay que hacer</T>
        <Field placeholder="P. ej. comprar leche" value={f.t} onChangeText={set('t')} autoFocus={!orig} />
      </View>
      <View style={{ gap: 8 }}>
        <T v="label">Quién lo hace (puedes elegir varios)</T>
        <WhoPicker withKids={false} kids={[]} people={f.whos} onKids={() => {}} onPeople={set('whos')} />
      </View>
      <View style={{ gap: 8 }}>
        <Row gap={6}>
          <Chip on={!f.due} onPress={() => set('due')(null)}>Sin fecha</Chip>
          <Chip on={!!f.due} onPress={() => set('due')(f.due || todayKey())}>Con fecha límite</Chip>
        </Row>
        {f.due ? <DateField label="Fecha límite" value={f.due} onChange={set('due')} /> : null}
      </View>
      <Btn kind="sun" onPress={save}>{orig ? 'Guardar cambios' : 'Guardar pendiente'}</Btn>
      {orig ? <Btn kind="ghost" onPress={remove}>Eliminar pendiente</Btn> : null}
    </Screen>
  );
}
