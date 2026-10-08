// Asistente de Tribbu.
// FASE 1 (gratis): respuestas de ejemplo generadas en el teléfono, sin internet ni costo.
// FASE 3: askTribbu() llamará a una función segura en Supabase que usa la API de Claude.
//   La llave de la API NUNCA va dentro de la app; vive en el servidor.
import { ACTS, KIDS, MATS, PEOPLE, SHIFT, isCG, kidKey } from './data';

export const AI_LIVE = false; // cambiará a true en la fase 3

export function buildContext(S) {
  const k = KIDS[kidKey(S)];
  const base = 'Eres Tribbu, asistente de crianza para familias en México. Respondes en español mexicano, cálido y práctico, en máximo 120 palabras, con pasos concretos. Priorizas actividades sin pantallas con materiales de casa. No das diagnósticos ni dosis de medicamentos; ante síntomas de alarma recomiendas llamar al pediatra o a emergencias.';
  if (isCG(S)) {
    return `${base}\nQuien pregunta es la Abuela Carmen, cuidadora de ${k.name} (${k.age} años) hoy de ${SHIFT.from} a ${SHIFT.to}. Alergia: ${k.allergy}. Rutina: ${k.routine.map((r) => r.join(' ')).join('; ')}. Materiales: ${S.have.map((m) => MATS[m]).join(', ')}. No compartes información privada de los papás.`;
  }
  return `${base}\nNiño: ${k.name}, ${k.age} años, alergia: ${k.allergy}. Materiales disponibles: ${S.have.map((m) => MATS[m]).join(', ')}. Últimos registros: ${S.feed.filter((x) => x.kid === kidKey(S)).slice(0, 3).map((x) => `${x.kind}: ${x.txt}`).join(' | ')}.`;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const TAG = '\n\n(Respuesta de ejemplo. La IA real se activa en la fase 3.)';

export async function askTribbu(S, question) {
  await wait(700);
  const k = KIDS[kidKey(S)];
  if (/garganta|fiebre|duele|tos|golpe|v[oó]mit/i.test(question)) {
    return 'Ofrécele líquidos tibios y descanso, y vigila la temperatura. No doy dosis de medicamentos: consulta a su pediatra. Si hay fiebre alta, dificultad para respirar o mucho decaimiento, llama al médico o a emergencias.' + TAG;
  }
  if (/comer|men[uú]|receta|cena|comida|merienda/i.test(question)) {
    return `Para ${k.name}: hot cakes de plátano en el desayuno, sopa de fideo con verduras al mediodía y tacos de pollo con aguacate en la cena. Evitamos ${k.allergy.toLowerCase()}.` + TAG;
  }
  if (/berrinche|dormir|llora|calmar/i.test(question)) {
    return `Baja la voz y ponte a su altura. Nombra lo que siente ("estás enojada porque…") y ofrece dos opciones sencillas. Para dormir, repitan la misma rutina corta cada noche: baño, cuento y luz baja. Si los berrinches son muy frecuentes o intensos, coméntalo con su pediatra.` + TAG;
  }
  const a = ACTS.filter((x) => k.age >= x.age[0] && k.age <= x.age[1] && x.mats.every((m) => S.have.includes(m))).slice(0, 2);
  return `Con lo que hay en casa, para ${k.name} propongo:\n• ${a[0] ? `${a[0].t} (${a[0].min} min)` : 'Fuerte de almohadas'}\n• ${a[1] ? `${a[1].t} (${a[1].min} min)` : 'Camino de cinta'}\nEmpieza con la más movida y cierra con una tranquila antes de la cena.` + TAG;
}

export async function summarizeDay(S) {
  await wait(800);
  const att = S.feed.filter((x) => x.lvl !== 'info' && !x.parentsOnly);
  const lines = Object.keys(KIDS).map((kk) => {
    const items = S.feed.filter((x) => x.kid === kk);
    return `${KIDS[kk].name}: ${items.length ? items.map((x) => `${x.kind.toLowerCase()} (${x.t}, ${PEOPLE[x.who][0]})`).join(', ') : 'sin registros'}.`;
  });
  return (att.length ? `Para atender: ${att.map((x) => `${KIDS[x.kid].name}: ${x.txt}`).join(' ')}\n\n` : '') + lines.join('\n') + TAG;
}
