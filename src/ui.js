import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, tone, useTheme } from './theme';

// ---------- Texto ----------
export function T({ v = 'body', color, style, children, ...p }) {
  const c = useTheme();
  const base = {
    h1: { fontFamily: F.display, fontSize: 30, lineHeight: 34, color: c.ink },
    h2: { fontFamily: F.display, fontSize: 22, lineHeight: 26, color: c.ink },
    h3: { fontFamily: F.displayB, fontSize: 17, lineHeight: 21, color: c.ink },
    body: { fontFamily: F.body, fontSize: 15, lineHeight: 21, color: c.ink },
    bold: { fontFamily: F.bold, fontSize: 15, lineHeight: 21, color: c.ink },
    small: { fontFamily: F.body, fontSize: 12.5, lineHeight: 17, color: c.inkSoft },
    label: { fontFamily: F.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.inkSoft },
    num: { fontFamily: F.displayB, fontSize: 16, color: c.ink, fontVariant: ['tabular-nums'] },
  }[v];
  return <Text style={[base, color && { color }, style]} {...p}>{children}</Text>;
}

// ---------- Contenedores ----------
export function Card({ style, children, bg, border }) {
  const c = useTheme();
  return (
    <View style={[{ backgroundColor: bg || c.paper, borderWidth: 1, borderColor: border || c.line, borderRadius: 18, padding: 14, gap: 8 }, style]}>
      {children}
    </View>
  );
}
export const Row = ({ children, style, gap = 10, wrap }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, wrap && { flexWrap: 'wrap' }, style]}>{children}</View>
);
export const Between = ({ children, style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, style]}>{children}</View>
);
// Fila de lista con línea superior (excepto la primera)
export function Item({ first, children, style }) {
  const c = useTheme();
  return <View style={[{ paddingVertical: 9, borderTopWidth: first ? 0 : 1, borderTopColor: c.line }, style]}>{children}</View>;
}

// ---------- Etiquetas y botones ----------
export function Pill({ tone: t = 'amber', children }) {
  const c = useTheme();
  const [bg, fg] = tone(c, t);
  return (
    <View style={{ backgroundColor: bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' }}>
      <Text style={{ fontFamily: F.bold, fontSize: 11, color: fg }}>{children}</Text>
    </View>
  );
}
export function Chip({ on, onPress, children }) {
  const c = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!on }}
      style={{ borderWidth: 1.5, borderColor: on ? c.ink : c.line, backgroundColor: on ? c.ink : c.paper, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 13, color: on ? c.paper : c.ink }}>{children}</Text>
    </Pressable>
  );
}
export function Btn({ kind = 'ink', sm, onPress, children, disabled, style }) {
  const c = useTheme();
  const k = {
    ink: { bg: c.ink, fg: c.paper, bd: c.ink },
    sun: { bg: c.sun, fg: c.sunInk, bd: c.sun },
    ghost: { bg: 'transparent', fg: c.ink, bd: c.line },
  }[kind];
  return (
    <Pressable onPress={disabled ? undefined : onPress} accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{
        backgroundColor: k.bg, borderColor: k.bd, borderWidth: 1.5, borderRadius: sm ? 11 : 14,
        paddingHorizontal: sm ? 12 : 16, paddingVertical: sm ? 7 : 11, alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
      }, style]}>
      {typeof children === 'string'
        ? <Text style={{ fontFamily: F.bold, fontSize: sm ? 13 : 15, color: k.fg, textAlign: 'center' }}>{children}</Text>
        : children}
    </Pressable>
  );
}
// Selector segmentado
export function Seg({ options, value, onChange, full }) {
  const c = useTheme();
  return (
    <View style={[{ flexDirection: 'row', borderWidth: 1.5, borderColor: c.line, borderRadius: 11, overflow: 'hidden', backgroundColor: c.paper }, !full && { alignSelf: 'flex-start' }]}>
      {options.map(([k, label]) => {
        const on = k === value;
        return (
          <Pressable key={k} onPress={() => onChange(k)} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={[{ paddingHorizontal: 10, paddingVertical: full ? 8 : 6, backgroundColor: on ? c.ink : 'transparent', alignItems: 'center' }, full && { flex: 1 }]}>
            <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: on ? c.paper : c.inkSoft }} numberOfLines={1}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Field(props) {
  const c = useTheme();
  return (
    <TextInput placeholderTextColor={c.inkSoft} {...props}
      style={[{ borderWidth: 1.5, borderColor: c.line, backgroundColor: c.paper, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9, fontFamily: F.body, fontSize: 15, color: c.ink }, props.multiline && { minHeight: 70, textAlignVertical: 'top' }, props.style]} />
  );
}
export function Toggle({ value, onChange, label }) {
  const c = useTheme();
  return <Switch value={value} onValueChange={onChange} accessibilityLabel={label} trackColor={{ true: c.leaf, false: c.line }} thumbColor="#FFFFFF" />;
}
export function Check({ on, onPress, label, children }) {
  const c = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: !!on }} accessibilityLabel={label}
      style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: on ? c.leaf : c.line, backgroundColor: on ? c.leaf : c.paper, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {on ? <Text style={{ color: c.paper, fontFamily: F.bold, fontSize: 13, lineHeight: 15 }}>✓</Text> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}
export function Avatar({ letter, bg, fg, size = 34 }) {
  const c = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg || c.paper2, borderWidth: bg ? 0 : 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: F.display, fontSize: size * 0.4, color: fg || c.ink }}>{letter}</Text>
    </View>
  );
}

