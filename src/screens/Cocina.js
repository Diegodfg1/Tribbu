import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { AISLES, KIDS, MENU, aisleOf, allRecipes, isCG, kidKey, todayIdx } from '../data';
import { RecipeSheet, UploadRecipeSheet } from '../sheets';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Between, Btn, Card, Check, Field, Pill, Row, Seg, T, useUI } from '../ui';

function RecipeRow({ r }) {
  const c = useTheme();
  const { openSheet } = useUI();
  return (
    <Pressable onPress={() => openSheet(<RecipeSheet id={r.id} />)} accessibilityRole="button"
      style={{ flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.paper, borderRadius: 18, padding: 12 }}>
      <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: c.amberBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {r.img
          ? <Image source={{ uri: r.img }} style={{ width: 64, height: 64 }} accessibilityIgnoresInvertColors />
          : <T v="h2">{r.t[0]}</T>}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <T v="h3">{r.t}</T>
        <T v="small">{`De ${r.by} · ${r.min} min · desde ${r.age}`}</T>
        <Row gap={4} wrap>
          {r.alg.length ? r.alg.map((a) => <Pill key={a} tone="berry">{a}</Pill>) : <Pill tone="leaf">Sin alérgenos comunes</Pill>}
          {r.src ? <Pill tone="sky">Importada</Pill> : null}
        </Row>
      </View>
    </Pressable>
  );
}

// Agrega al carrito los ingredientes de las recetas del menú que aún no estén en la lista.
function useMenuToShop() {
  const { S, update } = useStore();
  const { toast } = useUI();
  return () => {
    const recs = allRecipes(S);
    const have = new Set(S.shop.map((x) => x.t.toLowerCase()));
    const fresh = [];
    MENU.forEach(([, id]) => {
      const r = recs.find((x) => x.id === id);
      if (!r) return;
      r.ing.forEach((i) => {
        if (!have.has(i.toLowerCase())) { have.add(i.toLowerCase()); fresh.push(i); }
      });
    });
    update((d) => {
      fresh.forEach((t, n) => d.shop.push({ id: Date.now() + n, t, a: aisleOf(t), done: false }));
      d.ctab = 'shop';
    });
    toast(fresh.length ? `Agregamos ${fresh.length} ingredientes del menú` : 'Ya tenías todo en la lista');
  };
}

