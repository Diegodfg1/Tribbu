// Pantallas completas para crear o editar un evento familiar y un pendiente.
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KIDS, MEMBERS, dayEvents, evKey, mins, nameOf, todayKey } from './data';
import { DateField, TimeField, addMinutes } from './pickers';
import { useStore } from './store';
import { useTheme } from './theme';
import { Btn, Chip, Field, Row, T, confirmAction, useUI } from './ui';

const TAGS = ['Familia', 'Escuela', 'Clase', 'Salud', 'Turno'];

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
    ? { t: orig.t, kid: orig.kid, d: orig.d, time: orig.time, end: orig.end, tag: orig.tag || 'Familia' }
    : { t: '', kid: kids.includes(S.kid) ? S.kid : kids[0], d: date || todayKey(), time: '17:00', end: '18:00', tag: 'Familia' }));
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
    const ev = { d: f.d, time: f.time, end: f.end, t: f.t.trim(), kid: f.kid, tag: f.tag };
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
      <View style={{ gap: 6 }}>
        <T v="label">Para quién</T>
        <Row gap={6} wrap>{kids.map((x) => <Chip key={x} on={f.kid === x} onPress={() => set('kid')(x)}>{KIDS[x].name}</Chip>)}</Row>
      </View>
      <View style={{ gap: 6 }}>
        <T v="label">Tipo</T>
        <Row gap={6} wrap>{TAGS.map((x) => <Chip key={x} on={f.tag === x} onPress={() => set('tag')(x)}>{x}</Chip>)}</Row>
      </View>
      <T v="small">Los cuidadores solo lo ven si cae en su turno y es del niño que cuidan.</T>
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
  const people = MEMBERS.map((m) => m.key);
  const [f, setF] = useState(() => (orig
    ? { t: orig.t, who: orig.who, due: orig.due || null }
    : { t: '', who: (MEMBERS.find((m) => m.role === 'caregiver') || MEMBERS[0] || { key: '' }).key, due: null }));
  const set = (x) => (v) => setF((o) => ({ ...o, [x]: v }));
  const save = () => {
    if (!f.t.trim()) { toast('Escribe qué hay que hacer'); return; }
    update((d) => {
      if (orig) { const x = d.tasks.find((t) => t.id === id); x.t = f.t.trim(); x.who = f.who; if (f.due) x.due = f.due; else delete x.due; }
      else d.tasks.unshift({ id: Date.now(), t: f.t.trim(), who: f.who, done: false, ...(f.due ? { due: f.due } : {}) });
    });
    closeFull();
    toast(orig ? 'Pendiente actualizado' : `Pendiente asignado a ${nameOf(f.who)}`);
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
      <View style={{ gap: 6 }}>
        <T v="label">Quién lo hace</T>
        <Row gap={6} wrap>{people.map((k) => <Chip key={k} on={f.who === k} onPress={() => set('who')(k)}>{nameOf(k)}</Chip>)}</Row>
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
