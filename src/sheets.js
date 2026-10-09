// Hojas y pantallas completas que se abren sobre las pestañas.
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, Vibration, Image, Text } from 'react-native';
import Svg, { Circle, Ellipse, Line, Rect, Text as SvgText } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ACTS, KIDS, MEMBERS, SKILLS, SRC, actById, addD, aisleOf, allRecipes, dateLong, dayEvents, dayShort, dk, evKey, fromKey,
  evKids, evPeople, inShift, isBlank, isCG, isCloud, isNewAct, kidKey, matsOf, me, mkFeed, nameOf, now, tasksSorted, today, todayKey, todayRecipe, whoText,
} from './data';
import { DateField, TimeField } from './pickers';
import { EventEditor } from './editors';
import { FavButton } from './parts';
import { DEMOS } from './scenes';
import { useStore } from './store';
import { F, useTheme } from './theme';
import { askTribbu } from './ai';
import { Avatar, Between, Btn, Card, Chip, Field, Pill, Row, SheetHead, T, confirmAction, useUI } from './ui';

// ---------- Actividad ----------
export function ActivitySheet({ id }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { openSheet, openFull } = useUI();
  const a = actById(S, id);
  const MATS = matsOf(S);
  const { toast, closeSheet } = useUI();
  const miss = a.mats.filter((m) => !S.have.includes(m));
  return (
    <>
      <SheetHead label={`${SKILLS[a.sk][0]} · ${a.energy}`} title={a.t} />
      <Row gap={8}>
        {isNewAct(a, S) ? <Pill tone="sun">Nueva este mes</Pill> : null}
        {a.mine ? <Pill tone="sky">Tuya</Pill> : null}
        <FavButton id={a.id} size={26} />
      </Row>
      {a.mats.length ? <Row gap={6} wrap>{a.mats.map((m) => <Pill key={m} tone={S.have.includes(m) ? 'leaf' : 'berry'}>{MATS[m]}</Pill>)}</Row> : <T v="small">No necesitas materiales.</T>}
      <T v="small">{`${a.why} · ${a.age[0]} a ${a.age[1]} años · ${a.min} min`}</T>
      <View style={{ gap: 6 }}>{a.steps.map((s, i) => <T key={i}>{`${i + 1}. ${s}`}</T>)}</View>
      {miss.length ? <T v="small" color={c.berry}>{`Falta ${miss.map((m) => MATS[m]).join(', ')}. Pídele a Tribbu una alternativa.`}</T> : null}
      {DEMOS[a.id] ? <Btn kind="ghost" onPress={() => openSheet(<DemoSheet id={a.id} />)}>{`▶  Ver cómo se juega · ${DEMOS[a.id].length} pasos animados`}</Btn> : null}
      <Row>
        <Btn kind="sun" style={{ flex: 1 }} onPress={() => openFull(<TimerScreen id={a.id} />)}>Empezar y guardar el teléfono</Btn>
        {miss.length ? <Btn kind="ghost" onPress={() => openSheet(<ChatSheet pre={`Quiero hacer "${a.t}" pero no tengo ${miss.map((m) => MATS[m]).join(', ')}. ¿Con qué lo sustituyo o qué actividad parecida hago?`} />)}>Alternativa</Btn> : null}
      </Row>
      {a.mine && !isCG(S) ? (
        <Btn kind="ghost" onPress={() => confirmAction('¿Eliminar esta actividad?', `«${a.t}»`, 'Eliminar', () => {
          update((d) => { d.myacts = (d.myacts || []).filter((x) => x.id !== a.id); d.favs = (d.favs || []).filter((x) => x !== a.id); });
          closeSheet(); toast('Actividad eliminada');
        })}>Eliminar mi actividad</Btn>
      ) : null}
    </>
  );
}

