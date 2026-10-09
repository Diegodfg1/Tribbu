import React, { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { KIDS, MEMBERS, PARENTS, addD, arrivalsOf, camEventsOf, camsOf, dayShort, isBlank, isCloud, kidKey, me, mkFeed, money, nameOf, now, shortOf } from '../data';
import { BoardScreen, LiveCamSheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Chip, Field, Pill, Row, T, Toggle, useUI } from '../ui';
import { DocRow } from './Familia';

// Custodia semanal de ejemplo (M = mamá, P = papá), empezando hoy.
const CUSTODY = ['M', 'M', 'P', 'P', 'M', 'M', 'P'];

const CAM_TYPES = [['Monitor de bebé', 'Se abre en la app del fabricante'], ['Cámara Wi-Fi', 'Conectada vía Google Home']];
const CAM_ALERTS = ['Movimiento detectado', 'Llanto detectado durante 2 min', 'Persona detectada', 'Sonido fuerte detectado'];

function Cameras() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  const [name, setName] = useState('');
  const [type, setType] = useState(CAM_TYPES[0][0]);
  if (isCloud(S)) return null; // aún no hay cámaras reales
  const blank = isBlank(S);
  const cams = camsOf(S);
  const events = camEventsOf(S);
  const nameOfCam = (id) => { const x = cams.find((y) => y.id === id); return x ? x.n : 'Cámara'; };
  const addCam = () => {
    if (!name.trim()) { toast('Escribe el nombre de la cámara'); return; }
    update((d) => { d.cams.push({ id: `c${Date.now()}`, n: name.trim(), type, via: CAM_TYPES.find((x) => x[0] === type)[1], sensor: null }); });
    setName(''); toast('Cámara agregada (simulación)');
  };
  return (
    <Card>
      <Between><T v="h3">Hogar · cámaras</T><T v="label">{`${cams.length} conectadas`}</T></Between>
      {blank ? <T v="small">Simulación: aquí pruebas cómo se vería. La conexión real con Google Home, HomeKit o Matter llega en una fase posterior.</T> : null}
      {cams.map((cam, i) => (
        <View key={cam.id} style={{ gap: 6, paddingTop: i ? 10 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
          <Between style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><T v="bold">{cam.n}</T><T v="small">{`${cam.type} · ${cam.via}`}</T></View>
            {cam.sensor ? <Pill tone="leaf">{cam.sensor}</Pill> : null}
          </Between>
          <Row wrap>
            <Btn sm onPress={() => openSheet(<LiveCamSheet cam={cam} />)}>Ver en vivo</Btn>
            <Btn sm kind="ghost" onPress={() => toast('En la app real abre la app del fabricante de la cámara')}>Abrir app de la cámara</Btn>
            {blank ? <Btn sm kind="ghost" onPress={() => { update((d) => { d.camev.unshift({ cam: cam.id, t: now(), txt: CAM_ALERTS[Math.floor(Math.random() * CAM_ALERTS.length)] }); }); toast('Aviso simulado'); }}>Simular aviso</Btn> : null}
          </Row>
        </View>
      ))}
      {blank ? (
        <View style={{ gap: 8, paddingTop: 10, borderTopWidth: cams.length ? 1 : 0, borderTopColor: c.line }}>
          <T v="label">Agregar cámara (simulación)</T>
          <Field placeholder="Nombre, p. ej. Cuarto de Sofi" value={name} onChangeText={setName} />
          <Row gap={6} wrap>{CAM_TYPES.map(([t]) => <Chip key={t} on={type === t} onPress={() => setType(t)}>{t}</Chip>)}</Row>
          <Btn sm kind="ghost" style={{ alignSelf: 'flex-start' }} onPress={addCam}>Agregar cámara</Btn>
        </View>
      ) : null}
      <T v="label" style={{ marginTop: 4 }}>Avisos de hoy</T>
      {events.length ? events.map((e, i) => (
        <Between key={i}>
          <T v="small" color={c.ink} style={{ flex: 1 }}>{`${e.t}  ${nameOfCam(e.cam)}: ${e.txt}`}</T>
          <Btn sm kind="ghost" onPress={() => {
            update((d) => { d.feed.unshift(mkFeed(S, { kid: Object.keys(KIDS)[0], kind: 'Cámara', txt: `${nameOfCam(e.cam)}: ${e.txt} (${e.t}).`, parentsOnly: true })); });
            toast('Agregado a la bitácora, solo para papás');
          }}>A bitácora</Btn>
        </Between>
      )) : <T v="small">{blank ? 'Sin avisos. Usa «Simular aviso» en una cámara.' : 'Sin avisos.'}</T>}
      <Between>
        <T v="small" style={{ flex: 1 }}>Registrar avisos de cámaras en la bitácora automáticamente (solo visibles para papás)</T>
        <Toggle value={S.camlog} label="Registrar avisos automáticamente" onChange={(v) => { update((d) => { d.camlog = v; }); toast(v ? 'Los avisos irán a la bitácora' : 'Avisos de cámara en la bitácora: apagado'); }} />
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
        {two ? <Row gap={6}><T v="small">Coparentalidad</T><Toggle value={!!S.copa} label="Modo coparentalidad" onChange={(v) => { update((d) => { d.copa = v; }); toast(v ? 'Modo coparentalidad activado' : 'Modo coparentalidad apagado'); }} /></Row> : null}
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
  const { toast } = useUI();
  const [who, setWho] = useState('');
  const [place, setPlace] = useState('Casa');
  // Los avisos de llegada reales (con ubicación) aún no existen: se prueban con simulación.
  if (isCloud(S)) return null;
  const blank = isBlank(S);
  const care = MEMBERS.filter((m) => m.role === 'caregiver');
  if (blank && !care.length) {
    return (
      <Card>
        <T v="h3">Avisos de llegada</T>
        <T v="small">Agrega un cuidador en Familia para probar los avisos de llegada.</T>
      </Card>
    );
  }
  const sel = who && care.some((m) => m.key === who) ? who : (care[0] && care[0].key);
  const simulate = () => {
    if (!S.locs[sel]) { toast(`Activa primero los avisos de ${nameOf(sel)}`); return; }
    update((d) => { d.arr.unshift({ who: sel, place: place.trim() || 'Casa', t: now() }); });
    toast('Aviso de llegada simulado. Míralo en Hoy');
  };
  return (
    <Card>
      <T v="h3">Avisos de llegada</T>
      {care.map((m) => (
        <Between key={m.key}>
          <View style={{ flex: 1 }}><T v="bold">{m.name}</T><T v="small">Lugares acordados</T></View>
          <Toggle value={!!S.locs[m.key]} label={`Avisos de ${m.name}`} onChange={(v) => { update((d) => { d.locs[m.key] = v; }); toast(v ? `Avisos de ${m.name} activados` : `Avisos de ${m.name} apagados`); }} />
        </Between>
      ))}
      <T v="small">Cada cuidador decide si comparte su llegada. Solo se avisa al llegar a lugares acordados; no hay rastreo continuo.</T>
      {blank ? (
        <View style={{ gap: 8, paddingTop: 8 }}>
          <T v="label">Probar un aviso (simulación)</T>
          <Row gap={6} wrap>{care.map((m) => <Chip key={m.key} on={sel === m.key} onPress={() => setWho(m.key)}>{m.name}</Chip>)}</Row>
          <Field placeholder="Lugar, p. ej. Kínder Montessori" value={place} onChangeText={setPlace} />
          <Btn sm kind="ghost" style={{ alignSelf: 'flex-start' }} onPress={simulate}>Simular llegada</Btn>
        </View>
      ) : null}
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
