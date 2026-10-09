// Pantallas de cuenta: entrar, crear cuenta, recuperar contraseña, crear familia y unirse con un código.
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../session';
import { friendly } from '../supabase';
import { F, useTheme } from '../theme';
import { Btn, Card, Field, Row, Seg, T } from '../ui';

function Frame({ children }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28, gap: 16 }}>
        <View style={{ gap: 4, marginBottom: 4 }}>
          <Text style={{ fontFamily: F.display, fontSize: 40, color: c.ink }}>Tribbu</Text>
          <T color={c.inkSoft}>Apoyo para papás: actividades sin pantallas, agenda y cuidadores en un solo lugar.</T>
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Msg = ({ text, ok }) => {
  const c = useTheme();
  return text ? (
    <View style={{ backgroundColor: ok ? c.leafBg : c.berryBg, borderRadius: 12, padding: 10 }}>
      <T v="small" color={c.ink} accessibilityLiveRegion="polite">{text}</T>
    </View>
  ) : null;
};

// Envuelve una acción asíncrona mostrando "cargando" y los errores en español.
function useAction(setMsg) {
  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    setBusy(true); setMsg(null);
    try { await fn(); } catch (e) { setMsg({ text: friendly(e) }); } finally { setBusy(false); }
  };
  return [busy, run];
}

// Opciones sin cuenta: se muestran en la bienvenida y en la pantalla de entrada.
function LocalModes() {
  const auth = useAuth();
  return (
    <>
      <Card>
        <T v="bold">Modo de prueba en blanco</T>
        <T v="small">La app completa, sin datos de ejemplo: tú cargas a tus hijos, cuidadores, agenda, recetas, etc. Todo se guarda solo en este teléfono y no necesitas cuenta.</T>
        <Btn kind="sun" onPress={auth.startBlank}>Empezar en blanco</Btn>
      </Card>
      <Card>
        <T v="bold">Demostración con datos de ejemplo</T>
        <T v="small">Una familia de ejemplo ya cargada (Sofi, Mateo y sus abuelos) para ver cómo se ve la app llena.</T>
        <Btn kind="ghost" onPress={auth.startDemo}>Ver la demostración</Btn>
      </Card>
    </>
  );
}

export function WelcomeScreen() {
  return (
    <Frame>
      <T v="h2">¿Cómo quieres probar Tribbu?</T>
      <LocalModes />
      <T v="small" style={{ textAlign: 'center' }}>Las cuentas para compartir con tu familia en varios teléfonos se activan al conectar Supabase (ver README).</T>
    </Frame>
  );
}

const validEmail = (e) => /^\S+@\S+\.\S+$/.test(e.trim());