// ---------- Ver cómo se juega ----------
export function DemoSheet({ id }) {
  const c = useTheme();
  const { openFull } = useUI();
  const a = ACTS.find((x) => x.id === id);
  const steps = DEMOS[id];
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!auto || i >= steps.length - 1) return undefined;
    const t = setTimeout(() => setI((x) => x + 1), 4200);
    return () => clearTimeout(t);
  }, [i, auto]);
  const go = (n) => { setAuto(false); setI(n); };
  const s = steps[i];
  const last = i === steps.length - 1;
  return (
    <>
      <SheetHead label="Ver cómo se juega" title={a.t} />
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ backgroundColor: c.paper2, borderWidth: 1, borderColor: c.line, borderRadius: 20, overflow: 'hidden' }}>
        {w ? <Svg width={w} height={(w * 200) / 320} viewBox="0 0 320 200" accessibilityLabel={s.h}><s.C key={i} c={c} /></Svg> : <View style={{ aspectRatio: 1.6 }} />}
      </View>
      <Row style={{ alignItems: 'flex-start', minHeight: 52 }}>
        <Avatar letter={String(i + 1)} bg={c.sun} fg={c.sunInk} size={30} />
        <View style={{ flex: 1 }}><T v="h3">{s.h}</T><T v="small">{s.p}</T></View>
      </Row>
      <Row gap={6} style={{ justifyContent: 'center' }}>
        {steps.map((_, k) => (
          <Pressable key={k} onPress={() => go(k)} accessibilityLabel={`Paso ${k + 1}`} hitSlop={8}
            style={{ width: 26, height: 6, borderRadius: 9, backgroundColor: k === i ? c.ink : c.line }} />
        ))}
      </Row>
      <Row>
        <Btn kind="ghost" disabled={i === 0} onPress={() => go(i - 1)}>Anterior</Btn>
        <Btn kind={last ? 'sun' : 'ink'} style={{ flex: 1 }} onPress={() => (last ? openFull(<TimerScreen id={id} />) : go(i + 1))}>
          {last ? 'Empezar y guardar el teléfono' : 'Siguiente'}
        </Btn>
      </Row>
    </>
  );
}

// ---------- Modo sin pantalla ----------
export function TimerScreen({ id }) {
  const c = useTheme();
  const { update, S } = useStore();
  const { closeFull, toast } = useUI();
  const a = actById(S, id);
  const total = a.min * 60;
  const [left, setLeft] = useState(total);
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    update((d) => { d.feed.unshift(mkFeed(S, { kind: 'Actividad', txt: `Jugamos «${a.t}».` })); });
    closeFull();
    toast('Actividad guardada en la bitácora');
  };
  useEffect(() => {
    const t = setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left <= 0) { Vibration.vibrate([0, 400, 200, 400]); finish(); }
  }, [left]);
  const L = 553;
  const mm = Math.max(0, Math.floor(left / 60));
  const ss = String(Math.max(0, left % 60)).padStart(2, '0');
  return (
    <View style={{ flex: 1, backgroundColor: c.dark ? c.paper : c.ink, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <T v="label" color={c.sun}>Modo sin pantalla</T>
      <T v="h2" color={c.dark ? c.ink : c.paper} style={{ textAlign: 'center' }}>{a.t}</T>
      <Svg width={200} height={200} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
        <Circle cx="100" cy="100" r="88" fill="none" stroke={c.sun} strokeWidth="12" strokeLinecap="round" strokeDasharray={[L, L]} strokeDashoffset={L * (1 - left / total)} transform="rotate(-90 100 100)" />
        <SvgText x="100" y="114" textAnchor="middle" fill={c.dark ? c.ink : c.paper} fontSize="46" fontFamily={F.display}>{`${mm}:${ss}`}</SvgText>
      </Svg>
      <T color={c.dark ? c.inkSoft : c.paper} style={{ textAlign: 'center', maxWidth: 260, opacity: 0.85 }}>Deja el teléfono boca abajo. Vibrará cuando termine el tiempo.</T>
      <Btn kind="ghost" onPress={finish}><Text style={{ fontFamily: F.bold, color: c.dark ? c.ink : c.paper }}>Terminar</Text></Btn>
    </View>
  );
}

// ---------- Registro rápido ----------
const LOG_OPTS = {
  'Comió': ['Comió todo', 'Comió la mitad', 'Casi no comió'],
  'Siesta': ['Durmió 30 min', 'Durmió 1 hora', 'No quiso dormir'],
  'Baño': ['Baño listo', 'Cambio de pañal', 'Fue solo al baño'],
  'Ánimo': ['Contento', 'Cansado', 'Irritable', 'Triste'],
  'Medicina': ['Medicamento indicado por el pediatra', 'Jarabe para la tos', 'Otra (ver nota)'],
  'Golpe': ['Golpe leve, sin marca', 'Golpe con chichón', 'Raspón'],
};
// Los seis botones de registro rápido. day: fecha a la que se registra (por defecto, hoy).
export function QuickLog({ day }) {
  const c = useTheme();
  const { S } = useStore();
  const { openSheet } = useUI();
  const items = [['Comió', 'C', c.leafBg], ['Siesta', 'Z', c.skyBg], ['Baño', 'B', c.amberBg], ['Ánimo', 'A', c.sun], ['Medicina', 'M', c.berryBg], ['Golpe', '!', c.berryBg]];
  return (
    <>
      <T v="label">{`Registro rápido de ${KIDS[kidKey(S)].name}`}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map(([n, i, bg]) => (
          <Pressable key={n} onPress={() => openSheet(<LogSheet kind={n} day={day} />)} accessibilityRole="button"
            style={{ width: '31.5%', borderWidth: 1.5, borderColor: c.line, backgroundColor: c.paper, borderRadius: 16, paddingVertical: 10, alignItems: 'center', gap: 4 }}>
            <Avatar letter={i} bg={bg} fg={c.ink} size={30} />
            <T v="bold" style={{ fontSize: 12.5 }}>{n}</T>
          </Pressable>
        ))}
      </View>
    </>
  );
}

