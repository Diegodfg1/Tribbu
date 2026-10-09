// Cuentos: eliges el tema y quiénes son los personajes (los niños, los papás o cuidadores, o un personaje imaginario)
// y Tribbu arma un cuento para leer en voz alta, página por página. Ver stories.js.
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KIDS, MEMBERS, dateLong, fromKey, isCG, kidKey, mkFeed } from '../data';
import { useStore } from '../store';
import { F, useTheme } from '../theme';
import { IMAGINARY, THEMES, buildStory, joinNames } from '../stories';
import { Between, Btn, Card, Chip, Row, T, confirmAction, useUI } from '../ui';

const toggle = (arr, k) => (arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);

// Lectura a pantalla completa, una página a la vez.
function StoryScreen({ cfg, saved }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { S, update } = useStore();
  const { closeFull, toast } = useUI();
  const [seed, setSeed] = useState(cfg ? cfg.seed : 1);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(!!saved);
  const story = saved || buildStory(cfg.theme, { names: cfg.names, imag: cfg.imag }, seed);
  const pages = ['cover', ...story.paras, 'end'];
  const last = page === pages.length - 1;
  const p = pages[page];
  const save = () => {
    update((d) => { d.stories = d.stories || []; d.stories.unshift({ id: Date.now(), theme: story.theme, themeName: story.themeName, title: story.title, paras: story.paras, ask: story.ask, heroes: story.heroes, helper: story.helper }); });
    setDone(true); toast('Cuento guardado');
  };
  const log = () => {
    const kids = cfg && cfg.kids && cfg.kids.length ? cfg.kids : [kidKey(S)];
    update((d) => { kids.forEach((k) => d.feed.unshift(mkFeed(S, { kid: k, kind: 'Cuento', txt: `Leímos el cuento «${story.title}».` }))); });
    toast('Registrado en la bitácora');
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={closeFull} accessibilityRole="button" accessibilityLabel="Cerrar el cuento" hitSlop={10}><T v="bold" color={c.sky}>Cerrar</T></Pressable>
        <T v="small">{`Página ${page + 1} de ${pages.length}`}</T>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, gap: 18, flexGrow: 1, justifyContent: 'center' }}>
        {p === 'cover' ? (
          <View style={{ gap: 12, alignItems: 'center' }}>
            <T v="label">{`Cuento · ${story.themeName}`}</T>
            <T style={{ fontFamily: F.display, fontSize: 36, lineHeight: 42, textAlign: 'center' }}>{story.title}</T>
            <T style={{ textAlign: 'center', fontSize: 18 }}>{`Un cuento con ${joinNames(story.heroes)}${story.helper && !story.heroes.includes(story.helper) ? ` y ${story.helper}` : ''}`}</T>
            <T v="small" style={{ textAlign: 'center' }}>Léanlo en voz alta, sin prisa. Toca «Siguiente» para pasar de página.</T>
          </View>
        ) : p === 'end' ? (
          <View style={{ gap: 12 }}>
            <T v="h2">Para platicar</T>
            {story.ask.map((q, i) => <T key={i} style={{ fontSize: 19, lineHeight: 28 }}>{`${i + 1}. ${q}`}</T>)}
            <Row wrap style={{ marginTop: 8 }}>
              {saved || done ? null : <Btn kind="sun" onPress={save} disabled={isCG(S)}>Guardar cuento</Btn>}
              {cfg && !saved ? <Btn kind="ghost" onPress={() => { setSeed((x) => x + 1); setPage(0); }}>Otra versión</Btn> : null}
            </Row>
            <Btn kind="ghost" onPress={log}>Registrar en la bitácora</Btn>
            <Btn kind="ghost" onPress={closeFull}>Terminar</Btn>
          </View>
        ) : (
          <T style={{ fontSize: 24, lineHeight: 36, fontFamily: F.body }}>{p}</T>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: insets.bottom + 14, paddingTop: 8, alignItems: 'center' }}>
        <Btn kind="ghost" disabled={page === 0} onPress={() => setPage((x) => Math.max(0, x - 1))} style={{ flex: 1 }}>Anterior</Btn>
        <Btn kind={last ? 'ghost' : 'sun'} disabled={last} onPress={() => setPage((x) => Math.min(pages.length - 1, x + 1))} style={{ flex: 1 }}>Siguiente</Btn>
      </View>
    </View>
  );
}

