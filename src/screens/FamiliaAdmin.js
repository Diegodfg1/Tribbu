// Gestión de la familia (solo papás): invitaciones o altas, cuidadores y fichas de los niños. Y la tarjeta de cuenta.
// Usa las acciones de `useStore().family`, que existen en la nube y en el modo en blanco.
import React, { useCallback, useEffect, useState } from 'react';
import { Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { KIDS, MEMBERS, isBlank, isCloud } from '../data';
import { useAuth } from '../session';
import { useStore } from '../store';
import { friendly } from '../supabase';
import { F, useTheme } from '../theme';
import { Between, Btn, Card, Chip, Field, Item, Pill, Row, Seg, SheetHead, T, confirmAction, useUI } from '../ui';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// ---------- Invitar / agregar ----------
function InviteSheet({ onDone }) {
  const c = useTheme();
  const { family } = useStore();
  const { closeSheet, toast } = useUI();
  const local = family.local;
  const [role, setRole] = useState('caregiver');
  const [name, setName] = useState('');
  const [kid, setKid] = useState(Object.keys(KIDS)[0]);
  const [from, setFrom] = useState('14:00');
  const [to, setTo] = useState('19:00');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(null);
  const create = async () => {
    if (!name.trim()) { setMsg('Escribe cómo se llama la persona (p. ej. Abuela Carmen).'); return; }
    if (role === 'caregiver' && (!HHMM.test(from) || !HHMM.test(to) || from >= to)) { setMsg('Escribe el horario como 14:00 y que la hora de inicio sea antes que la de fin.'); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await family.invite({ role, name: name.trim(), kid, from, to });
      if (local) { closeSheet(); toast(`${name.trim()} agregada. Usa «Ver como» arriba para ver su vista`); return; }
      setCode(res); onDone && onDone();
    } catch (e) { setMsg(friendly(e)); } finally { setBusy(false); }
  };
  if (code) {
    const text = `Te invito a nuestra familia en Tribbu. Instala la app, crea tu cuenta y escribe este código de invitación: ${code}\n(El código vence en 7 días.)`;
    return (
      <>
        <SheetHead title="Invitación lista" />
        <T>{`Comparte este código con ${name.trim()}. Solo sirve una vez.`}</T>
        <View style={{ backgroundColor: c.paper2, borderRadius: 14, padding: 16, alignItems: 'center' }}>
          <T selectable style={{ fontFamily: F.display, fontSize: 32, letterSpacing: 2 }}>{code}</T>
        </View>
        <Btn kind="sun" onPress={() => Share.share({ message: text })}>Enviar por WhatsApp, mensaje…</Btn>
        <Btn kind="ghost" onPress={() => Clipboard.setStringAsync(code)}>Copiar código</Btn>
      </>
    );
  }
  return (
    <>
      <SheetHead title={local ? 'Agregar persona' : 'Invitar a la familia'} />
      <Seg full options={[['caregiver', 'Cuidador'], ['parent', 'Papá o mamá']]} value={role} onChange={setRole} />
      <T v="small">{role === 'caregiver' ? 'Abuelos, niñera, tíos o hermanos. Solo verán lo que corresponde a su turno y al niño que cuidan.' : 'Tendrá los mismos permisos que tú.'}</T>
      <Field placeholder="Nombre, p. ej. Abuela Carmen" value={name} onChangeText={setName} />
      {role === 'caregiver' ? (
        <>
          <T v="label">¿A quién cuida?</T>
          <Row gap={6} wrap>{Object.keys(KIDS).map((k) => <Chip key={k} on={kid === k} onPress={() => setKid(k)}>{KIDS[k].name}</Chip>)}</Row>
          <T v="label">Horario de su turno</T>
          <Row>
            <Field style={{ flex: 1 }} placeholder="14:00" value={from} onChangeText={setFrom} keyboardType="numbers-and-punctuation" />
            <T>a</T>
            <Field style={{ flex: 1 }} placeholder="19:00" value={to} onChangeText={setTo} keyboardType="numbers-and-punctuation" />
          </Row>
        </>
      ) : null}
      {msg ? <T v="small" color={c.berry}>{msg}</T> : null}
      <Btn kind="sun" disabled={busy} onPress={create}>{busy ? 'Un momento…' : local ? 'Agregar' : 'Crear invitación'}</Btn>
    </>
  );
}

// ---------- Turno de un cuidador ----------
function ShiftSheet({ m }) {
  const c = useTheme();
  const { family } = useStore();
  const { closeSheet, toast } = useUI();
  const [kid, setKid] = useState(m.kid);
  const [from, setFrom] = useState(m.from);
  const [to, setTo] = useState(m.to);
  const [msg, setMsg] = useState(null);
  const save = async () => {
    if (!HHMM.test(from) || !HHMM.test(to) || from >= to) { setMsg('Escribe el horario como 14:00 y que la hora de inicio sea antes que la de fin.'); return; }
    try { await family.updateMember(m.key, { kid, from, to }); } catch (e) { setMsg(friendly(e)); return; }
    closeSheet(); toast('Turno actualizado');
  };
  return (
    <>
      <SheetHead title={`Turno de ${m.name}`} />
      <Row gap={6} wrap>{Object.keys(KIDS).map((k) => <Chip key={k} on={kid === k} onPress={() => setKid(k)}>{KIDS[k].name}</Chip>)}</Row>
      <Row>
        <Field style={{ flex: 1 }} value={from} onChangeText={setFrom} keyboardType="numbers-and-punctuation" />
        <T>a</T>
        <Field style={{ flex: 1 }} value={to} onChangeText={setTo} keyboardType="numbers-and-punctuation" />
      </Row>
      {msg ? <T v="small" color={c.berry}>{msg}</T> : null}
      <Btn kind="sun" onPress={save}>Guardar</Btn>
    </>
  );
}

// ---------- Ficha de un niño ----------
function KidSheet({ kk }) {
  const c = useTheme();
  const { family } = useStore();
  const { closeSheet, toast } = useUI();
  const k = KIDS[kk] || { name: '', age: '', allergy: '', blood: '', ped: '', ins: '', routine: [] };
  const [f, setF] = useState({
    name: k.name, age: String(k.age === 0 && !KIDS[kk] ? '' : k.age), allergy: k.allergy, blood: k.blood, ped: k.ped, ins: k.ins,
    routine: (k.routine || []).map(([a, b]) => `${a}: ${b}`).join('\n'),
  });
  const [msg, setMsg] = useState(null);
  const set = (x) => (v) => setF((o) => ({ ...o, [x]: v }));
  const save = async () => {
    if (!f.name.trim() || !(Number(f.age) >= 0 && Number(f.age) <= 17 && f.age !== '')) { setMsg('Escribe el nombre y la edad (de 0 a 17 años).'); return; }
    const routine = f.routine.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const m = l.match(/^(.*?):\s+(.*)$/);
      return m ? [m[1], m[2]] : [l, ''];
    });
    const key = kk || `k${Math.max(0, ...Object.keys(KIDS).map((x) => Number(x.slice(1)) || 0)) + 1}`;
    const data = { name: f.name.trim(), age: Number(f.age), allergy: f.allergy.trim() || 'Ninguna conocida', blood: f.blood.trim() || 'Sin registrar', ped: f.ped.trim() || 'Sin registrar', ins: f.ins.trim() || 'Sin registrar', routine };
    try { await family.saveKid(key, data); } catch (e) { setMsg(friendly(e)); return; }
    closeSheet(); toast('Ficha guardada');
  };
  return (
    <>
      <SheetHead title={kk ? `Ficha de ${k.name}` : 'Agregar niño'} />
      <Row>
        <Field style={{ flex: 1 }} placeholder="Nombre" value={f.name} onChangeText={set('name')} />
        <Field style={{ width: 80 }} placeholder="Edad" keyboardType="number-pad" value={f.age} onChangeText={set('age')} />
      </Row>
      <Field placeholder="Alergias" value={f.allergy} onChangeText={set('allergy')} />
      <Field placeholder="Tipo de sangre, p. ej. O+" value={f.blood} onChangeText={set('blood')} />
      <Field placeholder="Pediatra y teléfono" value={f.ped} onChangeText={set('ped')} />
      <Field placeholder="Seguro médico y póliza" value={f.ins} onChangeText={set('ins')} />
      <T v="label">Rutina (una por línea, con el formato «Siesta: 15:00 a 16:00»)</T>
      <Field multiline value={f.routine} onChangeText={set('routine')} placeholder={'Siesta: 15:00 a 16:00\nCena: 18:30'} />
      {msg ? <T v="small" color={c.berry}>{msg}</T> : null}
      <Btn kind="sun" onPress={save}>Guardar</Btn>
    </>
  );
}

