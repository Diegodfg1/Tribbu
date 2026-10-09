import React, { useState } from 'react';
import { View } from 'react-native';
import { KIDS, isCG, isOwn, kidKey, letterOf, me, nameOf, now, PARENTS, PEOPLE } from '../data';
import { AccountCard, FamilyAdmin } from './FamiliaAdmin';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Avatar, Between, Btn, Card, Field, Item, Pill, Row, Seg, T, useUI } from '../ui';

export const DocRow = ({ d, first, right }) => {
  const c = useTheme();
  return (
    <Item first={first}>
      <Row>
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: c.skyBg, alignItems: 'center', justifyContent: 'center' }}>
          <T v="small" color={c.sky} style={{ fontFamily: F.bold, fontSize: 11 }}>{d.kind.slice(0, 3).toUpperCase()}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T v="bold">{d.t}</T>
          <T v="small">{(d.note || d.kind) + (d.kid ? '' : ' · familia')}</T>
        </View>
        {right}
      </Row>
    </Item>
  );
};

const PERMS = [
  ['Actividades y animaciones', 'Todo', 'Todo'], ['Agenda', 'Todo', 'Solo su turno'], ['Calendarios vinculados', 'Sí', 'No'],
  ['Pendientes', 'Todos', 'Solo los suyos'], ['Bitácora y mensajes', 'Todo', 'Del niño que cuida'], ['Ficha de emergencia', 'Sí', 'Sí'],
  ['Menú y recetas', 'Todo', 'Menú de hoy y recetas'], ['Compras', 'Sí', 'No'], ['Documentos', 'Todos', 'Solo los compartidos'],
  ['Gastos y coparentalidad', 'Sí', 'No'], ['Cámaras y ubicación', 'Sí', 'No'], ['Puntos', 'Dar y canjear', 'Dar puntos'],
];

function Logbook() {
  const c = useTheme();
  const { S, update } = useStore();
  const { toast } = useUI();
  const cg = isCG(S);
  const kk = kidKey(S);
  const k = KIDS[kk];
  const [txt, setTxt] = useState('');
  const [lvl, setLvl] = useState('info');
  const feed = S.feed.filter((x) => x.kid === kk && !(cg && x.parentsOnly));
  const send = () => {
    const v = txt.trim();
    if (!v) return;
    update((d) => { d.feed.unshift({ id: Date.now(), who: me(S), kid: kk, kind: 'Mensaje', txt: v, t: now(), lvl }); });
    setTxt('');
    toast(lvl === 'urgente' ? 'Avisamos a todos con alerta urgente' : 'Mensaje enviado');
  };
  return (
    <>
      <Between><T v="h2">{`Bitácora de ${k.name}`}</T><T v="label">Hoy</T></Between>
      <Card>
        <Field multiline placeholder={`Cuéntale a ${cg ? 'los papás' : 'la familia'} cómo va ${k.name}…`} value={txt} onChangeText={setTxt} />
        <Between>
          <Seg options={[['info', 'Informativo'], ['atencion', 'Atención'], ['urgente', 'Urgente']]} value={lvl} onChange={setLvl} />
          <Btn sm onPress={send}>Enviar</Btn>
        </Between>
      </Card>
      <Card style={{ gap: 0 }}>
        {feed.length ? feed.map((x, i) => (
          <Item key={x.id} first={!i} style={x.lvl === 'urgente' ? { backgroundColor: c.berryBg, marginHorizontal: -14, paddingHorizontal: 14 } : null}>
            <Row style={{ alignItems: 'flex-start' }}>
              <Avatar letter={letterOf(x.who)} />
              <View style={{ flex: 1, gap: 3 }}>
                <Between><T v="bold">{nameOf(x.who)}</T><T v="small">{x.t}</T></Between>
                <Row gap={4} wrap>
                  <Pill tone="sky">{x.kind}</Pill>
                  {x.lvl === 'atencion' ? <Pill tone="amber">Atención</Pill> : null}
                  {x.lvl === 'urgente' ? <Pill tone="berry">Urgente</Pill> : null}
                  {x.parentsOnly ? <Pill tone="amber">Solo papás</Pill> : null}
                </Row>
                <T>{x.txt}</T>
              </View>
            </Row>
          </Item>
        )) : <T v="small">Aún no hay registros hoy.</T>}
      </Card>
    </>
  );
}

function Emergency() {
  const c = useTheme();
  const { S } = useStore();
  const k = KIDS[kidKey(S)];
  const rows = [['Tipo de sangre', k.blood], ['Alergias', k.allergy], ['Pediatra', k.ped], ['Seguro', k.ins]];
  return (
    <Card bg={c.berryBg} border={c.berry}>
      <T v="h3" color={c.berry}>Ficha de emergencia · funciona sin internet</T>
      {rows.map(([a, b]) => (
        <View key={a}><T v="label">{a}</T><T v="bold">{b}</T></View>
      ))}
    </Card>
  );
}

function SharedDocs() {
  const { S } = useStore();
  const kk = kidKey(S);
  const docs = S.docs.filter((d) => (!d.kid || d.kid === kk) && d.shared);
  return (
    <Card style={{ gap: 0 }}>
      <T v="h3">{isCG(S) ? 'Documentos que te compartieron' : 'Documentos compartidos con cuidadores'}</T>
      {docs.length ? docs.map((d, i) => <DocRow key={d.id} d={d} first={!i} />) : <T v="small">Ninguno.</T>}
      {isCG(S) ? null : <T v="small" style={{ marginTop: 6 }}>Decides qué compartir en Casa → Documentos.</T>}
    </Card>
  );
}

function Permissions() {
  const c = useTheme();
  return (
    <Card style={{ gap: 0 }}>
      <T v="h3" style={{ marginBottom: 6 }}>Qué ve cada quien</T>
      <Row style={{ paddingBottom: 6 }}>
        <T v="label" style={{ flex: 1.4 }}>Sección</T><T v="label" style={{ flex: 1 }}>Papás</T><T v="label" style={{ flex: 1 }}>Cuidadores</T>
      </Row>
      {PERMS.map(([a, b, d], i) => (
        <Row key={a} gap={6} style={{ paddingVertical: 7, borderTopWidth: 1, borderTopColor: c.line, alignItems: 'flex-start' }}>
          <T style={{ flex: 1.4, fontSize: 13.5 }}>{a}</T>
          <T style={{ flex: 1, fontSize: 13.5 }} color={c.leaf}>{b}</T>
          <T style={{ flex: 1, fontSize: 13.5 }} color={d === 'No' ? c.berry : c.leaf}>{d}</T>
        </Row>
      ))}
    </Card>
  );
}

function Network() {
  return (
    <Card>
      <T v="h3">Red de cuidado</T>
      <Row gap={6} wrap>
        {Object.entries(PEOPLE).map(([key, [n]]) => (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <T v="bold">{n}</T>
            <Pill tone={PARENTS.includes(key) ? 'sky' : 'amber'}>{PARENTS.includes(key) ? 'Papá/mamá' : 'Cuidador'}</Pill>
          </View>
        ))}
      </Row>
    </Card>
  );
}

export default function Familia() {
  const { S } = useStore();
  return (
    <>
      <Logbook />
      <Emergency />
      <SharedDocs />
      {isCG(S) ? null : <><Permissions />{isOwn(S) ? <FamilyAdmin /> : <Network />}</>}
      <AccountCard />
    </>
  );
}