function Menu() {
  const c = useTheme();
  const { S } = useStore();
  const gen = useMenuToShop();
  const recs = allRecipes(S);
  if (isCG(S)) {
    const k = KIDS[kidKey(S)];
    const m = MENU[todayIdx] || MENU[0];
    const r = recs.find((x) => x.id === m[1]);
    return (
      <>
        <T v="label">Hoy toca</T>
        {r ? <RecipeRow r={r} /> : null}
        <Card>
          <T v="h3">{`Merienda y cena de ${k.name}`}</T>
          {k.routine.filter((x) => /Merienda|Cena/.test(x[0])).map(([a, b]) => (
            <Row key={a}><T v="small" style={{ width: 90 }}>{a}</T><T v="bold" style={{ flex: 1 }}>{b}</T></Row>
          ))}
        </Card>
      </>
    );
  }
  return (
    <>
      <Between>
        <T v="h2">Menú de la semana</T>
        <Btn sm kind="sun" onPress={gen}>Armar lista de compras</Btn>
      </Between>
      <Card style={{ gap: 0 }}>
        {MENU.map(([d, id], i) => {
          const r = recs.find((x) => x.id === id);
          const today = i === todayIdx;
          return (
            <Row key={d} style={{ paddingVertical: 9, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <T v="bold" style={{ width: 44 }} color={today ? c.berry : c.ink}>{d}</T>
              <T style={{ flex: 1 }}>{r ? r.t : ''}</T>
              {today ? <Pill tone="sun">Hoy</Pill> : null}
            </Row>
          );
        })}
      </Card>
      <T v="small">El botón agrega a Compras los ingredientes de las recetas del menú, ordenados por pasillo.</T>
    </>
  );
}

function Shop() {
  const c = useTheme();
  const { S, update } = useStore();
  const gen = useMenuToShop();
  const [item, setItem] = useState('');
  const [aisle, setAisle] = useState(null);
  const groups = AISLES.map(([a]) => [a, S.shop.filter((x) => x.a === a)]).filter(([, l]) => l.length);
  const open = S.shop.filter((x) => !x.done).length;
  const add = () => {
    const t = item.trim();
    if (!t) return;
    update((d) => { d.shop.push({ id: Date.now(), t, a: aisle || aisleOf(t), done: false }); });
    setItem('');
  };
  return (
    <>
      <Between><T v="h2">Lista de compras</T><T v="label">{`${open} por comprar`}</T></Between>
      <Row wrap>
        <Btn sm kind="sun" onPress={gen}>Agregar ingredientes del menú</Btn>
        <Btn sm kind="ghost" onPress={() => update((d) => { d.shop = d.shop.filter((x) => !x.done); })}>Quitar comprados</Btn>
      </Row>
      {groups.length ? groups.map(([a, list]) => (
        <Card key={a}>
          <T v="label">{a}</T>
          {list.map((x) => (
            <Check key={x.id} on={x.done} label={x.t} onPress={() => update((d) => { const y = d.shop.find((z) => z.id === x.id); y.done = !y.done; })}>
              <T style={x.done ? { textDecorationLine: 'line-through', color: c.inkSoft } : null}>{x.t}</T>
            </Check>
          ))}
        </Card>
      )) : <T v="small">La lista está vacía.</T>}
      <Card>
        <Field placeholder="Agregar artículo" value={item} onChangeText={setItem} onSubmitEditing={add} returnKeyType="done" />
        <Row gap={6} wrap>
          {AISLES.map(([a]) => (
            <Btn key={a} sm kind={aisle === a ? 'ink' : 'ghost'} onPress={() => setAisle(aisle === a ? null : a)}>{a}</Btn>
          ))}
        </Row>
        <T v="small">Si no eliges pasillo, Tribbu lo acomoda solo.</T>
        <Btn sm style={{ alignSelf: 'flex-start' }} onPress={add}>Agregar</Btn>
      </Card>
    </>
  );
}

function Recipes() {
  const { S, update } = useStore();
  const { openSheet, toast } = useUI();
  const [url, setUrl] = useState('');
  const caregiver = isCG(S);
  const importUrl = () => {
    const u = url.trim();
    if (!/^https?:\/\/\S+/i.test(u)) { toast('Escribe un enlace que empiece con https://'); return; }
    let host = 'la web';
    try { host = new URL(u).hostname.replace(/^www\./, ''); } catch (e) { /* se queda con "la web" */ }
    update((d) => {
      d.myrecs.unshift({
        id: Date.now(), t: `Receta importada de ${host}`, by: 'Tú', min: 30, age: '1+', alg: [], src: u,
        ing: ['En la app real, los ingredientes se leen del sitio'],
        steps: ['En la app real, los pasos se leen del sitio. Aquí puedes revisarlos y corregirlos antes de guardar.'],
      });
    });
    setUrl('');
    toast('Borrador creado. Revísalo antes de compartirlo');
  };
  return (
    <>
      <Between>
        <T v="h2">Recetas de la familia</T>
        {caregiver ? null : <Btn sm kind="sun" onPress={() => openSheet(<UploadRecipeSheet />)}>Subir receta</Btn>}
      </Between>
      {caregiver ? null : (
        <Card>
          <T v="label">Importar desde una página web</T>
          <Row>
            <Field style={{ flex: 1 }} placeholder="https://… enlace de la receta" value={url} onChangeText={setUrl}
              autoCapitalize="none" autoCorrect={false} keyboardType="url" onSubmitEditing={importUrl} />
            <Btn sm onPress={importUrl}>Importar</Btn>
          </Row>
        </Card>
      )}
      {allRecipes(S).map((r) => <RecipeRow key={r.id} r={r} />)}
    </>
  );
}

export default function Cocina() {
  const c = useTheme();
  const { S, update } = useStore();
  const k = KIDS[kidKey(S)];
  const tabs = isCG(S) ? [['menu', 'Menú de hoy'], ['rec', 'Recetas']] : [['menu', 'Menú'], ['shop', 'Compras'], ['rec', 'Recetas']];
  const tab = tabs.find((t) => t[0] === S.ctab) ? S.ctab : 'menu';
  return (
    <>
      <Seg full options={tabs} value={tab} onChange={(v) => update((d) => { d.ctab = v; })} />
      <Card bg={c.berryBg} border={c.berryBg} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pill tone="berry">Alergia</Pill>
        <T style={{ flex: 1 }}>{`${k.name}: ${k.allergy}. Todos los cuidadores la ven.`}</T>
      </Card>
      {tab === 'menu' ? <Menu /> : tab === 'shop' ? <Shop /> : <Recipes />}
    </>
  );
}