// ---------- Tarjeta de familia (papás) ----------
export function FamilyAdmin() {
  const c = useTheme();
  const { family } = useStore();
  const { openSheet, toast } = useUI();
  const local = family.local;
  const [invites, setInvites] = useState([]);
  const loadInvites = useCallback(async () => { setInvites(await family.listInvites()); }, [family]);
  useEffect(() => { loadInvites(); }, [loadInvites]);

  const remove = (m) => confirmAction(`¿Quitar a ${m.name}?`, 'Dejará de ver la información de la familia. Sus registros anteriores se conservan.', 'Quitar', async () => {
    try { await family.removeMember(m.key); toast(`${m.name} ya no tiene acceso`); } catch (e) { toast(friendly(e)); }
  });
  const revoke = async (inv) => { await family.revokeInvite(inv.code); loadInvites(); };

  return (
    <>
      <Card style={{ gap: 0 }}>
        <Between style={{ marginBottom: 6 }}>
          <T v="h3">Personas de la familia</T>
          <Btn sm kind="sun" onPress={() => openSheet(<InviteSheet onDone={loadInvites} />)}>{local ? 'Agregar persona' : 'Invitar'}</Btn>
        </Between>
        {MEMBERS.map((m, i) => (
          <Item key={m.key} first={!i}>
            <Between>
              <View style={{ flex: 1, gap: 2 }}>
                <T v="bold">{m.name}</T>
                <Row gap={4} wrap>
                  <Pill tone={m.role === 'parent' ? 'sky' : 'amber'}>{m.role === 'parent' ? 'Papá/mamá' : 'Cuidador'}</Pill>
                  {m.role === 'caregiver' && KIDS[m.kid] ? <Pill>{`${KIDS[m.kid].name} · ${m.from} a ${m.to}`}</Pill> : null}
                </Row>
              </View>
              {m.role === 'caregiver' ? (
                <Row gap={6}>
                  <Btn sm kind="ghost" onPress={() => openSheet(<ShiftSheet m={m} />)}>Turno</Btn>
                  <Btn sm kind="ghost" onPress={() => remove(m)}>Quitar</Btn>
                </Row>
              ) : m.role === 'parent' && local && MEMBERS.filter((x) => x.role === 'parent').length > 1 ? (
                <Btn sm kind="ghost" onPress={() => remove(m)}>Quitar</Btn>
              ) : null}
            </Between>
          </Item>
        ))}
        {invites.length ? <T v="label" style={{ marginTop: 10, marginBottom: 2 }}>Invitaciones pendientes</T> : null}
        {invites.map((inv) => (
          <Item key={inv.code} first>
            <Between>
              <View style={{ flex: 1 }}>
                <T v="bold">{inv.display_name}</T>
                <T v="small" selectable>{`Código ${inv.code}`}</T>
              </View>
              <Row gap={6}>
                <Btn sm kind="ghost" onPress={() => Share.share({ message: `Te invito a nuestra familia en Tribbu. Instala la app, crea tu cuenta y escribe este código de invitación: ${inv.code}` })}>Compartir</Btn>
                <Btn sm kind="ghost" onPress={() => revoke(inv)}>Cancelar</Btn>
              </Row>
            </Between>
          </Item>
        ))}
      </Card>
      <Card style={{ gap: 0 }}>
        <Between style={{ marginBottom: 6 }}>
          <T v="h3">Fichas de los niños</T>
          <Btn sm kind="ghost" onPress={() => openSheet(<KidSheet kk={null} />)}>Agregar niño</Btn>
        </Between>
        {Object.keys(KIDS).map((k, i) => (
          <Item key={k} first={!i}>
            <Between>
              <View style={{ flex: 1 }}><T v="bold">{KIDS[k].name}</T><T v="small">{`${KIDS[k].age} años · alergia: ${KIDS[k].allergy}`}</T></View>
              <Btn sm kind="ghost" onPress={() => openSheet(<KidSheet kk={k} />)}>Editar</Btn>
            </Between>
          </Item>
        ))}
        <T v="small" style={{ marginTop: 6 }}>La ficha de emergencia la ven los cuidadores del niño. Mantenla al día.</T>
      </Card>
    </>
  );
}

