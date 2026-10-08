import React, { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CAMS, CAM_EVENTS, KIDS, MEMBERS, PARENTS, addD, dayShort, isCloud, kidKey, me, money, nameOf, now, shortOf } from '../data';
import { BoardScreen, LiveCamSheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Chip, Field, Pill, Row, T, Toggle, useUI } from '../ui';
import { DocRow } from './Familia';

// Custodia semanal de ejemplo (M = mamá, P = papá), empezando hoy.
const CUSTODY = ['M', 'M', 'P', 'P', 'M', 'M', 'P'];

function Cameras() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  if (!CAMS.length) return null;
  return (
    <Card>
      <Between><T v="h3">Hogar · cámaras</T><T v="label">{`${CAMS.length} conectadas`}</T></Between>
      {CAMS.map((cam, i) => (
        <View key={cam.id} style={{ gap: 6, paddingTop: i ? 10 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
          <Between style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><T v="bold">{cam.n}</T><T v="small">{`${cam.type} · ${cam.via}`}</T></View>
            {cam.sensor ? <Pill tone="leaf">{cam.sensor}</Pill> : null}
          </Between>
          <Row>
            <Btn sm onPress={() => openSheet(<LiveCamSheet cam={cam} />)}>Ver en vivo</Btn>
            <Btn sm kind="ghost" onPress={() => toast('En la app real abre la app del fabricante de la cámara')}>Abrir app de la cámara</Btn>
          </Row>
        </View>
      ))}
      <T v="label" style={{ marginTop: 4 }}>Avisos de hoy</T>
      {CAM_EVENTS.map((e, i) => (
        <Between key={i}>
          <T v="small" color={c.ink} style={{ flex: 1 }}>{`${e.t}  ${CAMS.find((x) => x.id === e.cam).n}: ${e.txt}`}</T>
          <Btn sm kind="ghost" onPress={() => {
            update((d) => { d.feed.unshift({ id: Date.now(), who: me(S), kid: Object.keys(KIDS)[0], kind: 'Cámara', txt: `${CAMS.find((x) => x.id === e.cam).n}: ${e.txt} (${e.t}).`, t: now(), lvl: 'info', parentsOnly: true }); });
            toast('Agregado a la bitácora, solo para papás');
          }}>A bitácora</Btn>
        </Between>
      ))}
      <Between>
        <T v="small" style={{ flex: 1 }}>Registrar avisos de cámaras en la bitácora automáticamente (solo visibles para papás)</T>
        <Toggle value={S.camlog} label="Registrar avisos automáticamente" onChange={(v) => update((d) => { d.camlog = v; })} />
      </Between>
      <T v="small">Tribbu no guarda video. Los cuidadores aceptaron el aviso de privacidad y saben que hay cámaras en la casa.</T>
    </Card>
  );
}

function Documents() {
  const { S, update } = useStore();
  const { toast } = useUI();
  const kk = kidKey(S);
  const docs = S.docs.filter((d) => !d.kid || d.kid === kk);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const cloud = isCloud(S);
  const addNamed = () => {
    if (!name.trim()) { toast('Escribe el nombre del documento'); return; }
    update((d) => { d.docs.push({ id: Date.now(), t: name.trim(), kid: kk, kind: 'Otro', note: note.trim() || 'Agregado hoy', shared: false }); });
    setName(''); setNote('');
    toast('Documento agregado. Solo tú lo ves');
  };
  const upload = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets || !res.assets[0]) return;
    update((d) => { d.docs.push({ id: Date.now(), t: name.trim() || 'Documento nuevo', kid: kk, kind: 'Otro', note: 'Subido hoy', shared: false, img: res.assets[0].uri }); });
    setName('');
    toast('Documento guardado. Solo tú lo ves');
  };
  return (
    <Card style={{ gap: 0 }}>
      <T v="h3">{`Documentos de ${KIDS[kk].name} y la familia`}</T>
      {docs.map((d, i) => (
        <DocRow key={d.id} d={d} first={!i} right={
          <View style={{ alignItems: 'center', gap: 2 }}>
            <T v="small" style={{ fontSize: 10 }}>Cuidadores</T>
            <Toggle value={d.shared} label={`Compartir ${d.t} con cuidadores`} onChange={(v) => {
              update((s) => { s.docs.find((x) => x.id === d.id).shared = v; });
              toast(v ? 'Ahora los cuidadores lo ven' : 'Ya no lo ven los cuidadores');
            }} />
          </View>
        } />
      ))}
      <View style={{ gap: 8, marginTop: 10 }}>
        <Field placeholder={cloud ? 'Nombre del documento' : 'Nombre del documento (opcional)'} value={name} onChangeText={setName} />
        {cloud ? <Field placeholder="Detalle, p. ej. dónde está o vigencia (opcional)" value={note} onChangeText={setNote} /> : null}
        {cloud
          ? <Btn sm kind="ghost" style={{ alignSelf: 'flex-start' }} onPress={addNamed}>Agregar a la lista</Btn>
          : <Btn sm kind="ghost" style={{ alignSelf: 'flex-start' }} onPress={upload}>Subir foto de un documento</Btn>}
        {cloud ? <T v="small">Por ahora se guarda el nombre y el detalle. Subir fotos y archivos llegará en una versión posterior.</T> : null}
      </View>
    </Card>
  );
}

