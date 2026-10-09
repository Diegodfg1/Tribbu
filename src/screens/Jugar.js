import React, { useEffect, useState } from 'react';
import { KIDS, SKILLS, actsOf, favsOf, isCG, isCloud, isNewAct, kidKey, lockedCount, matsOf, monthOf, monthsUsed } from '../data';
import { UNSAFE_MSG, ideasFor, similarMatsOf, slug } from '../ideas';
import Cuentos from './Cuentos';
import Hitos from './Hitos';
import Puntos from './Puntos';
import { ActCard } from '../parts';
import { ActivitySheet } from '../sheets';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Between, Btn, Card, Chip, Field, Pill, Row, Seg, SheetHead, T, confirmAction, useUI } from '../ui';

const MONTH_CAP = 60; // tope de meses para la prueba de "avanzar un mes"

// Ideas de actividad a partir de un objeto que tienes en casa (plantillas; no es IA).
function ObjectSheet({ obj }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, closeSheet, toast } = useUI();
  const k = KIDS[kidKey(S)];
  const r = ideasFor(obj, k.age, k.name);
  const label = r.object ? r.object[0].toUpperCase() + r.object.slice(1) : '';
  const id = r.object ? slug(r.object) : '';
  const similar = r.object ? (() => {
    const mats = similarMatsOf(r.object);
    return actsOf(S).filter((a) => a.mats.some((m) => mats.includes(m))).slice(0, 3);
  })() : [];
  const addMat = (d) => {
    d.mymats = d.mymats || [];
    if (!d.mymats.some((x) => x.id === id)) d.mymats.push({ id, label });
    if (!d.have.includes(id)) d.have.push(id);
  };
  const saveMat = () => { update((d) => { addMat(d); }); closeSheet(); toast(`«${label}» agregado a tus materiales`); };
  const saveIdea = (idea) => {
    update((d) => {
      addMat(d);
      d.myacts = d.myacts || [];
      d.myacts.push({ id: Date.now() + Math.floor(Math.random() * 1000), t: idea.t, mats: idea.mats, age: idea.age, min: idea.min, sk: idea.sk, energy: idea.energy, why: idea.why, steps: idea.steps, mine: true });
    });
    closeSheet(); toast('Actividad guardada en tu lista');
  };
  if (r.unsafe) {
    return (
      <>
        <SheetHead title="Mejor otro objeto" />
        <Card bg={c.berryBg} border={c.berry}><T color={c.ink}>{UNSAFE_MSG}</T></Card>
      </>
    );
  }
  return (
    <>
      <SheetHead label="Ideas con lo que tienes en casa" title={label} />
      <T v="small">{`${r.category ? `Lo reconocemos como: ${r.category}. ` : ''}Son ideas armadas con plantillas para ${k.name} (${k.age} años), no inventadas por IA. Acompáñalo siempre al jugar.`}</T>
      {r.ideas.map((idea, i) => (
        <Card key={i}>
          <T v="h3">{idea.t}</T>
          <Row gap={4} wrap>
            <Pill tone={SKILLS[idea.sk][1]}>{SKILLS[idea.sk][0]}</Pill><Pill>{`${idea.min} min`}</Pill><Pill>{`${idea.age[0]}–${idea.age[1]} años`}</Pill>
          </Row>
          <T v="small">{idea.why}</T>
          {idea.steps.map((st, j) => <T key={j}>{`${j + 1}. ${st}`}</T>)}
          {idea.note ? <T v="small" color={c.berry}>{idea.note}</T> : null}
          <Btn kind="sun" onPress={() => saveIdea(idea)}>Guardar esta actividad</Btn>
        </Card>
      ))}
      {similar.length ? (
        <>
          <T v="label">Actividades que ya tienes y usan algo parecido</T>
          {similar.map((a) => <Btn key={a.id} kind="ghost" onPress={() => openSheet(<ActivitySheet id={a.id} />)}>{a.t}</Btn>)}
        </>
      ) : null}
      <Btn kind="ghost" onPress={saveMat}>Solo agregar «{label}» a mis materiales</Btn>
    </>
  );
}

function Activities() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  const k = KIDS[kidKey(S)];
  const MATS = matsOf(S);
  const filter = S.afilter || 'all';
  const fav = favsOf(S);
  const [obj, setObj] = useState('');
  // Los papás fijan el mes en que empezaron a usar las actividades (de ahí cuenta la rotación mensual).
  useEffect(() => { if (!S.since && !isCG(S)) update((d) => { d.since = monthOf(new Date()); }); }, []);
  const open = actsOf(S);
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
  const mine = S.mymats || [];
  const advance = () => {
    update((d) => {
      const [y, m] = (d.since || monthOf(new Date())).split('-').map(Number);
      d.since = monthOf(new Date(y, m - 2, 1));
    });
    toast('Prueba: simulamos que pasó un mes');
  };
  const ideas = () => {
    if (!obj.trim()) { toast('Escribe un objeto que tengas en casa'); return; }
    openSheet(<ObjectSheet obj={obj} />);
  };
  return (
    <>
      <Seg full options={[['all', 'Todas'], ['fav', `♥ Favoritas · ${nFav}`], ['new', `Nuevas · ${nNew}`]]} value={filter} onChange={(v) => update((d) => { d.afilter = v; })} />
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
      {isCG(S) ? null : (
        <Card>
          <T v="h3">¿Tienes otro objeto en casa?</T>
          <T v="small">Escríbelo y te sugerimos actividades para jugar con él, o lo agregas a tus materiales.</T>
          <Row>
            <Field style={{ flex: 1 }} placeholder="P. ej. rollo de papel de baño" value={obj} onChangeText={setObj} onSubmitEditing={ideas} returnKeyType="search" />
            <Btn sm kind="sun" onPress={ideas}>Ver ideas</Btn>
          </Row>
          {mine.length ? (
            <>
              <T v="label">Tus objetos (toca uno para quitarlo)</T>
              <Row gap={6} wrap>
                {mine.map((x) => (
                  <Chip key={x.id} onPress={() => confirmAction(`¿Quitar «${x.label}»?`, 'Dejará de aparecer en tus materiales. Las actividades que ya guardaste se quedan.', 'Quitar', () => {
                    update((d) => { d.mymats = d.mymats.filter((y) => y.id !== x.id); d.have = d.have.filter((y) => y !== x.id); });
                    toast(`«${x.label}» quitado`);
                  })}>{`${x.label} ×`}</Chip>
                ))}
              </Row>
            </>
          ) : null}
        </Card>
      )}
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

export default function Jugar() {
  const { S, update } = useStore();
  const tabs = isCG(S)
    ? [['act', 'Actividades'], ['pts', 'Puntos'], ['cuentos', 'Cuentos']]
    : [['act', 'Actividades'], ['pts', 'Puntos'], ['mil', 'Hitos'], ['cuentos', 'Cuentos']];
  const tab = tabs.find((t) => t[0] === S.jtab) ? S.jtab : 'act';
  return (
    <>
      <Seg full options={tabs} value={tab} onChange={(v) => update((d) => { d.jtab = v; })} />
      {tab === 'act' ? <Activities /> : tab === 'pts' ? <Puntos /> : tab === 'mil' ? <Hitos /> : <Cuentos />}
    </>
  );
}
