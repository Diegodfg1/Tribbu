import React, { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ARRIVALS, CAMS, CAM_EVENTS, KIDS, PEOPLE, addD, dayShort, kidKey, money, now } from '../data';
import { BoardScreen, LiveCamSheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Chip, Field, Pill, Row, T, Toggle, useUI } from '../ui';
import { DocRow } from './Familia';

// Custodia semanal de ejemplo (M = mamá, P = papá), empezando hoy.
const CUSTODY = ['M', 'M', 'P', 'P', 'M', 'M', 'P'];
const SPLITS = [[50, '50 / 50'], [60, '60 / 40'], [70, '70 / 30'], [100, 'Todo mamá'], [0, 'Todo papá']];
const SITES = [['carmen', 'Kínder Montessori y casa'], ['jorge', 'Club de natación y casa']];

function Cameras() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
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
            update((d) => { d.feed.unshift({ id: Date.now(), who: 'yo', kid: 'sofi', kind: 'Cámara', txt: `${CAMS.find((x) => x.id === e.cam).n}: ${e.txt} (${e.t}).`, t: now(), lvl: 'info', parentsOnly: true }); });
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
        <Field placeholder="Nombre del documento (opcional)" value={name} onChangeText={setName} />
        <Btn sm kind="ghost" style={{ alignSelf: 'flex-start' }} onPress={upload}>Subir foto de un documento</Btn>
      </View>
    </Card>
  );
}

function Expenses() {
  const c = useTheme();
  const { S, update } = useStore();
  const { toast } = useUI();
  const [f, setF] = useState({ t: '', amt: '', paid: 'yo', split: 50 });
  // Positivo: papá le debe a mamá. Negativo: mamá le debe a papá.
  const bal = S.exp.reduce((s, e) => s + (e.paid === 'yo' ? (e.amt * (100 - e.split)) / 100 : -(e.amt * e.split) / 100), 0);
  const add = () => {
    const amt = Number(f.amt);
    if (!f.t.trim() || !(amt > 0)) { toast('Escribe el concepto y un monto'); return; }
    update((d) => { d.exp.unshift({ id: Date.now(), t: f.t.trim(), amt, paid: f.paid, split: f.split }); });
    setF((x) => ({ ...x, t: '', amt: '' }));
    toast('Gasto agregado');
  };
  return (
    <Card>
      <Between>
        <T v="h3">Gastos compartidos</T>
        <Row gap={6}><T v="small">Coparentalidad</T><Toggle value={S.copa} label="Modo coparentalidad" onChange={(v) => update((d) => { d.copa = v; })} /></Row>
      </Between>
      {S.copa ? (
        <>
          <T v="label">Custodia esta semana</T>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {CUSTODY.map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 10, backgroundColor: w === 'M' ? c.skyBg : c.amberBg }}>
                <T v="small" color={c.ink}>{dayShort(addD(i)).slice(0, 2)}</T>
                <T v="small" color={c.ink} style={{ fontFamily: F.bold, fontSize: 11 }}>{w === 'M' ? 'Mamá' : 'Papá'}</T>
              </View>
            ))}
          </View>
        </>
      ) : null}
      <Between style={{ backgroundColor: c.paper2, borderRadius: 12, padding: 12 }}>
        <T>{bal >= 0 ? 'Papá te debe' : 'Le debes a papá'}</T>
        <T style={{ fontFamily: F.display, fontSize: 22 }}>{money(Math.abs(bal))}</T>
      </Between>
      {S.exp.map((e) => (
        <Between key={e.id} style={{ paddingVertical: 4 }}>
          <View style={{ flex: 1 }}><T>{e.t}</T><T v="small">{`Pagó ${e.paid === 'yo' ? 'mamá' : 'papá'} · ${e.split}/${100 - e.split}`}</T></View>
          <T v="num">{money(e.amt)}</T>
        </Between>
      ))}
      <T v="label" style={{ marginTop: 4 }}>Nuevo gasto</T>
      <Field placeholder="Concepto, p. ej. útiles escolares" value={f.t} onChangeText={(t) => setF((x) => ({ ...x, t }))} />
      <Field placeholder="Monto en MXN" keyboardType="decimal-pad" value={f.amt} onChangeText={(amt) => setF((x) => ({ ...x, amt }))} />
      <Row gap={6} wrap>
        <Chip on={f.paid === 'yo'} onPress={() => setF((x) => ({ ...x, paid: 'yo' }))}>Pagó mamá</Chip>
        <Chip on={f.paid === 'papa'} onPress={() => setF((x) => ({ ...x, paid: 'papa' }))}>Pagó papá</Chip>
      </Row>
      <Row gap={6} wrap>{SPLITS.map(([v, l]) => <Chip key={v} on={f.split === v} onPress={() => setF((x) => ({ ...x, split: v }))}>{l}</Chip>)}</Row>
      <Btn sm style={{ alignSelf: 'flex-start' }} onPress={add}>Agregar gasto</Btn>
    </Card>
  );
}

function Arrivals() {
  const { S, update } = useStore();
  return (
    <Card>
      <T v="h3">Avisos de llegada</T>
      {SITES.map(([w, place]) => (
        <Between key={w}>
          <View style={{ flex: 1 }}><T v="bold">{PEOPLE[w][0]}</T><T v="small">{place}</T></View>
          <Toggle value={!!S.locs[w]} label={`Avisos de ${PEOPLE[w][0]}`} onChange={(v) => update((d) => { d.locs[w] = v; })} />
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
