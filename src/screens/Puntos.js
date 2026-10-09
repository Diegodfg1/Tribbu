// Puntos, quehaceres y recompensas. Los papás crean los quehaceres y las recompensas y deciden cuántos puntos valen;
// cualquier cuidador puede dar puntos (pero no quitarlos ni canjear).
import React, { useState } from 'react';
import { View } from 'react-native';
import { CHORE_IDEAS, KIDS, REWARD_IDEAS, choresFor, demoChores, demoRewards, isCG, kidKey, mkFeed, rewardsFor } from '../data';
import { ProgressBar } from '../parts';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Chip, Field, Row, SheetHead, T, confirmAction, useUI } from '../ui';

const PTS = [1, 2, 3, 5, 8, 10, 15, 20];

function PointsPicker({ value, onChange }) {
  return (
    <View style={{ gap: 8 }}>
      <T v="label">Puntos</T>
      <Row gap={6} wrap>{PTS.map((n) => <Chip key={n} on={Number(value) === n} onPress={() => onChange(String(n))}>{String(n)}</Chip>)}</Row>
      <Field placeholder="O escribe otro número" keyboardType="number-pad" value={value} onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ''))} />
    </View>
  );
}

// Crear o editar un quehacer.
function ChoreSheet({ id }) {
  const { S, update } = useStore();
  const { closeSheet, toast } = useUI();
  const orig = id ? (S.chores || demoChores()).find((c) => c.id === id) : null;
  const [t, setT] = useState(orig ? orig.t : '');
  const [pts, setPts] = useState(orig ? String(orig.pts) : '5');
  const [kid, setKid] = useState(orig ? orig.kid : 'all');
  const save = () => {
    const n = Number(pts);
    if (!t.trim()) { toast('Escribe el nombre del quehacer'); return; }
    if (!(n >= 1 && n <= 1000)) { toast('Los puntos deben ser de 1 a 1000'); return; }
    update((d) => {
      d.chores = d.chores || demoChores();
      if (orig) { const x = d.chores.find((c) => c.id === id); x.t = t.trim(); x.pts = n; x.kid = kid; }
      else d.chores.push({ id: `q${Date.now()}`, t: t.trim(), pts: n, kid });
    });
    closeSheet(); toast(orig ? 'Quehacer actualizado' : 'Quehacer agregado');
  };
  const del = () => confirmAction('¿Eliminar este quehacer?', `«${orig.t}»`, 'Eliminar', () => {
    update((d) => { d.chores = (d.chores || demoChores()).filter((c) => c.id !== id); });
    closeSheet(); toast('Quehacer eliminado');
  });
  return (
    <>
      <SheetHead title={orig ? 'Editar quehacer' : 'Nuevo quehacer'} />
      <Field placeholder="P. ej. recoger los juguetes" value={t} onChangeText={setT} autoFocus={!orig} />
      <PointsPicker value={pts} onChange={setPts} />
      <T v="label">Para quién</T>
      <Row gap={6} wrap>
        <Chip on={kid === 'all'} onPress={() => setKid('all')}>Todos los niños</Chip>
        {Object.keys(KIDS).map((k) => <Chip key={k} on={kid === k} onPress={() => setKid(k)}>{KIDS[k].name}</Chip>)}
      </Row>
      <Btn kind="sun" onPress={save}>Guardar</Btn>
      {orig ? <Btn kind="ghost" onPress={del}>Eliminar quehacer</Btn> : null}
    </>
  );
}

// Crear o editar una recompensa.
function RewardSheet({ id }) {
  const { S, update } = useStore();
  const { closeSheet, toast } = useUI();
  const orig = id ? (S.rewards || demoRewards()).find((c) => c.id === id) : null;
  const [t, setT] = useState(orig ? orig.t : '');
  const [pts, setPts] = useState(orig ? String(orig.pts) : '20');
  const save = () => {
    const n = Number(pts);
    if (!t.trim()) { toast('Escribe cuál es la recompensa'); return; }
    if (!(n >= 1 && n <= 5000)) { toast('Los puntos deben ser de 1 a 5000'); return; }
    update((d) => {
      d.rewards = d.rewards || demoRewards();
      if (orig) { const x = d.rewards.find((r) => r.id === id); x.t = t.trim(); x.pts = n; }
      else d.rewards.push({ id: `r${Date.now()}`, t: t.trim(), pts: n });
    });
    closeSheet(); toast(orig ? 'Recompensa actualizada' : 'Recompensa agregada');
  };
  const del = () => confirmAction('¿Eliminar esta recompensa?', `«${orig.t}»`, 'Eliminar', () => {
    update((d) => { d.rewards = (d.rewards || demoRewards()).filter((r) => r.id !== id); });
    closeSheet(); toast('Recompensa eliminada');
  });
  return (
    <>
      <SheetHead title={orig ? 'Editar recompensa' : 'Nueva recompensa'} />
      <Field placeholder="P. ej. elegir la película del viernes" value={t} onChangeText={setT} autoFocus={!orig} />
      <PointsPicker value={pts} onChange={setPts} />
      <Btn kind="sun" onPress={save}>Guardar</Btn>
      {orig ? <Btn kind="ghost" onPress={del}>Eliminar recompensa</Btn> : null}
    </>
  );
}