// Registro con fecha y hora de cuándo ocurrió (no solo de cuándo se anota).
export function LogSheet({ kind, day }) {
  const { S, update } = useStore();
  const { closeSheet, toast } = useUI();
  const opts = LOG_OPTS[kind];
  const [sel, setSel] = useState(opts[0]);
  const [note, setNote] = useState('');
  const [d, setD] = useState(day || todayKey());
  const [t, setT] = useState(now());
  const save = () => {
    update((x) => { x.feed.unshift(mkFeed(S, { kind, d, t, txt: sel + (note.trim() ? `. ${note.trim()}` : ''), lvl: kind === 'Golpe' || kind === 'Medicina' ? 'atencion' : 'info' })); });
    closeSheet();
    const when = d === todayKey() ? `a las ${t}` : `el ${dateLong(fromKey(d))} a las ${t}`;
    toast(`${kind} registrado ${when}`);
  };
  return (
    <>
      <SheetHead title={`${kind} · ${KIDS[kidKey(S)].name}`} />
      <Row gap={6} wrap>{opts.map((o) => <Chip key={o} on={o === sel} onPress={() => setSel(o)}>{o}</Chip>)}</Row>
      <Field placeholder="Nota opcional" value={note} onChangeText={setNote} />
      <T v="label">¿Cuándo ocurrió?</T>
      <DateField value={d} onChange={setD} />
      <Row style={{ alignItems: 'flex-end' }}>
        <TimeField value={t} onChange={setT} />
        <Btn sm kind="ghost" onPress={() => { setD(todayKey()); setT(now()); }}>Ahora</Btn>
      </Row>
      <Btn onPress={save}>Guardar registro</Btn>
    </>
  );
}

// ---------- Evento con conversación ----------
export function EventSheet({ k }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { openFull, closeSheet, toast } = useUI();
  const [msg, setMsg] = useState('');
  const d = k.split('|')[0];
  const e = dayEvents(S, d).fam.find((x) => evKey(x) === k);
  if (!e) return <SheetHead title="Evento no encontrado" />;
  const ms = S.evchat[k] || [];
  const send = () => {
    const v = msg.trim();
    if (!v) return;
    update((dd) => { (dd.evchat[k] = dd.evchat[k] || []).push({ who: me(S), txt: v, t: now() }); });
    setMsg(''); toast('Mensaje enviado');
  };
  const remove = () => confirmAction('¿Eliminar este evento?', `«${e.t}» y su conversación se borran para todos.`, 'Eliminar', () => {
    update((dd) => {
      dd.myevents = dd.myevents.filter((x) => evKey(x) !== k);
      if (e.base) dd.delev = [...(dd.delev || []), k];
      delete dd.evchat[k];
    });
    closeSheet(); toast('Evento eliminado');
  });
  return (
    <>
      <SheetHead label={`${e.tag} · ${whoText(evKids(e), evPeople(e))}`} title={e.t} sub={`${dateLong(fromKey(d))} · ${e.time} a ${e.end}`} />
      <T v="label">Conversación del evento</T>
      {ms.length ? ms.map((m, i) => {
        const mine = m.who === me(S);
        return (
          <View key={i} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '90%', backgroundColor: mine ? c.skyBg : c.paper2, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 8 }}>
            <T v="small" style={{ fontFamily: F.bold, color: c.ink }}>{`${nameOf(m.who)} · ${m.t}`}</T>
            <T>{m.txt}</T>
          </View>
        );
      }) : <T v="small">Aún no hay mensajes. Coordinen aquí quién lleva qué.</T>}
      <Row>
        <Field style={{ flex: 1 }} placeholder="Escribe sobre este evento" value={msg} onChangeText={setMsg} onSubmitEditing={send} returnKeyType="send" />
        <Btn kind="sun" onPress={send}>Enviar</Btn>
      </Row>
      {isCG(S) ? null : (
        <Row>
          <Btn kind="ghost" style={{ flex: 1 }} onPress={() => openFull(<EventEditor k={k} />)}>Editar evento</Btn>
          <Btn kind="ghost" style={{ flex: 1 }} onPress={remove}>Eliminar</Btn>
        </Row>
      )}
    </>
  );
}

