// Cuentas para el resumen general (pantalla Resumen). Todo se calcula con lo que la persona puede ver en S.
import { KIDS, MEMBERS, PEOPLE, addD, dayEvents, dk, evKids, evKey, evPeople, feedDay, taskWhos, today } from './data';
import { MILE_ITEMS, mileStats } from './milestones';

// Lista de fechas AAAA-MM-DD de los últimos n días (la última es hoy).
export const lastDays = (n) => Array.from({ length: n }, (_, i) => dk(addD(i - n + 1)));

const kidOk = (kids, kid) => kid === 'all' || kids.includes(kid);

// Registros rápidos de la bitácora en el periodo: total, por día y por tipo.
export function feedStats(S, n, kid) {
  const days = lastDays(n);
  const perDay = days.map((d) => ({ d, n: 0 }));
  const kinds = {};
  let total = 0;
  S.feed.forEach((x) => {
    if (!kidOk([x.kid], kid)) return;
    const i = days.indexOf(feedDay(x));
    if (i < 0) return;
    perDay[i].n += 1; total += 1;
    const k = x.kind || 'Otro';
    kinds[k] = (kinds[k] || 0) + 1;
  });
  const byKind = Object.entries(kinds).map(([kind, c]) => ({ kind, n: c })).sort((a, b) => b.n - a.n || a.kind.localeCompare(b.kind));
  return { total, perDay, byKind, max: Math.max(1, ...perDay.map((p) => p.n)) };
}

// Eventos de los próximos 7 días (incluye hoy), solo los de la familia.
export function upcomingEvents(S, kid) {
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = dk(addD(i));
    const evs = dayEvents(S, d).fam.filter((e) => kid === 'all' || evKids(e).includes(kid) || !evKids(e).length);
    out.push({ d, i, evs });
  }
  return { days: out, total: out.reduce((a, x) => a + x.evs.length, 0) };
}

// Pendientes: abiertos, vencidos, hechos, y por persona.
export function taskStats(S, kid) {
  const key = dk(today);
  const list = S.tasks.filter((t) => kid === 'all' || !t.kid || t.kid === kid || taskWhos(t).includes(kid));
  const open = list.filter((t) => !t.done);
  const overdue = open.filter((t) => t.due && t.due < key);
  const who = {};
  list.forEach((t) => {
    const ws = taskWhos(t); const keys = ws.length ? ws : [''];
    keys.forEach((w) => { const r = (who[w] = who[w] || { open: 0, done: 0 }); if (t.done) r.done += 1; else r.open += 1; });
  });
  const people = Object.entries(who).map(([w, r]) => ({
    w, name: w ? ((KIDS[w] && KIDS[w].name) || (PEOPLE[w] && PEOPLE[w][2]) || (MEMBERS.find((m) => m.key === w) || {}).name || 'Alguien') : 'Sin asignar', ...r,
  })).sort((a, b) => b.open - a.open || b.done - a.done);
  return { open: open.length, overdue: overdue.length, done: list.length - open.length, total: list.length, people };
}

// Hitos del desarrollo: avance de cada niño en su edad actual.
export function mileSummary(S, kid) {
  const keys = kid === 'all' ? Object.keys(KIDS) : [kid];
  return keys.filter((k) => KIDS[k]).map((k) => {
    const m = mileStats(S, k, KIDS[k].age);
    return { kid: k, name: KIDS[k].name, label: m.cur.label, done: m.curDone, total: m.curTotal, pending: m.pending.length, all: MILE_ITEMS.filter((i) => !i.tips && S.mile && S.mile[`${k}|${i.id}`]).length };
  });
}

export { evKey, evPeople };