export default function Puntos() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  const cg = isCG(S);
  const kk = kidKey(S);
  const k = KIDS[kk];
  const p = S.pts[kk] || 0;
  const chores = choresFor(S, kk);
  const rewards = rewardsFor(S);
  const [amt, setAmt] = useState('');
  const [why, setWhy] = useState('');

  const move = (v, txt) => {
    update((d) => { d.pts[kk] = Math.max(0, (d.pts[kk] || 0) + v); d.feed.unshift(mkFeed(S, { kid: kk, kind: 'Puntos', txt })); });
    toast(v > 0 ? `+${v} puntos para ${k.name}` : `${v} puntos para ${k.name}`);
  };
  const free = (sign) => {
    const n = Number(amt);
    if (!(n >= 1 && n <= 1000)) { toast('Escribe cuántos puntos (de 1 a 1000)'); return; }
    const motivo = why.trim() ? ` por «${why.trim()}»` : '';
    move(sign * n, sign > 0 ? `+${n} puntos${motivo}.` : `−${n} puntos${motivo}.`);
    setAmt(''); setWhy('');
  };
  const addIdea = ([t, pts]) => {
    update((d) => { d.chores = d.chores || demoChores(); d.chores.push({ id: `q${Date.now()}${Math.random()}`, t, pts, kid: 'all' }); });
    toast('Quehacer agregado');
  };
  const addRewardIdea = ([t, pts]) => {
    update((d) => { d.rewards = d.rewards || demoRewards(); d.rewards.push({ id: `r${Date.now()}${Math.random()}`, t, pts }); });
    toast('Recompensa agregada');
  };
  return (
    <>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <T v="label">{`Puntos de ${k.name}`}</T>
          <T style={{ fontFamily: F.display, fontSize: 44, lineHeight: 48, fontVariant: ['tabular-nums'] }}>{String(p)}</T>
        </View>
        <T v="small" style={{ maxWidth: 160 }}>{cg ? 'Tú también puedes dar puntos.' : 'Cualquier cuidador puede dar puntos.'}</T>
      </Card>

      <Card>
        <T v="h3">Puntos libres</T>
        <T v="small">Da o quita los puntos que quieras, con el motivo que quieras.</T>
        <Row>
          <Field style={{ width: 90 }} placeholder="Puntos" keyboardType="number-pad" value={amt} onChangeText={(v) => setAmt(v.replace(/[^0-9]/g, ''))} />
          <Field style={{ flex: 1 }} placeholder="Motivo (opcional)" value={why} onChangeText={setWhy} />
        </Row>
        <Row>
          <Btn sm kind="sun" onPress={() => free(1)}>Dar puntos</Btn>
          {cg ? null : <Btn sm kind="ghost" onPress={() => free(-1)}>Quitar puntos</Btn>}
        </Row>
      </Card>

      <Card>
        <Between>
          <T v="h3">Quehaceres</T>
          {cg ? null : <Btn sm kind="ghost" onPress={() => openSheet(<ChoreSheet id={null} />)}>+ Agregar</Btn>}
        </Between>
        {chores.map((ch, i) => (
          <Between key={ch.id} style={{ paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <View style={{ flex: 1 }}>
              <T>{ch.t}</T>
              {cg ? null : <T v="small" color={c.sky} onPress={() => openSheet(<ChoreSheet id={ch.id} />)} accessibilityRole="button">Editar</T>}
            </View>
            <Btn sm kind="sun" onPress={() => move(ch.pts, `+${ch.pts} por «${ch.t}».`)}>{`+${ch.pts}`}</Btn>
          </Between>
        ))}
        {!chores.length ? <T v="small">{cg ? 'Los papás aún no agregan quehaceres.' : 'Aún no hay quehaceres. Agrega los tuyos o empieza con una sugerencia.'}</T> : null}
        {!chores.length && !cg ? <Row gap={6} wrap>{CHORE_IDEAS.map((x) => <Chip key={x[0]} onPress={() => addIdea(x)}>{`${x[0]} · ${x[1]}`}</Chip>)}</Row> : null}
      </Card>

      <Card>
        <Between>
          <T v="h3">Recompensas</T>
          {cg ? null : <Btn sm kind="ghost" onPress={() => openSheet(<RewardSheet id={null} />)}>+ Agregar</Btn>}
        </Between>
        {rewards.map((r) => (
          <View key={r.id} style={{ gap: 6, paddingVertical: 4 }}>
            <Between>
              <View style={{ flex: 1 }}>
                <T>{r.t}</T>
                {cg ? null : <T v="small" color={c.sky} onPress={() => openSheet(<RewardSheet id={r.id} />)} accessibilityRole="button">Editar</T>}
              </View>
              <T v="small">{`${Math.min(p, r.pts)} / ${r.pts}`}</T>
            </Between>
            <ProgressBar value={Math.min(p, r.pts)} total={r.pts} label={`Avance de «${r.t}»`} />
            {p >= r.pts && !cg ? (
              <Btn sm style={{ alignSelf: 'flex-start' }} onPress={() => {
                update((d) => { d.pts[kk] = (d.pts[kk] || 0) - r.pts; d.feed.unshift(mkFeed(S, { kid: kk, kind: 'Puntos', txt: `Canjeó «${r.t}» (−${r.pts}).` })); });
                toast(`Canjeado: ${r.t}`);
              }}>Canjear</Btn>
            ) : null}
          </View>
        ))}
        {!rewards.length ? <T v="small">{cg ? 'Los papás aún no agregan recompensas.' : 'Aún no hay recompensas. Agrega las que quieras o empieza con una sugerencia.'}</T> : null}
        {!rewards.length && !cg ? <Row gap={6} wrap>{REWARD_IDEAS.map((x) => <Chip key={x[0]} onPress={() => addRewardIdea(x)}>{`${x[0]} · ${x[1]}`}</Chip>)}</Row> : null}
        <T v="small">Los papás eligen y canjean las recompensas.</T>
      </Card>
    </>
  );
}