// ---------- Calendarios ----------
function ExtEventForm() {
  const { S, update } = useStore();
  const { toast } = useUI();
  const linked = ['google', 'outlook', 'icloud'].filter((k) => S.cal[k] && S.cal[k].on);
  const [f, setF] = useState({ src: linked[0] || 'google', t: '', d: dk(today), time: '09:00', end: '10:00' });
  const days = [0, 1, 2, 3, 4, 5, 6].map((n) => addD(n));
  if (!linked.length) return <T v="small">Conecta una cuenta arriba para poder agregarle eventos de prueba.</T>;
  const src = linked.includes(f.src) ? f.src : linked[0];
  const add = () => {
    if (!f.t.trim() || !/^\d{1,2}:\d{2}$/.test(f.time) || !/^\d{1,2}:\d{2}$/.test(f.end)) { toast('Escribe un título y las horas como 09:00'); return; }
    update((d) => { d.extevents.push({ src, d: f.d, time: f.time.padStart(5, '0'), end: f.end.padStart(5, '0'), t: f.t.trim() }); });
    setF((x) => ({ ...x, t: '' })); toast('Evento de prueba agregado. Míralo en Agenda');
  };
  return (
    <>
      <T v="label">Agregar evento a una cuenta conectada (simulación)</T>
      <Row gap={6} wrap>{linked.map((k) => <Chip key={k} on={src === k} onPress={() => setF((x) => ({ ...x, src: k }))}>{SRC[k].n}</Chip>)}</Row>
      <Field placeholder="Título, p. ej. Junta de trabajo" value={f.t} onChangeText={(t) => setF((x) => ({ ...x, t }))} />
      <Row gap={6} wrap>{days.map((d) => <Chip key={dk(d)} on={f.d === dk(d)} onPress={() => setF((x) => ({ ...x, d: dk(d) }))}>{`${dayShort(d)} ${d.getDate()}`}</Chip>)}</Row>
      <Row>
        <Field style={{ flex: 1 }} placeholder="09:00" value={f.time} onChangeText={(time) => setF((x) => ({ ...x, time }))} keyboardType="numbers-and-punctuation" />
        <T>a</T>
        <Field style={{ flex: 1 }} placeholder="10:00" value={f.end} onChangeText={(end) => setF((x) => ({ ...x, end }))} keyboardType="numbers-and-punctuation" />
      </Row>
      <Btn sm style={{ alignSelf: 'flex-start' }} onPress={add}>Agregar evento</Btn>
      <T v="small">Si cae a la misma hora que un evento familiar, la Agenda avisa del choque y permite pedir apoyo a un cuidador.</T>
    </>
  );
}

