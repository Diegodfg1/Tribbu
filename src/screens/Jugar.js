import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { ACTS, KIDS, MATS, REWARDS, SKILLS, choresOf, favsOf, isCG, isCloud, isNewAct, kidKey, lockedCount, me, milestonesOf, mkFeed, monthOf, monthsUsed, unlockedActs } from '../data';
import { ActCard } from '../parts';
import { ActivitySheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Check, Chip, Row, Seg, T, useUI } from '../ui';

const MONTH_CAP = 60; // tope de meses para la prueba de "avanzar un mes"

function Activities() {
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  const k = KIDS[kidKey(S)];
  const filter = S.afilter || 'all';
  const fav = favsOf(S);
  // Los papás fijan el mes en que empezaron a usar las actividades (de ahí cuenta la rotación mensual).
  useEffect(() => { if (!S.since && !isCG(S)) update((d) => { d.since = monthOf(new Date()); }); }, []);
  const open = unlockedActs(S);
  const nNew = open.filter((a) => isNewAct(a, S)).length;
  const nFav = open.filter((a) => fav.includes(a.id)).length;
  const later = lockedCount(S);
  const score = (a) => (a.mats.every((m) => S.have.includes(m)) ? 0 : 2) + (k.age >= a.age[0] && k.age <= a.age[1] ? 0 : 1);
  let list = open.filter((a) => !S.skill || a.sk === S.skill);
  if (filter === 'fav') list = list.filter((a) => fav.includes(a.id));
  if (filter === 'new') list = list.filter((a) => isNewAct(a, S));
  list = [...list].sort((a, b) => score(a) - score(b));
  const ready = list.filter((a) => score(a) === 0).length;
  const all = Object.keys(MATS);
  const advance = () => {
    update((d) => {
      const [y, m] = (d.since || monthOf(new Date())).split('-').map(Number);
      d.since = monthOf(new Date(y, m - 2, 1));
    });
    toast('Prueba: simulamos que pasó un mes');
  };
  return (
    <>
      <Seg full options={[['all', 'Todas'], ['fav', `♥ Favoritas · ${nFav}`], ['new', `✨ Nuevas · ${nNew}`]]} value={filter} onChange={(v) => update((d) => { d.afilter = v; })} />
      {filter === 'new' ? (
        <Card bg="transparent" border="transparent" style={{ padding: 0 }}>
          <T v="small">{`Cada mes se desbloquean actividades nuevas. ${later ? `Faltan ${later} por llegar en los próximos meses.` : 'Ya viste todas las que trae esta versión de la app; pronto habrá más.'}`}</T>
        </Card>
      ) : null}
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
      {list.length ? list.map((a, i) => <ActCard key={a.id} a={a} i={i} onPress={() => openSheet(<ActivitySheet id={a.id} />)} />)
        : <T v="small">{filter === 'fav' ? 'Aún no hay favoritas. Toca el corazón ♡ en una actividad para guardarla aquí.' : filter === 'new' ? 'No hay actividades nuevas este mes. El próximo mes se desbloquean más.' : 'No hay actividades con esos filtros.'}</T>}
      {later && !isCloud(S) && monthsUsed(S) < MONTH_CAP ? <Btn sm kind="ghost" style={{ alignSelf: 'center', opacity: 0.7 }} onPress={advance}>Solo para pruebas: avanzar un mes</Btn> : null}
    </>
  );
}

function Points() {
  const c = useTheme();
  const { S, update } = useStore();
  const { toast } = useUI();
  const kk = kidKey(S);
  const k = KIDS[kk];
  const p = S.pts[kk] || 0;
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
        {choresOf(kk).map(([n, v], i) => (
          <Between key={n} style={{ paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <T style={{ flex: 1 }}>{n}</T>
            <Btn sm kind="sun" onPress={() => {
              update((d) => { d.pts[kk] = (d.pts[kk] || 0) + v; d.feed.unshift(mkFeed(S, { kid: kk, kind: 'Puntos', txt: `+${v} por «${n}».` })); });
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
  const { openSheet, toast } = useUI();
  const kk = kidKey(S);
  const ms = milestonesOf(kk);
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
              <Check on={!!S.mile[id]} label={t} onPress={() => { update((d) => { d.mile[id] = !d.mile[id]; }); toast(S.mile[id] ? 'Hito desmarcado' : '¡Hito logrado! 🎉'); }}><T>{t}</T></Check>
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
