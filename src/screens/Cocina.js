import React, { useState } from 'react';
import { Image, Linking, Pressable, View } from 'react-native';
import { AISLES, KIDS, MENU, aisleOf, allRecipes, dayOfYear, isCG, kidKey, menuOf, todayIdx, todayRecipe } from '../data';
import { NUTRI, NUTRI_MEALS, NUTRI_NOTE, NUTRI_SOURCES, NUTRI_TAGS, allergenHits } from '../nutri';
import { RecipeSheet, UploadRecipeSheet } from '../sheets';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Between, Btn, Card, Check, Chip, Field, Pill, Row, Seg, SheetHead, T, useUI } from '../ui';

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
    menuOf(S).forEach(([, id]) => {
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

// Hoja para elegir la receta de un día del menú.
function PickRecipeSheet({ idx }) {
  const { S, update } = useStore();
  const { closeSheet, toast } = useUI();
  const recs = allRecipes(S);
  const day = menuOf(S)[idx][0];
  const set = (id) => {
    update((d) => { d.menu = d.menu || JSON.parse(JSON.stringify(MENU)); d.menu[idx][1] = id; });
    closeSheet(); toast(id == null ? 'Menú actualizado' : 'Receta agregada al menú');
  };
  return (
    <>
      <SheetHead title={`Menú del ${day}`} />
      {recs.length ? recs.map((r) => <Btn key={r.id} kind="ghost" onPress={() => set(r.id)}>{r.t}</Btn>)
        : <T>Todavía no hay recetas. Agrega una en la pestaña Recetas y vuelve aquí a ponerla en el menú.</T>}
      {menuOf(S)[idx][1] != null ? <Btn kind="ghost" onPress={() => set(null)}>Quitar del menú</Btn> : null}
    </>
  );
}

function Menu() {
  const c = useTheme();
  const { S } = useStore();
  const { openSheet } = useUI();
  const gen = useMenuToShop();
  const recs = allRecipes(S);
  if (isCG(S)) {
    const k = KIDS[kidKey(S)];
    const r = todayRecipe(S);
    return (
      <>
        <T v="label">Hoy toca</T>
        {r ? <RecipeRow r={r} /> : <Card><T v="small">Hoy no hay una comida registrada en el menú.</T></Card>}
        <Card>
          <T v="h3">{`Merienda y cena de ${k.name}`}</T>
          {k.routine.filter((x) => /Merienda|Cena/.test(x[0])).map(([a, b]) => (
            <Row key={a}><T v="small" style={{ width: 90 }}>{a}</T><T v="bold" style={{ flex: 1 }}>{b}</T></Row>
          ))}
        </Card>
      </>
    );
  }
  const menu = menuOf(S);
  return (
    <>
      <Between>
        <T v="h2">Menú de la semana</T>
        <Btn sm kind="sun" onPress={gen}>Armar lista de compras</Btn>
      </Between>
      <Card style={{ gap: 0 }}>
        {menu.map(([d, id], i) => {
          const r = id != null ? recs.find((x) => x.id === id) : null;
          const today = i === todayIdx;
          return (
            <Pressable key={d} onPress={() => openSheet(<PickRecipeSheet idx={i} />)} accessibilityRole="button" accessibilityLabel={`Elegir receta del ${d}`}>
              <Row style={{ paddingVertical: 9, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
                <T v="bold" style={{ width: 44 }} color={today ? c.berry : c.ink}>{d}</T>
                <T style={{ flex: 1 }} color={r ? c.ink : c.inkSoft}>{r ? r.t : 'Toca para elegir una receta'}</T>
                {today ? <Pill tone="sun">Hoy</Pill> : null}
              </Row>
            </Pressable>
          );
        })}
      </Card>
      <T v="small">Toca un día para elegir la receta. El botón agrega a Compras los ingredientes de las recetas del menú, ordenados por pasillo.</T>
    </>
  );
}

function Shop() {
  const c = useTheme();
  const { S, update } = useStore();
  const gen = useMenuToShop();
  const { toast } = useUI();
  const [item, setItem] = useState('');
  const [aisle, setAisle] = useState(null);
  const groups = AISLES.map(([a]) => [a, S.shop.filter((x) => x.a === a)]).filter(([, l]) => l.length);
  const open = S.shop.filter((x) => !x.done).length;
  const add = () => {
    const t = item.trim();
    if (!t) return;
    update((d) => { d.shop.push({ id: Date.now(), t, a: aisle || aisleOf(t), done: false }); });
    setItem(''); toast(`«${t}» agregado a Compras`);
  };
  return (
    <>
      <Between><T v="h2">Lista de compras</T><T v="label">{`${open} por comprar`}</T></Between>
      <Row wrap>
        <Btn sm kind="sun" onPress={gen}>Agregar ingredientes del menú</Btn>
        <Btn sm kind="ghost" onPress={() => { const n = S.shop.filter((x) => x.done).length; update((d) => { d.shop = d.shop.filter((x) => !x.done); }); toast(n ? `Se quitaron ${n} artículos comprados` : 'No hay artículos marcados como comprados'); }}>Quitar comprados</Btn>
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

// ---------- Ideas nutritivas ----------
function SourceLink({ k }) {
  const c = useTheme();
  const src = NUTRI_SOURCES[k];
  return (
    <Pressable onPress={() => Linking.openURL(src.url).catch(() => {})} accessibilityRole="link" accessibilityLabel={`Abrir fuente: ${src.n}`}>
      <T v="small" color={c.sky} style={{ textDecorationLine: 'underline' }}>{src.n}</T>
    </Pressable>
  );
}

function NutriSheet({ id }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { closeSheet, toast } = useUI();
  const r = NUTRI.find((x) => x.id === id);
  const kid = KIDS[kidKey(S)];
  const hits = allergenHits(r, kid.allergy);
  const saved = S.myrecs.some((x) => x.fromNutri === id);
  const save = () => {
    update((d) => {
      d.myrecs.unshift({ id: Date.now(), t: r.t, by: 'Tribbu', age: r.age, alg: r.alg, min: r.min, ing: r.ing, steps: r.steps, why: r.why, safety: r.safety, fromNutri: id });
    });
    toast('Guardada en tus recetas');
  };
  return (
    <>
      <SheetHead label={`${r.meal} · desde ${r.age} · ${r.min} min`} title={r.t} />
      {hits.length ? (
        <Card bg={c.berryBg} border={c.berry}>
          <T v="bold" color={c.berry}>{`Ojo: contiene ${hits.join(', ')}`}</T>
          <T v="small" color={c.ink}>{`${kid.name} tiene registrada esta alergia: ${kid.allergy}.`}</T>
        </Card>
      ) : null}
      <Row gap={4} wrap>
        {r.tags.map((t) => <Pill key={t} tone="leaf">{t}</Pill>)}
        {r.alg.length ? r.alg.map((a) => <Pill key={a} tone="berry">{a}</Pill>) : <Pill tone="leaf">Sin alérgenos comunes</Pill>}
      </Row>
      <T v="label">Ingredientes</T>
      {r.ing.map((x, i) => <T key={i}>{`• ${x}`}</T>)}
      <T v="label">Pasos</T>
      {r.steps.map((x, i) => <T key={i}>{`${i + 1}. ${x}`}</T>)}
      <Card bg={c.leafBg} border={c.leafBg}><T v="label">Por qué es buena idea</T><T color={c.ink}>{r.why}</T></Card>
      <Card bg={c.amberBg} border={c.amberBg}><T v="label">Para comer con seguridad</T><T color={c.ink}>{r.safety}</T></Card>
      <T v="label">Se basa en las recomendaciones de</T>
      {r.src.map((k) => <SourceLink key={k} k={k} />)}
      <T v="small">Receta de Tribbu. No sustituye la guía de tu pediatra.</T>
      <Btn kind="sun" disabled={saved} onPress={save}>{saved ? 'Ya está en tus recetas' : 'Guardar en mis recetas'}</Btn>
      <Btn kind="ghost" onPress={() => {
        update((d) => { r.ing.forEach((x) => { if (!d.shop.some((y) => y.t === x)) d.shop.push({ id: Date.now() + Math.random(), t: x, a: aisleOf(x), done: false }); }); });
        closeSheet(); toast('Ingredientes agregados a Compras');
      }}>Agregar ingredientes a Compras</Btn>
    </>
  );
}

function NutriCard({ r, kid, saved }) {
  const c = useTheme();
  const { openSheet } = useUI();
  const hits = allergenHits(r, kid.allergy);
  return (
    <Pressable onPress={() => openSheet(<NutriSheet id={r.id} />)} accessibilityRole="button"
      style={{ borderWidth: 1, borderColor: hits.length ? c.berry : c.line, backgroundColor: c.paper, borderRadius: 18, padding: 12, gap: 4 }}>
      <T v="h3">{r.t}</T>
      <T v="small">{`${r.meal} · desde ${r.age} · ${r.min} min`}</T>
      <Row gap={4} wrap>
        {r.tags.map((t) => <Pill key={t} tone="leaf">{t}</Pill>)}
        {hits.length ? <Pill tone="berry">{`Contiene ${hits.join(', ')}`}</Pill> : null}
        {saved ? <Pill tone="sky">Guardada</Pill> : null}
      </Row>
    </Pressable>
  );
}

function Ideas() {
  const c = useTheme();
  const { S } = useStore();
  const kid = KIDS[kidKey(S)];
  const [meal, setMeal] = useState(null);
  const [tag, setTag] = useState(null);
  const [allAges, setAllAges] = useState(false);
  const [withAllergy, setWithAllergy] = useState(false);
  const saved = new Set(S.myrecs.filter((r) => r.fromNutri).map((r) => r.fromNutri));
  const byFilters = NUTRI.filter((r) => (allAges || r.ageMin <= kid.age) && (!meal || r.meal === meal) && (!tag || r.tags.includes(tag)));
  const safe = byFilters.filter((r) => !allergenHits(r, kid.allergy).length);
  const list = withAllergy ? byFilters : safe;
  const hidden = byFilters.length - safe.length;
  // Tres sugerencias que cambian cada semana.
  const eligible = NUTRI.filter((r) => r.ageMin <= kid.age && !allergenHits(r, kid.allergy).length);
  const wk = Math.floor(dayOfYear() / 7);
  const featured = eligible.length ? [0, 1, 2].map((i) => eligible[(wk * 3 + i) % eligible.length]).filter((r, i, a) => a.indexOf(r) === i) : [];
  const filtering = meal || tag;
  return (
    <>
      <T v="h2">Ideas nutritivas</T>
      <T v="small">{`Para cuando se acaben las ideas. Mostramos recetas para ${kid.name} (${kid.age} años) sin sus alergias.`}</T>
      <Card bg={c.leafBg} border={c.leafBg}><T v="small" color={c.ink}>{NUTRI_NOTE}</T></Card>
      <Row gap={6} wrap>
        <Chip on={!meal} onPress={() => setMeal(null)}>Todas las comidas</Chip>
        {NUTRI_MEALS.map((m) => <Chip key={m} on={meal === m} onPress={() => setMeal(meal === m ? null : m)}>{m}</Chip>)}
      </Row>
      <Row gap={6} wrap>
        <Chip on={!tag} onPress={() => setTag(null)}>Cualquier nutriente</Chip>
        {NUTRI_TAGS.map((t) => <Chip key={t} on={tag === t} onPress={() => setTag(tag === t ? null : t)}>{t}</Chip>)}
      </Row>
      <Row gap={6} wrap>
        <Chip on={allAges} onPress={() => setAllAges((v) => !v)}>Todas las edades</Chip>
        {hidden ? <Chip on={withAllergy} onPress={() => setWithAllergy((v) => !v)}>{`Mostrar ${hidden} con alérgenos de ${kid.name}`}</Chip> : null}
      </Row>
      {!filtering && featured.length ? (
        <>
          <T v="label">Para esta semana</T>
          {featured.map((r) => <NutriCard key={`f${r.id}`} r={r} kid={kid} saved={saved.has(r.id)} />)}
        </>
      ) : null}
      <T v="label">{`${list.length} receta${list.length === 1 ? '' : 's'}`}</T>
      {list.length ? list.map((r) => <NutriCard key={r.id} r={r} kid={kid} saved={saved.has(r.id)} />) : <T v="small">No hay recetas con esos filtros. Prueba con «Todas las edades» o quita un filtro.</T>}
      <Card>
        <T v="label">Fuentes de las recomendaciones</T>
        {Object.keys(NUTRI_SOURCES).map((k) => <SourceLink key={k} k={k} />)}
      </Card>
    </>
  );
}

export default function Cocina() {
  const c = useTheme();
  const { S, update } = useStore();
  const k = KIDS[kidKey(S)];
  const tabs = isCG(S) ? [['menu', 'Menú de hoy'], ['rec', 'Recetas']] : [['menu', 'Menú'], ['shop', 'Compras'], ['rec', 'Recetas'], ['idea', 'Ideas']];
  const tab = tabs.find((t) => t[0] === S.ctab) ? S.ctab : 'menu';
  return (
    <>
      <Seg full options={tabs} value={tab} onChange={(v) => update((d) => { d.ctab = v; })} />
      <Card bg={c.berryBg} border={c.berryBg} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pill tone="berry">Alergia</Pill>
        <T style={{ flex: 1 }}>{`${k.name}: ${k.allergy}. Todos los cuidadores la ven.`}</T>
      </Card>
      {tab === 'menu' ? <Menu /> : tab === 'shop' ? <Shop /> : tab === 'idea' ? <Ideas /> : <Recipes />}
    </>
  );
}