export function CalendarsSheet() {
  const c = useTheme();
  const { S, update } = useStore();
  const { toast } = useUI();
  const link = 'webcal://tribbu.app/f/garcia-ejemplo.ics';
  return (
    <>
      <SheetHead label="Agenda" title="Calendarios" />
      <Card bg={c.amberBg} border={c.amberBg} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar letter="T" bg={c.sun} fg={c.sunInk} />
        <View style={{ flex: 1 }}><T v="bold">Tribbu familiar</T><T v="small" color={c.ink}>Calendario propio de la familia. Cada cuidador solo ve lo de su turno.</T></View>
      </Card>
      {isCloud(S) ? (
        <T v="small">Pronto podrás vincular tu calendario de Google, Outlook o iCloud (solo lectura). Por ahora los eventos se agregan en Tribbu y cada cuidador ve únicamente los de su turno.</T>
      ) : (
        <>
          <T v="label">Vincular otras cuentas (opcional)</T>
          {['google', 'outlook', 'icloud'].map((k, idx) => {
            const s = S.cal[k];
            return (
              <View key={k} style={{ gap: 8, paddingTop: idx ? 10 : 0, borderTopWidth: idx ? 1 : 0, borderTopColor: c.line }}>
                <Between>
                  <Row style={{ flex: 1 }}>
                    <Avatar letter={SRC[k].l} bg={c[SRC[k].color]} fg={c.paper} />
                    <View style={{ flex: 1 }}><T v="bold">{SRC[k].n}</T><T v="small">{s.on ? 'Conectado · solo lectura' : 'No conectado'}</T></View>
                  </Row>
                  <Btn sm kind={s.on ? 'ghost' : 'ink'} onPress={() => { update((d) => { d.cal[k].on = !d.cal[k].on; }); toast(s.on ? 'Cuenta desconectada' : `${SRC[k].n} conectado`); }}>{s.on ? 'Desconectar' : 'Conectar'}</Btn>
                </Between>
                {s.on ? (
                  <Between>
                    <T v="small">El otro papá ve</T>
                    <Row gap={6}>
                      <Chip on={s.mode === 'ocupado'} onPress={() => update((d) => { d.cal[k].mode = 'ocupado'; })}>Solo «Ocupado»</Chip>
                      <Chip on={s.mode === 'detalle'} onPress={() => update((d) => { d.cal[k].mode = 'detalle'; })}>Con detalles</Chip>
                    </Row>
                  </Between>
                ) : null}
              </View>
            );
          })}
          {isBlank(S) ? <ExtEventForm /> : null}
      <T v="small">Los cuidadores nunca ven tus calendarios vinculados. En la fase 2 se leen los calendarios reales de tu teléfono.</T>
          <T v="label">Llevar Tribbu a tu calendario</T>
          <T>Suscríbete desde Google, Outlook o Apple y los eventos familiares aparecerán ahí, sin compartir tu calendario de trabajo.</T>
          <View style={{ backgroundColor: c.paper2, borderWidth: 1, borderStyle: 'dashed', borderColor: c.line, borderRadius: 10, padding: 10 }}>
            <T v="small" color={c.ink} selectable>{link}</T>
          </View>
          <Row><Btn sm onPress={async () => { await Clipboard.setStringAsync(link); toast('Enlace copiado'); }}>Copiar enlace</Btn><T v="small">Enlace de ejemplo</T></Row>
        </>
      )}
    </>
  );
}