// ---------- Hojas (bottom sheets), pantallas completas y avisos ----------
const UICtx = createContext(null);

export function UIProvider({ children }) {
  const [sheet, setSheet] = useState(null);
  const [full, setFull] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const timer = useRef(null);
  const openSheet = useCallback((node) => setSheet(node), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const openFull = useCallback((node) => { setSheet(null); setFull(node); }, []);
  const closeFull = useCallback(() => setFull(null), []);
  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);
  const api = { openSheet, closeSheet, openFull, closeFull, toast };
  return (
    <UICtx.Provider value={api}>
      {children}
      <ToastView msg={toastMsg} />
      <SheetModal node={sheet} onClose={closeSheet} toastMsg={toastMsg} />
      <Modal visible={!!full} animationType="fade" onRequestClose={closeFull} statusBarTranslucent>
        {full}
        <ToastView msg={toastMsg} />
      </Modal>
    </UICtx.Provider>
  );
}
export const useUI = () => useContext(UICtx);

function ToastView({ msg }) {
  const c = useTheme();
  if (!msg) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 110, alignItems: 'center' }}>
      <View style={{ backgroundColor: c.leaf, borderRadius: 99, paddingHorizontal: 16, paddingVertical: 9, maxWidth: '90%' }}>
        <Text style={{ fontFamily: F.bold, fontSize: 13, color: c.paper, textAlign: 'center' }}>{msg}</Text>
      </View>
    </View>
  );
}

function SheetModal({ node, onClose, toastMsg }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!node} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} onPress={onClose} accessibilityLabel="Cerrar" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ maxHeight: '92%' }}>
          <View style={{ backgroundColor: c.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26 }}>
            <View style={{ width: 40, height: 5, borderRadius: 9, backgroundColor: c.line, alignSelf: 'center', marginTop: 10 }} />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, gap: 12, paddingBottom: 24 + insets.bottom }}>
              {node}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        <ToastView msg={toastMsg} />
      </View>
    </Modal>
  );
}

// Encabezado estándar de una hoja con botón de cerrar
export function SheetHead({ label, title, sub }) {
  const c = useTheme();
  const { closeSheet } = useUI();
  return (
    <Between style={{ alignItems: 'flex-start' }}>
      <View style={{ flex: 1, gap: 2 }}>
        {label ? <T v="label">{label}</T> : null}
        <T v="h2">{title}</T>
        {sub ? <T v="small">{sub}</T> : null}
      </View>
      <Pressable onPress={closeSheet} accessibilityLabel="Cerrar" style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.paper2, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, lineHeight: 22, color: c.ink }}>×</Text>
      </Pressable>
    </Between>
  );
}
