import React from 'react';
import { Pressable, View } from 'react-native';
import { ACTS, CHORES, KIDS, MATS, MILESTONES, REWARDS, SKILLS, isCG, kidKey, me, now } from '../data';
import { ActCard } from '../parts';
import { ActivitySheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Check, Chip, Row, Seg, T, useUI } from '../ui';

function Activities() {
  const { S, update } = useStore();
  const { openSheet } = useUI();
  const k = KIDS[kidKey(S)];
  const score = (a) => (a.mats.every((m) => S.have.includes(m)) ? 0 : 2) + (k.age >= a.age[0] && k.age <= a.age[1] ? 0 : 1);
  const list = ACTS.filter((a) => !S.skill || a.sk === S.skill).sort((a, b) => score(a) - score(b));
  const ready = list.filter((a) => score(a) === 0).length;
  const all = Object.keys(MATS);
  return (
    <>
      <Between>
        <T v="h2">¿Qué hay en casa?</T>
        <Btn sm kind="ghost" onPress={() => update((d) => { d.have = d.have.length === all.length ? [] : all; })}>Todo</Btn>
      </Between>
      <T v="small">{`Marca los materiales disponibles y te mostramos actividades sin pantalla para la edad de ${k.name}.`}</T>
      <Row gap={6} wrap>
        {Object.entries(MATS).map(([m, label]) => (
          <Chip key={m} on={S.have.includes(m)} onPress={() => update((d) => { d.have = d.have.includes(m) ? d.have.filter((x) => x !== m) : [...d.have, m]; })}>{label}</Chip>
        ))}
      </Row>
      <Row gap={6} wrap>
        <Chip on={!S.skill} onPress={() => update((d) => { d.skill = null; })}>Todas</Chip>
        {Object.entries(SKILLS).map(([s, [label]]) => <Chip key={s} on={S.skill === s} onPress={() => update((d) => { d.skill = s; })}>{label}</Chip>)}
      </Row>
      <T v="label">{`${ready} lista${ready === 1 ? '' : 's'} para ${k.name} con lo que tienes`}</T>
      {list.map((a, i) => <ActCard key={a.id} a={a} i={i} onPress={() => openSheet(<ActivitySheet id={a.id} />)} />)}
    </>
  );
}

function Points() {
  const c = useTheme();
  const { S, update } = useStore();
  const { toast } = useUI();
  const kk = kidKey(S);
  const k = KIDS[kk];
  const p = S.pts[kk];
  return (
    <>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <T v="label">{`Puntos de ${k.name}`}</T>
          <T style={{ fontFamily: F.display, fontSize: 44, lineHeight: 48, fontVariant: ['tabular-nums'] }}>{String(p)}</T>
        </View>
        <T v="small" style={{ maxWidth: 160 }}>{isCG(S) ? 'Tú también puedes dar puntos.' : 'Cualquier cuidador puede dar puntos.'}</T>
      </Card>
      <Card>
        <T v="h3">Quehaceres</T>
        {CHORES[kk].map(([n, v], i) => (
          <Between key={n} style={{ paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <T style={{ flex: 1 }}>{n}</T>
            <Btn sm kind="sun" onPress={() => {
              update((d) => { d.pts[kk] += v; d.feed.unshift({ id: Date.now(), who: me(S), kid: kk, kind: 'Puntos', txt: `+${v} por «${n}».`, t: now(), lvl: 'info' }); });
              toast(`+${v} puntos para ${k.name}`);
            }}>{`+${v}`}</Btn>
          </Between>
        ))}
      </Card>
      <Card>
        <T v="h3">Recompensas</T>
        {REWARDS.map(([n, v]) => (
          <View key={n} style={{ gap: 6, paddingVertical: 4 }}>
            <Between><T style={{ flex: 1 }}>{n}</T><T v="small">{`${Math.min(p, v)} / ${v}`}</T></Between>
            <View style={{ height: 8, backgroundColor: c.paper2, borderRadius: 9, overflow: 'hidden' }}>
              <View style={{ height: 8, width: `${Math.min(100, (p / v) * 100)}%`, backgroundColor: c.leaf, borderRadius: 9 }} />
            </View>
            {p >= v && !isCG(S) ? <Btn sm style={{ alignSelf: 'flex-start' }} onPress={() => { update((d) => { d.pts[kk] -= v; }); toast(`Canjeado: ${n}`); }}>Canjear</Btn> : null}
          </View>
        ))}
        <T v="small">Los papás eligen y canjean las recompensas.</T>
      </Card>
    </>
  );
}

function Milestones() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet } = useUI();
  const kk = kidKey(S);
  const ms = MILESTONES[kk];
  const done = ms.filter((m) => S.mile[m[0]]).length;
  return (
    <>
      <Between><T v="h2">{`Hitos de ${KIDS[kk].name}`}</T><T v="label">{`${done} de ${ms.length}`}</T></Between>
      <T v="small">{`Guía orientativa para ${KIDS[kk].age} años. Cada niño tiene su ritmo; si algo te preocupa, coméntalo con su pediatra.`}</T>
      <Card>
        {ms.map(([id, t, act], i) => {
          const a = ACTS.find((x) => x.id === act);
          return (
            <View key={id} style={{ paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, gap: 4 }}>
              <Check on={!!S.mile[id]} label={t} onPress={() => update((d) => { d.mile[id] = !d.mile[id]; })}><T>{t}</T></Check>
              {a ? (
                <Pressable onPress={() => openSheet(<ActivitySheet id={a.id} />)} style={{ marginLeft: 32 }}>
                  <T v="small" color={c.sky} style={{ fontFamily: F.bold }}>{`Practícalo con «${a.t}»`}</T>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </Card>
    </>
  );
}

export default function Jugar() {
  const { S, update } = useStore();
  const tabs = isCG(S) ? [['act', 'Actividades'], ['pts', 'Puntos']] : [['act', 'Actividades'], ['pts', 'Puntos'], ['mil', 'Hitos']];
  const tab = tabs.find((t) => t[0] === S.jtab) ? S.jtab : 'act';
  return (
    <>
      <Seg full options={tabs} value={tab} onChange={(v) => update((d) => { d.jtab = v; })} />
      {tab === 'act' ? <Activities /> : tab === 'pts' ? <Points /> : <Milestones />}
    </>
  );
}