// ---------- Recetas ----------
export function RecipeSheet({ id }) {
  const c = useTheme();
  const { S, update } = useStore();
  const { closeSheet, toast } = useUI();
  const r = allRecipes(S).find((x) => x.id === id);
  if (!r) return <SheetHead title="Receta no encontrada" />;
  return (
    <>
      <SheetHead label={`Receta de ${r.by}`} title={r.t} />
      {r.img ? <Image source={{ uri: r.img }} style={{ width: '100%', height: 200, borderRadius: 16 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
      {r.src ? <T v="small">{`Fuente: ${r.src}`}</T> : null}
      <T v="label">Ingredientes</T>
      {r.ing.map((x, i) => <T key={i}>{`• ${x}`}</T>)}
      <T v="label">Pasos</T>
      {r.steps.map((x, i) => <T key={i}>{`${i + 1}. ${x}`}</T>)}
      {r.safety ? <Card bg={c.amberBg} border={c.amberBg}><T v="label">Para comer con seguridad</T><T color={c.ink}>{r.safety}</T></Card> : null}
      {!isCG(S) ? (
        <Btn kind="ghost" onPress={() => {
          update((d) => { r.ing.forEach((x) => { if (!d.shop.some((y) => y.t === x)) d.shop.push({ id: Date.now() + Math.random(), t: x, a: aisleOf(x), done: false }); }); });
          closeSheet(); toast('Ingredientes agregados a Compras');
        }}>Agregar ingredientes a Compras</Btn>
      ) : null}
    </>
  );
}

export function UploadRecipeSheet() {
  const c = useTheme();
  const { S, update } = useStore();
  const { closeSheet, toast } = useUI();
  const [f, setF] = useState({ t: '', min: '20', age: '1+', ing: '', steps: '', alg: '', img: null });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [4, 3] });
    if (!res.canceled && res.assets && res.assets[0]) set('img')(res.assets[0].uri);
  };
  const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
  const save = () => {
    if (!f.t.trim() || !lines(f.ing).length || !lines(f.steps).length) { toast('Falta el nombre, los ingredientes o los pasos'); return; }
    update((d) => { d.myrecs.unshift({ id: Date.now(), t: f.t.trim(), by: 'Tú', min: Number(f.min) || 20, age: f.age || '1+', alg: f.alg.split(',').map((x) => x.trim()).filter(Boolean), ing: lines(f.ing), steps: lines(f.steps), img: f.img }); });
    closeSheet(); toast('Receta publicada');
  };
  return (
    <>
      <SheetHead title="Subir receta" />
      <Field placeholder="Nombre de la receta" value={f.t} onChangeText={set('t')} />
      <Row><Field style={{ flex: 1 }} placeholder="Minutos" keyboardType="number-pad" value={f.min} onChangeText={set('min')} /><Field style={{ flex: 1 }} placeholder="Desde edad, p. ej. 2+" value={f.age} onChangeText={set('age')} /></Row>
      <Field multiline placeholder="Ingredientes, uno por línea" value={f.ing} onChangeText={set('ing')} />
      <Field multiline placeholder="Pasos, uno por línea" value={f.steps} onChangeText={set('steps')} />
      <Field placeholder="Alérgenos separados por coma (opcional)" value={f.alg} onChangeText={set('alg')} />
      {isCloud(S) ? <T v="small">Las fotos de recetas se sincronizarán en una versión posterior.</T> : (
        <Row>
          <Btn kind="ghost" sm onPress={pick}>{f.img ? 'Cambiar foto' : 'Agregar foto'}</Btn>
          {f.img ? <Image source={{ uri: f.img }} style={{ width: 48, height: 48, borderRadius: 10 }} /> : null}
        </Row>
      )}
      <Btn kind="sun" onPress={save}>Publicar en la familia</Btn>
    </>
  );
}

// ---------- Cámara en vivo (simulación) ----------
export function LiveCamSheet({ cam }) {
  const c = useTheme();
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const [w, setW] = useState(0);
  const hh = time.toTimeString().slice(0, 8);
  return (
    <>
      <SheetHead label={cam.type} title={cam.n} />
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: c.night }}>
        {w ? (
          <Svg width={w} height={(w * 200) / 320} viewBox="0 0 320 200">
            <Rect width="320" height="200" fill={c.night} />
            <Circle cx="270" cy="40" r="14" fill="#F5C04A" opacity="0.5" />
            <Rect x="60" y="80" width="200" height="90" rx="10" fill="none" stroke="#7FA3F2" strokeWidth="3" opacity="0.7" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Line key={i} x1={80 + i * 20} y1="80" x2={80 + i * 20} y2="170" stroke="#7FA3F2" strokeWidth="2" opacity="0.5" />)}
            <Ellipse cx="150" cy="150" rx="46" ry="14" fill="#3A4A7A" />
            <Circle cx="118" cy="146" r="10" fill="#C9B79C" opacity="0.8" />
            <Rect x="10" y="10" width="138" height="20" rx="10" fill="rgba(0,0,0,0.55)" />
            <Circle cx="22" cy="20" r="4" fill="#FF4D6D" />
            <SvgText x="32" y="24" fill="#FFFFFF" fontSize="11" fontFamily={F.bold}>EN VIVO · simulación</SvgText>
            <SvgText x="310" y="192" textAnchor="end" fill="#FFFFFF" fontSize="11" fontFamily={F.body}>{hh}</SvgText>
          </Svg>
        ) : <View style={{ aspectRatio: 1.6 }} />}
      </View>
      <T v="small">En la versión final el video llega directo de la cámara (Google Home, HomeKit o Matter) y no pasa por servidores de Tribbu. Solo los papás pueden abrirlo.</T>
    </>
  );
}