// ---------- Cuenta ----------
export function AccountCard() {
  const { S, wipe } = useStore();
  const auth = useAuth();
  if (!auth) return null;
  const cloud = isCloud(S);
  const blank = isBlank(S);
  const wipeAll = () => confirmAction('¿Borrar todo?', 'Se borra lo que cargaste en este teléfono y empiezas de nuevo.', 'Borrar todo', wipe);
  return (
    <Card>
      <T v="h3">Cuenta y modo</T>
      {cloud ? (
        <>
          <T v="small">{`Sesión iniciada como ${auth.user ? auth.user.email : ''}.`}</T>
          <Btn kind="ghost" sm style={{ alignSelf: 'flex-start' }} onPress={auth.signOut}>Cerrar sesión</Btn>
        </>
      ) : (
        <>
          <T v="small">{blank
            ? 'Modo de prueba en blanco: lo que cargas se guarda solo en este teléfono. Cambia «Ver como» arriba para comprobar qué ve cada persona.'
            : 'Estás en la demostración: los datos son de ejemplo y se guardan solo en este teléfono.'}</T>
          <Btn kind="ghost" sm style={{ alignSelf: 'flex-start' }} onPress={auth.leaveDemo}>{auth.canAccount ? 'Cambiar de modo o iniciar sesión' : 'Cambiar de modo'}</Btn>
          {blank ? <Btn kind="ghost" sm style={{ alignSelf: 'flex-start' }} onPress={wipeAll}>Borrar todo y empezar de nuevo</Btn> : null}
        </>
      )}
    </Card>
  );
}