export function AuthScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState('login'); // login | signup | confirm | recover | reset
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, run] = useAction(setMsg);
  const go = (m) => { setMode(m); setMsg(null); setPw(''); setPw2(''); setCode(''); };

  const needEmail = () => { if (!validEmail(email)) { setMsg({ text: 'Escribe un correo válido.' }); return false; } return true; };
  const needPw = () => {
    if (pw.length < 8) { setMsg({ text: 'La contraseña debe tener al menos 8 caracteres.' }); return false; }
    if (mode !== 'login' && pw !== pw2) { setMsg({ text: 'Las contraseñas no coinciden.' }); return false; }
    return true;
  };

  const submit = () => {
    if (mode === 'login') {
      if (!needEmail() || !pw) return;
      run(() => auth.signIn(email, pw));
    } else if (mode === 'signup') {
      if (!needEmail() || !needPw()) return;
      run(async () => {
        const r = await auth.signUp(email, pw);
        if (r === 'confirm') { setMode('confirm'); setMsg({ ok: true, text: 'Te enviamos un código a tu correo. Escríbelo aquí para confirmar tu cuenta.' }); }
      });
    } else if (mode === 'confirm') {
      if (!code.trim()) return;
      run(() => auth.verifyCode(email, code, 'signup'));
    } else if (mode === 'recover') {
      if (!needEmail()) return;
      run(async () => { await auth.sendRecovery(email); setMode('reset'); setMsg({ ok: true, text: 'Si el correo existe, te enviamos un código. Escríbelo y elige tu nueva contraseña.' }); });
    } else if (mode === 'reset') {
      if (!code.trim() || !needPw()) return;
      run(async () => { await auth.verifyCode(email, code, 'recovery'); await auth.setPassword(pw); await auth.reload(); });
    }
  };

  const titles = { login: 'Entrar', signup: 'Crear cuenta', confirm: 'Confirmar correo', recover: 'Recuperar contraseña', reset: 'Nueva contraseña' };
  const cta = { login: 'Entrar', signup: 'Crear mi cuenta', confirm: 'Confirmar', recover: 'Enviar código', reset: 'Cambiar contraseña y entrar' };
  const showTabs = mode === 'login' || mode === 'signup';

  return (
    <Frame>
      {showTabs ? <Seg full options={[['login', 'Entrar'], ['signup', 'Crear cuenta']]} value={mode} onChange={go} /> : <T v="h2">{titles[mode]}</T>}
      <Card>
        <Field placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
          keyboardType="email-address" autoComplete="email" textContentType="emailAddress" editable={mode !== 'confirm' && mode !== 'reset'} />
        {mode === 'login' || mode === 'signup' || mode === 'reset' ? (
          <Field placeholder={mode === 'login' ? 'Contraseña' : 'Contraseña (mínimo 8 caracteres)'} value={pw} onChangeText={setPw} secureTextEntry
            autoCapitalize="none" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} textContentType={mode === 'login' ? 'password' : 'newPassword'} />
        ) : null}
        {mode === 'signup' || mode === 'reset' ? (
          <Field placeholder="Repite la contraseña" value={pw2} onChangeText={setPw2} secureTextEntry autoCapitalize="none" />
        ) : null}
        {mode === 'confirm' || mode === 'reset' ? (
          <Field placeholder="Código del correo" value={code} onChangeText={setCode} keyboardType="number-pad" autoCapitalize="none" />
        ) : null}
        <Msg {...(msg || {})} />
        <Btn kind="sun" disabled={busy} onPress={submit}>{busy ? 'Un momento…' : cta[mode]}</Btn>
        {mode === 'login' ? <Btn kind="ghost" sm onPress={() => go('recover')}>Olvidé mi contraseña</Btn> : null}
        {!showTabs ? <Btn kind="ghost" sm onPress={() => go('login')}>Volver</Btn> : null}
      </Card>
      <T v="label" style={{ marginTop: 4 }}>O prueba sin cuenta</T>
      <LocalModes />
      <T v="small" style={{ textAlign: 'center' }}>¿Te invitaron a una familia? Crea tu cuenta aquí y después escribe el código de invitación.</T>
    </Frame>
  );
}

const blankKid = () => ({ name: '', age: '', allergy: '' });