export default function Cuentos() {
  const c = useTheme();
  const { S, update } = useStore();
  const { openFull, toast } = useUI();
  const cg = isCG(S);
  const kids = Object.keys(KIDS);
  const [theme, setTheme] = useState(THEMES[0].id);
  const [selKids, setSelKids] = useState([kidKey(S)]);
  const [selPeople, setSelPeople] = useState([]);
  const [imag, setImag] = useState(null);
  const th = THEMES.find((t) => t.id === theme);
  const saved = S.stories || [];
  const names = [...selKids.map((k) => KIDS[k] && KIDS[k].name), ...selPeople.map((k) => (MEMBERS.find((m) => m.key === k) || {}).name)].filter(Boolean);
  const create = () => {
    if (!names.length && imag == null) { toast('Elige al menos un personaje'); return; }
    openFull(<StoryScreen cfg={{ theme, names, kids: selKids, imag: imag == null ? null : IMAGINARY[imag], seed: Math.floor(Math.random() * 100000) + 1 }} />);
  };
  return (
    <>
      <T v="h2">Cuentos</T>
      <T v="small">Elige un tema y quiénes serán los personajes. Tribbu arma un cuento para leer en voz alta. Son cuentos armados con plantillas, no inventados por IA.</T>

      <Card>
        <T v="label">1. ¿De qué quieres el cuento?</T>
        <Row gap={6} wrap>{THEMES.map((t) => <Chip key={t.id} on={theme === t.id} onPress={() => setTheme(t.id)}>{t.name}</Chip>)}</Row>
        <T v="small">{`${th.blurb} Valor del cuento: ${th.value}.`}</T>
      </Card>

      <Card>
        <T v="label">2. ¿Quiénes son los personajes?</T>
        <T v="small">Puedes elegir varios.</T>
        <T v="bold">Niños</T>
        <Row gap={6} wrap>{kids.map((k) => <Chip key={k} on={selKids.includes(k)} onPress={() => setSelKids(toggle(selKids, k))}>{KIDS[k].name}</Chip>)}</Row>
        <T v="bold">Papás y cuidadores</T>
        <Row gap={6} wrap>{MEMBERS.map((m) => <Chip key={m.key} on={selPeople.includes(m.key)} onPress={() => setSelPeople(toggle(selPeople, m.key))}>{m.name}</Chip>)}</Row>
        <T v="bold">Personaje imaginario</T>
        <Row gap={6} wrap>
          <Chip on={imag == null} onPress={() => setImag(null)}>Ninguno</Chip>
          {IMAGINARY.map((x, i) => <Chip key={x.name} on={imag === i} onPress={() => setImag(i)}>{x.name}</Chip>)}
        </Row>
        {imag != null ? <T v="small">{`${IMAGINARY[imag].name} es ${IMAGINARY[imag].desc}.`}</T> : null}
        <T v="small" color={c.ink}>{names.length || imag != null ? `Personajes: ${joinNames([...names, ...(imag != null ? [IMAGINARY[imag].name] : [])])}.` : 'Aún no hay personajes.'}</T>
      </Card>

      <Btn kind="sun" onPress={create}>Crear cuento</Btn>

      <Card style={{ gap: 0 }}>
        <T v="h3" style={{ marginBottom: 4 }}>Cuentos guardados</T>
        {saved.length ? saved.map((s, i) => (
          <Between key={s.id} style={{ paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <Pressable onPress={() => openFull(<StoryScreen saved={s} />)} accessibilityRole="button" style={{ flex: 1 }}>
              <T v="bold">{s.title}</T>
              <T v="small">{`${s.themeName} · ${joinNames(s.heroes)}`}</T>
            </Pressable>
            {cg ? null : (
              <Pressable onPress={() => confirmAction('¿Eliminar este cuento?', `«${s.title}»`, 'Eliminar', () => { update((d) => { d.stories = (d.stories || []).filter((x) => x.id !== s.id); }); toast('Cuento eliminado'); })} accessibilityRole="button" accessibilityLabel={`Eliminar ${s.title}`} hitSlop={8}>
                <T v="small" color={c.inkSoft}>Eliminar</T>
              </Pressable>
            )}
          </Between>
        )) : <T v="small">Aquí aparecerán los cuentos que guardes para volver a leerlos.</T>}
      </Card>
    </>
  );
}