// ---------- Asistente ----------
export function ChatSheet({ pre }) {
  const c = useTheme();
  const { S } = useStore();
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const k = KIDS[kidKey(S)];
  const sugg = isCG(S)
    ? ['Actividad tranquila después de la siesta', 'Merienda rápida sin cacahuate', '¿Cómo calmo un berrinche?']
    : ['Plan para una tarde lluviosa de 2 horas', '¿Qué hago si hace berrinche al dormir?', `Menú de 3 días sin ${k.allergy.toLowerCase()}`, 'Actividad para los dos hermanos juntos'];
  const ask = async (text) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setMsgs((m) => [...m, { me: true, t: text }, { me: false, t: 'Pensando…' }]);
    const ans = await askTribbu(S, text);
    setMsgs((m) => [...m.slice(0, -1), { me: false, t: ans }]);
    setBusy(false);
  };
  useEffect(() => { if (pre) ask(pre); }, []);
  return (
    <>
      <SheetHead label="Asistente" title="Pregúntale a Tribbu" />
      <T v="small">{isCG(S) ? `Conoce la rutina y alergias de ${k.name} para tu turno.` : `Conoce la edad de ${k.name}, sus alergias y tus materiales.`} No sustituye al pediatra.</T>
      <Row gap={6} wrap>{sugg.map((s) => <Chip key={s} onPress={() => ask(s)}>{s}</Chip>)}</Row>
      {msgs.map((m, i) => (
        <View key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '88%', backgroundColor: m.me ? c.ink : c.paper2, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 10 }}>
          <T color={m.me ? c.paper : c.ink}>{m.t}</T>
        </View>
      ))}
      <Row>
        <Field style={{ flex: 1 }} placeholder="Escribe tu pregunta" value={q} onChangeText={setQ} onSubmitEditing={() => { ask(q); setQ(''); }} returnKeyType="send" />
        <Btn kind="sun" disabled={busy} onPress={() => { ask(q); setQ(''); }}>Enviar</Btn>
      </Row>
    </>
  );
}

// ---------- Pizarra para tablet ----------
export function BoardScreen() {
  const c = useTheme();
  const { S } = useStore();
  const { closeFull } = useUI();
  const insets = useSafeAreaInsets();
  const all = dayEvents(S, dk(today)).fam;
  const r = todayRecipe(S);
  const pend = tasksSorted(S.tasks).filter((t) => !t.done);
  const Blk = ({ label, children }) => (
    <View style={{ borderTopWidth: 3, borderTopColor: c.ink, paddingTop: 8, gap: 4 }}><T v="label">{label}</T>{children}</View>
  );
  const Big = ({ children }) => <T style={{ fontSize: 18, lineHeight: 25 }}>{children}</T>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.paper }} contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 22, paddingBottom: insets.bottom + 20, gap: 16 }}>
      <Between><T v="label">Modo pizarra · tablet de la cocina</T><Btn sm kind="ghost" onPress={closeFull}>Salir</Btn></Between>
      <T v="h1">{dateLong(today)}</T>
      <Blk label="Quién cuida">
        {Object.keys(KIDS).map((k) => {
          const g = MEMBERS.find((x) => x.role === 'caregiver' && x.kid === k);
          return <Big key={k}>{g ? `${KIDS[k].name} · ${g.name}, ${g.from.replace(/^0/, '')} a ${g.to.replace(/^0/, '')} h` : `${KIDS[k].name} · en casa`}</Big>;
        })}
      </Blk>
      <Blk label="Hoy">{all.length ? all.map((e, i) => <Big key={i}>{`${e.time}  ${e.t}`}</Big>) : <Big>Sin eventos</Big>}</Blk>
      <Blk label="Pendientes">
        {pend.length ? pend.slice(0, 6).map((t) => <Big key={t.id}>{`${nameOf(t.who)}: ${t.t}`}</Big>) : <Big>Todo al día</Big>}
        {pend.length > 6 ? <T v="small">{`y ${pend.length - 6} más`}</T> : null}
      </Blk>
      <Blk label="Comida"><Big>{r ? r.t : 'Sin menú registrado hoy'}</Big></Blk>
      <Blk label="Puntos de la semana"><Big>{Object.keys(KIDS).map((k) => `${KIDS[k].name} ${S.pts[k] || 0}`).join(' · ')}</Big></Blk>
      <T v="small">Pensado para una tablet fija en la pared. Muestra solo lo que cualquier persona en casa puede ver.</T>
    </ScrollView>
  );
}