export function OnboardingScreen({ local, onLocalCreate, onLeave }) {
  const auth = useAuth() || {};
  const [tab, setTab] = useState('new');
  const [familyName, setFamilyName] = useState('');
  const [myName, setMyName] = useState('');
  const [kids, setKids] = useState([blankKid()]);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, run] = useAction(setMsg);
  const setKid = (i, k) => (v) => setKids((a) => a.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const create = () => {
    const clean = kids.filter((k) => k.name.trim());
    if (local) {
      if (!myName.trim()) { setMsg({ text: 'Escribe tu nombre.' }); return; }
      if (!clean.length) { setMsg({ text: 'Agrega al menos un niño o niña.' }); return; }
      const bad0 = clean.find((k) => !(Number(k.age) >= 0 && Number(k.age) <= 17 && k.age !== ''));
      if (bad0) { setMsg({ text: `Escribe la edad de ${bad0.name} (de 0 a 17 años).` }); return; }
      onLocalCreate({ myName: myName.trim(), kids: clean.map((k) => ({ name: k.name.trim(), age: Number(k.age), allergy: k.allergy.trim() })) });
      return;
    }
    if (!familyName.trim() || !myName.trim()) { setMsg({ text: 'Escribe el nombre de tu familia y tu nombre.' }); return; }
    if (!clean.length) { setMsg({ text: 'Agrega al menos un niño o niña.' }); return; }
    const bad = clean.find((k) => !(Number(k.age) >= 0 && Number(k.age) <= 17 && k.age !== ''));
    if (bad) { setMsg({ text: `Escribe la edad de ${bad.name} (de 0 a 17 años).` }); return; }
    run(() => auth.createFamily({
      familyName: familyName.trim(), myName: myName.trim(),
      kids: clean.map((k, i) => ({ key: `k${i + 1}`, data: { name: k.name.trim(), age: Number(k.age), allergy: k.allergy.trim() || 'Ninguna conocida' } })),
    }));
  };
  const join = () => { if (!code.trim()) { setMsg({ text: 'Escribe el código que te compartieron.' }); return; } run(() => auth.acceptInvite(code)); };

  return (
    <Frame>
      <T v="h2">{local ? 'Empecemos en blanco' : 'Bienvenido'}</T>
      <T v="small">{local ? 'Estos datos se guardan solo en este teléfono. Después podrás agregar cuidadores, otro papá o mamá y más niños desde la pestaña Familia.' : (auth.user ? `Sesión iniciada como ${auth.user.email}.` : '')}</T>
      {local ? null : <Seg full options={[['new', 'Crear mi familia'], ['join', 'Tengo un código']]} value={tab} onChange={(v) => { setTab(v); setMsg(null); }} />}
      {tab === 'new' || local ? (
        <Card>
          {local ? null : <Field placeholder="Nombre de la familia, p. ej. Familia García" value={familyName} onChangeText={setFamilyName} />}
          <Field placeholder="Tu nombre, p. ej. Mamá de Sofi o Diego" value={myName} onChangeText={setMyName} />
          <T v="label">Niños</T>
          {kids.map((k, i) => (
            <View key={i} style={{ gap: 8 }}>
              <Row>
                <Field style={{ flex: 1 }} placeholder="Nombre" value={k.name} onChangeText={setKid(i, 'name')} />
                <Field style={{ width: 80 }} placeholder="Edad" keyboardType="number-pad" value={k.age} onChangeText={setKid(i, 'age')} />
              </Row>
              <Field placeholder="Alergias (opcional)" value={k.allergy} onChangeText={setKid(i, 'allergy')} />
              {kids.length > 1 ? <Btn kind="ghost" sm style={{ alignSelf: 'flex-start' }} onPress={() => setKids((a) => a.filter((_, j) => j !== i))}>Quitar</Btn> : null}
            </View>
          ))}
          {kids.length < 8 ? <Btn kind="ghost" sm style={{ alignSelf: 'flex-start' }} onPress={() => setKids((a) => [...a, blankKid()])}>Agregar otro niño</Btn> : null}
          <Msg {...(msg || {})} />
          <Btn kind="sun" disabled={busy} onPress={create}>{local ? 'Empezar' : busy ? 'Creando…' : 'Crear familia'}</Btn>
          {local ? null : <T v="small">Después podrás invitar al otro papá o mamá y a abuelos, niñeras o hermanos desde la pestaña Familia.</T>}
        </Card>
      ) : (
        <Card>
          <T>Pídele a mamá o papá el código de invitación y escríbelo aquí.</T>
          <Field placeholder="Código de invitación" value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} />
          <Msg {...(msg || {})} />
          <Btn kind="sun" disabled={busy} onPress={join}>{busy ? 'Uniéndome…' : 'Unirme a la familia'}</Btn>
        </Card>
      )}
      {local
        ? <Btn kind="ghost" sm style={{ alignSelf: 'center' }} onPress={onLeave}>Cambiar de modo</Btn>
        : <Btn kind="ghost" sm style={{ alignSelf: 'center' }} onPress={auth.signOut}>Cerrar sesión</Btn>}
    </Frame>
  );
}
