// Hitos del desarrollo por edad, con estadísticas de avance por niño.
// Ver milestones.js para el origen del catálogo y sus límites (no es un diagnóstico).
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { KIDS, actById, dateLong, fromKey, kidKey, todayKey } from '../data';
import { AREAS, MILE_AGES, MILE_ITEMS, MILE_NOTE, MILE_SOURCES, bracketForAge, doneDate, isDone, mileKey, mileStats } from '../milestones';
import { ProgressBar } from '../parts';
import { ActivitySheet } from '../sheets';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Check, Chip, Pill, Row, T, useUI } from '../ui';

const AREA_TONE = { social: 'berry', lenguaje: 'sky', cognitivo: 'sun', movimiento: 'leaf' };
const AREA_COLOR = (c) => ({ social: c.berry, lenguaje: c.sky, cognitivo: c.sun, movimiento: c.leaf });

export default function Hitos() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  const kk = kidKey(S);
  const k = KIDS[kk];
  const st = mileStats(S, kk, k.age);
  const [m, setM] = useState(st.cur.m);
  // Al cambiar de niño se muestra la edad que le toca.
  useEffect(() => { setM(bracketForAge(KIDS[kk].age).m); }, [kk]);
  const bracket = MILE_AGES.find((b) => b.m === m) || st.cur;
  const items = MILE_ITEMS.filter((i) => i.m === bracket.m);
  const colors = AREA_COLOR(c);
  const perAge = Object.fromEntries(st.perAge.map((b) => [b.m, b]));
  const toggle = (it) => {
    const key = mileKey(kk, it.id);
    const was = !!S.mile[key];
    update((d) => { if (d.mile[key]) delete d.mile[key]; else d.mile[key] = todayKey(); });
    toast(was ? 'Hito desmarcado' : '¡Hito logrado!');
  };

  return (
    <>
      <T v="h2">{`Hitos de ${k.name}`}</T>

      <Card>
        <T v="label">{`Resumen del desarrollo · ${st.cur.label}`}</T>
        {st.cur.tips ? (
          <T>{`${k.name} está en la etapa de ${st.cur.label}. De esta edad se muestran cosas que suelen verse; no hay lista de hitos como en los más pequeños.`}</T>
        ) : (
          <>
            <Between>
              <T v="h3">{`${st.curDone} de ${st.curTotal} hitos de esta edad`}</T>
              <T v="num">{st.curTotal ? `${Math.round((st.curDone / st.curTotal) * 100)} %` : ''}</T>
            </Between>
            <ProgressBar value={st.curDone} total={st.curTotal} label="Avance de esta edad" />
          </>
        )}
        {Object.keys(AREAS).map((a) => (
          st.byArea[a].total ? (
            <View key={a} style={{ gap: 3 }}>
              <Between><T v="small" color={c.ink}>{AREAS[a]}</T><T v="small">{`${st.byArea[a].done} / ${st.byArea[a].total}`}</T></Between>
              <ProgressBar value={st.byArea[a].done} total={st.byArea[a].total} color={colors[a]} label={`${AREAS[a]}: ${st.byArea[a].done} de ${st.byArea[a].total}`} />
            </View>
          ) : null
        ))}
        {!st.cur.tips ? <T v="small">{`Hasta esta edad: ${st.allDone} de ${st.allTotal} hitos marcados.`}</T> : null}
        {st.pending.length ? (
          <View style={{ backgroundColor: c.amberBg, borderRadius: 12, padding: 10, gap: 6 }}>
            <T v="small" color={c.ink}>{`Hay ${st.pending.length} hitos de edades anteriores sin marcar. Revísalos cuando quieras; si alguno aún no lo logra, coméntalo con su pediatra.`}</T>
            <Btn sm kind="ghost" style={{ alignSelf: 'flex-start' }} onPress={() => setM(st.firstPending)}>Revisar los pendientes</Btn>
          </View>
        ) : null}
      </Card>

      {st.recent.length ? (
        <Card>
          <T v="h3">Últimos logros</T>
          {st.recent.map((it) => (
            <Row key={it.id} style={{ alignItems: 'flex-start' }}>
              <T color={c.leaf}>✓</T>
              <View style={{ flex: 1 }}><T>{it.t}</T><T v="small">{`${MILE_AGES.find((b) => b.m === it.m).label} · ${dateLong(fromKey(it.date))}`}</T></View>
            </Row>
          ))}
        </Card>
      ) : null}

      <Card>
        <T v="label">Avance por edad</T>
        {st.perAge.map((b) => (
          <Pressable key={b.m} onPress={() => setM(b.m)} accessibilityRole="button" accessibilityLabel={`${b.label}: ${b.done} de ${b.total}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T v="small" color={b.m === st.cur.m ? c.ink : c.inkSoft} style={{ width: 96, fontFamily: b.m === st.cur.m ? F.bold : F.body }}>{b.label}</T>
            <View style={{ flex: 1 }}><ProgressBar value={b.done} total={b.total} color={b.m === st.cur.m ? c.sun : c.leaf} height={10} label={`${b.label}`} /></View>
            <T v="small" style={{ width: 40, textAlign: 'right' }}>{`${b.done}/${b.total}`}</T>
          </Pressable>
        ))}
      </Card>

      <T v="label">Elige una edad</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {MILE_AGES.map((b) => <Chip key={b.m} on={b.m === bracket.m} onPress={() => setM(b.m)}>{b.m === st.cur.m ? `${b.label} · ahora` : b.label}</Chip>)}
      </ScrollView>

      {Object.keys(AREAS).map((a) => {
        const list = items.filter((i) => i.area === a);
        if (!list.length) return null;
        return (
          <Card key={a}>
            <Row><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors[a] }} /><T v="h3">{AREAS[a]}</T></Row>
            {list.map((it) => {
              const act = it.act ? actById(S, it.act) : null;
              const dt = doneDate(S, kk, it.id);
              return (
                <View key={it.id} style={{ gap: 3, paddingVertical: 4 }}>
                  <Check on={isDone(S, kk, it.id)} label={it.t} onPress={() => toggle(it)}>
                    <T>{it.t}</T>
                    {dt ? <T v="small">{`Logrado el ${dateLong(fromKey(dt))}`}</T> : null}
                  </Check>
                  {act ? (
                    <Pressable onPress={() => openSheet(<ActivitySheet id={act.id} />)} style={{ marginLeft: 32 }}>
                      <T v="small" color={c.sky} style={{ fontFamily: F.bold }}>{`Practícalo con «${act.t}»`}</T>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </Card>
        );
      })}

      <Card bg={c.leafBg} border={c.leafBg}>
        <T v="small" color={c.ink}>{MILE_NOTE}</T>
        <T v="label">Fuentes</T>
        {MILE_SOURCES.map((s) => (
          <Pressable key={s.url} onPress={() => Linking.openURL(s.url).catch(() => {})} accessibilityRole="link">
            <T v="small" color={c.sky} style={{ textDecorationLine: 'underline' }}>{s.n}</T>
          </Pressable>
        ))}
      </Card>
    </>
  );
}