function Expenses() {
  const c = useTheme();
  const { S, update } = useStore();
  const { toast } = useUI();
  const self = me(S);
  const [p1, p2] = PARENTS;
  const two = !!p2;
  const [f, setF] = useState({ t: '', amt: '', paid: self, split: 50 });
  // split = porcentaje que le toca al primer papá/mamá. Positivo: el otro te debe. Negativo: le debes.
  const myShare = (e) => (self === p1 ? e.split : 100 - e.split);
  const bal = S.exp.reduce((s2, e) => s2 + (e.paid === self ? (e.amt * (100 - myShare(e))) / 100 : -(e.amt * myShare(e)) / 100), 0);
  const other = self === p1 ? p2 : p1;
  const SPLITS = [[50, '50 / 50'], [60, '60 / 40'], [70, '70 / 30'], [100, `Todo ${shortOf(p1)}`], [0, `Todo ${shortOf(p2)}`]];
  const add = () => {
    const amt = Number(f.amt);
    if (!f.t.trim() || !(amt > 0)) { toast('Escribe el concepto y un monto'); return; }
    update((d) => { d.exp.unshift({ id: Date.now(), t: f.t.trim(), amt, paid: two ? f.paid : self, split: two ? f.split : 100 }); });
    setF((x) => ({ ...x, t: '', amt: '' }));
    toast('Gasto agregado');
  };
  return (
    <Card>
      <Between>
        <T v="h3">Gastos compartidos</T>
        {two ? <Row gap={6}><T v="small">Coparentalidad</T><Toggle value={!!S.copa} label="Modo coparentalidad" onChange={(v) => update((d) => { d.copa = v; })} /></Row> : null}
      </Between>
      {S.copa && two ? (
        <>
          <T v="label">Custodia esta semana</T>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {CUSTODY.map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 10, backgroundColor: w === 'M' ? c.skyBg : c.amberBg }}>
                <T v="small" color={c.ink}>{dayShort(addD(i)).slice(0, 2)}</T>
                <T v="small" color={c.ink} style={{ fontFamily: F.bold, fontSize: 11 }} numberOfLines={1}>{shortOf(w === 'M' ? p1 : p2)}</T>
              </View>
            ))}
          </View>
        </>
      ) : null}
      {two ? (
        <Between style={{ backgroundColor: c.paper2, borderRadius: 12, padding: 12 }}>
          <T style={{ flex: 1 }}>{bal >= 0 ? `${nameOf(other)} te debe` : `Le debes a ${nameOf(other)}`}</T>
          <T style={{ fontFamily: F.display, fontSize: 22 }}>{money(Math.abs(bal))}</T>
        </Between>
      ) : <T v="small">Cuando se una el otro papá o mamá, aquí verán quién le debe a quién.</T>}
      {S.exp.map((e) => (
        <Between key={e.id} style={{ paddingVertical: 4 }}>
          <View style={{ flex: 1 }}>
            <T>{e.t}</T>
            <T v="small">{`Pagó ${shortOf(e.paid)}${two ? ` · ${e.split}/${100 - e.split}` : ''}`}</T>
          </View>
          <T v="num">{money(e.amt)}</T>
        </Between>
      ))}
      <T v="label" style={{ marginTop: 4 }}>Nuevo gasto</T>
      <Field placeholder="Concepto, p. ej. útiles escolares" value={f.t} onChangeText={(t) => setF((x) => ({ ...x, t }))} />
      <Field placeholder="Monto en MXN" keyboardType="decimal-pad" value={f.amt} onChangeText={(amt) => setF((x) => ({ ...x, amt }))} />
      {two ? (
        <>
          <Row gap={6} wrap>
            {PARENTS.map((k) => <Chip key={k} on={f.paid === k} onPress={() => setF((x) => ({ ...x, paid: k }))}>{`Pagó ${shortOf(k)}`}</Chip>)}
          </Row>
          <Row gap={6} wrap>{SPLITS.map(([v, l]) => <Chip key={v} on={f.split === v} onPress={() => setF((x) => ({ ...x, split: v }))}>{l}</Chip>)}</Row>
        </>
      ) : null}
      <Btn sm style={{ alignSelf: 'flex-start' }} onPress={add}>Agregar gasto</Btn>
    </Card>
  );
}

function Arrivals() {
  const { S, update } = useStore();
  // Los avisos de llegada reales (con ubicación) aún no existen: solo se muestran en la demostración.
  if (isCloud(S)) return null;
  const care = MEMBERS.filter((m) => m.role === 'caregiver');
  return (
    <Card>
      <T v="h3">Avisos de llegada</T>
      {care.map((m) => (
        <Between key={m.key}>
          <View style={{ flex: 1 }}><T v="bold">{m.name}</T><T v="small">Lugares acordados</T></View>
          <Toggle value={!!S.locs[m.key]} label={`Avisos de ${m.name}`} onChange={(v) => update((d) => { d.locs[m.key] = v; })} />
        </Between>
      ))}
      <T v="small">Cada cuidador decide si comparte su llegada. Solo se avisa al llegar a lugares acordados; no hay rastreo continuo.</T>
    </Card>
  );
}

export default function Casa() {
  const { openFull } = useUI();
  return (
    <>
      <Between><T v="h2">Casa</T><Pill tone="sky">Solo papás</Pill></Between>
      <Cameras />
      <Documents />
      <Expenses />
      <Arrivals />
      <Card>
        <T v="h3">Pizarra familiar</T>
        <T v="small">Convierte una tablet en un tablero fijo para la cocina: quién cuida, horarios, comida y puntos.</T>
        <Btn kind="ghost" onPress={() => openFull(<BoardScreen />)}>Abrir modo pizarra</Btn>
      </Card>
    </>
  );
}
