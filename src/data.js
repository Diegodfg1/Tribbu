// Datos de ejemplo y utilidades de fechas.
// En la fase 2 estos datos vivirán en Supabase; por ahora se guardan en el teléfono.

export const KIDS = {
  sofi: {
    name: 'Sofi', age: 4, allergy: 'Cacahuate', blood: 'O+',
    ped: 'Dra. Paula Ruiz · 55 1234 5678', ins: 'Póliza GMM 88-2031',
    routine: [['Siesta', '15:00 a 16:00'], ['Merienda', '17:00 (fruta, sin cacahuate)'], ['Cena', '18:30'], ['Para dormir', 'Su conejo de peluche']],
  },
  mateo: {
    name: 'Mateo', age: 7, allergy: 'Ninguna conocida', blood: 'A+',
    ped: 'Dra. Paula Ruiz · 55 1234 5678', ins: 'Póliza GMM 88-2031',
    routine: [['Tarea', '16:00 a 17:00'], ['Natación', '17:30'], ['Cena', '19:00']],
  },
};

// [nombre completo, inicial, nombre corto]
export const PEOPLE = {
  yo: ['Tú (mamá)', 'T', 'mamá'], papa: ['Papá', 'P', 'papá'], carmen: ['Abuela Carmen', 'C', 'Abuela Carmen'],
  jorge: ['Abuelo Jorge', 'J', 'Abuelo Jorge'], luis: ['Tío Luis', 'L', 'Tío Luis'], ana: ['Ana (hermana)', 'A', 'Ana'],
};
export const PARENTS = ['yo', 'papa'];
export const nameOf = (k) => (PEOPLE[k] ? PEOPLE[k][0] : 'Alguien');
export const letterOf = (k) => (PEOPLE[k] ? PEOPLE[k][1] : '?');
export const shortOf = (k) => (PEOPLE[k] ? PEOPLE[k][2] : 'alguien');

// Turno de la cuidadora que se usa en la vista "Abuela Carmen".
export const SHIFT = { who: 'carmen', kid: 'sofi', from: '14:00', to: '19:00' };

// Personas de la familia con su rol. En la demostración son de ejemplo; con cuenta real vienen de Supabase.
export const MEMBERS = [
  { key: 'carmen', name: 'Abuela Carmen', role: 'caregiver', kid: 'sofi', from: '14:00', to: '19:00' },
  { key: 'jorge', name: 'Abuelo Jorge', role: 'caregiver', kid: 'mateo', from: '16:00', to: '20:00' },
];
export const caregiverOf = (kidK) => MEMBERS.find((m) => m.role === 'caregiver' && m.kid === kidK);

export const MATS = {
  calcetines: 'Calcetines', cucharas: 'Cucharas', ollas: 'Ollas', almohadas: 'Almohadas', cobija: 'Cobija',
  harina: 'Harina', sal: 'Sal', agua: 'Agua', vasos: 'Vasos', cinta: 'Cinta adhesiva', linterna: 'Linterna',
  papel: 'Papel', crayones: 'Crayones', pasta: 'Pasta seca', cuerda: 'Cordón', tapas: 'Tapas de botella',
  caja: 'Caja de cartón', tijeras: 'Tijeras',
};

export const SKILLS = {
  motricidad: ['Motricidad', 'leaf'], logica: ['Lógica', 'sky'], lenguaje: ['Lenguaje', 'amber'],
  creatividad: ['Creatividad', 'berry'], calma: ['Calma', 'sky'],
};

export const ACTS = [
  { id: 1, t: 'Memoria de calcetines', mats: ['calcetines'], age: [2, 5], min: 10, sk: 'logica', energy: 'Tranquila', why: 'Discriminación visual, emparejar y contar.', steps: ['Junta 6 a 10 pares de calcetines y revuélvelos en el piso.', 'Pídele que encuentre los pares, uno por uno.', 'Sube el reto: escondan un calcetín de cada par por la sala.', 'Cierra contando juntos cuántos pares encontraron.'] },
  { id: 2, t: 'Orquesta de cocina', mats: ['ollas', 'cucharas'], age: [1, 6], min: 15, sk: 'creatividad', energy: 'Movida', why: 'Ritmo, atención auditiva y turnos.', steps: ['Pon boca abajo 3 ollas de tamaños distintos.', 'Prueben qué suena más grave y más agudo.', 'Tú marcas un ritmo de 3 golpes y tu hijo lo repite.', 'Cambien los papeles: él dirige y tú repites.'] },
  { id: 3, t: 'Fuerte de almohadas', mats: ['almohadas', 'cobija'], age: [2, 9], min: 25, sk: 'creatividad', energy: 'Movida', why: 'Planeación, equilibrio y juego simbólico.', steps: ['Usen sillas o el sillón como paredes.', 'Cubran con la cobija y refuercen con almohadas.', 'Decidan juntos qué es: castillo, cueva o nave.', 'Lean o cuenten un cuento adentro para cerrar.'] },
  { id: 4, t: 'Masa casera', mats: ['harina', 'sal', 'agua'], age: [2, 7], min: 30, sk: 'motricidad', energy: 'Tranquila', why: 'Fuerza en manos y dedos, preparación para escribir.', steps: ['Mezclen 2 tazas de harina con 1 taza de sal.', 'Agreguen agua poco a poco hasta que no se pegue.', 'Hagan bolitas, víboras y figuras de animales.', 'Guarden la masa en una bolsa cerrada para otro día.'] },
  { id: 5, t: 'Camino de cinta', mats: ['cinta'], age: [2, 8], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Equilibrio y coordinación.', steps: ['Pega en el piso una línea recta, una en zigzag y una curva.', 'Caminen sobre ellas como equilibristas.', 'Prueben de puntitas, de lado y saltando.', 'Agreguen una regla: si pisas fuera, regresas al inicio.'] },
  { id: 6, t: 'Teatro de sombras', mats: ['linterna', 'papel', 'tijeras'], age: [3, 9], min: 20, sk: 'lenguaje', energy: 'Tranquila', why: 'Narración, vocabulario y secuencias.', steps: ['Recorten siluetas de animales en papel (el adulto usa las tijeras con los más pequeños).', 'Apaguen la luz y apunten la linterna a la pared.', 'Inventen una historia con las sombras.', 'Pídele que cuente el final de la historia.'] },
  { id: 7, t: 'Collar de pasta', mats: ['pasta', 'cuerda'], age: [3, 7], min: 20, sk: 'motricidad', energy: 'Tranquila', why: 'Pinza fina y patrones.', steps: ['Usa pasta con hoyo (penne o macarrón) y un cordón con cinta en la punta.', 'Hagan una secuencia: 2 largas, 1 corta.', 'Pídele que continúe el patrón solo.', 'Regálenlo a alguien de la familia.'] },
  { id: 8, t: 'Tapas por color', mats: ['tapas', 'vasos'], age: [2, 5], min: 10, sk: 'logica', energy: 'Tranquila', why: 'Clasificar, contar y comparar cantidades.', steps: ['Junta tapas de distintos colores.', 'Pon un vaso por color.', 'Pídele que clasifique cada tapa en su vaso.', 'Cuenten cuántas hay de cada color y cuál ganó.'] },
  { id: 9, t: 'Boliche de vasos', mats: ['vasos', 'calcetines'], age: [3, 9], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Puntería y suma de puntos.', steps: ['Arma una pirámide con 6 o 10 vasos.', 'Haz una pelota enrollando calcetines.', 'Tiren desde una línea de cinta o un zapato.', 'Anoten cuántos vasos cayeron en cada tiro.'] },
  { id: 10, t: 'Cuento en una caja', mats: ['caja', 'papel', 'crayones'], age: [4, 10], min: 30, sk: 'lenguaje', energy: 'Tranquila', why: 'Estructura narrativa y expresión oral.', steps: ['Dibujen 4 escenas en hojas: inicio, problema, ayuda y final.', 'Peguen las hojas dentro de la caja como escenario.', 'Que tu hijo narre la historia moviendo un personaje.', 'Graben la voz si quieren compartirla con la abuela.'] },
  { id: 11, t: 'Trasvasar agua', mats: ['agua', 'vasos', 'cucharas'], age: [1, 4], min: 15, sk: 'calma', energy: 'Tranquila', why: 'Concentración y control del movimiento.', steps: ['Pon una toalla en la mesa y dos vasos, uno con agua.', 'Pásenla con la cuchara de un vaso al otro.', 'Marquen con cinta hasta dónde llenar.', 'Al final, que ayude a secar todo.'] },
  { id: 12, t: 'Búsqueda del tesoro', mats: ['papel', 'crayones'], age: [5, 10], min: 25, sk: 'logica', energy: 'Movida', why: 'Lectura, deducción y orientación.', steps: ['Escribe o dibuja 5 pistas que lleven de un lugar a otro.', 'Esconde la última junto a un pequeño premio.', 'Si aún no lee, usa dibujos en las pistas.', 'Para cerrar, que esconda pistas para ti.'] },
];

export const RECIPES = [
  { id: 1, t: 'Hot cakes de plátano', by: 'Mamá', age: '1+', alg: ['Huevo'], min: 15, ing: ['1 plátano maduro', '2 huevos', '1/2 taza de avena'], steps: ['Machaca el plátano.', 'Mezcla con huevos y avena.', 'Cocina porciones pequeñas en sartén a fuego medio.'] },
  { id: 2, t: 'Sopa de fideo de la abuela', by: 'Abuela Carmen', age: '1+', alg: ['Gluten'], min: 25, ing: ['1 paquete de fideo', '2 jitomates', '1/4 de cebolla', '1 l de caldo de pollo'], steps: ['Dora el fideo en poco aceite.', 'Licúa jitomate con cebolla y agrégalo.', 'Añade el caldo y cocina 10 min.'] },
  { id: 3, t: 'Tacos de pollo con aguacate', by: 'Papá', age: '2+', alg: [], min: 20, ing: ['300 g de pollo deshebrado', 'Tortillas de maíz', '1 aguacate', '2 limones'], steps: ['Calienta las tortillas.', 'Rellena con pollo.', 'Agrega aguacate machacado con limón.'] },
  { id: 4, t: 'Paletas de mango y yogur', by: 'Tío Luis', age: '1+', alg: ['Lácteos'], min: 10, ing: ['1 mango', '1 taza de yogur natural'], steps: ['Licúa el mango con el yogur.', 'Sirve en moldes.', 'Congela 4 horas.'] },
  { id: 5, t: 'Lentejas con arroz', by: 'Mamá', age: '1+', alg: [], min: 40, ing: ['1 taza de lentejas', '1 taza de arroz', '1 zanahoria', '1/4 de cebolla'], steps: ['Cuece las lentejas con zanahoria y cebolla.', 'Prepara el arroz aparte.', 'Sirve juntos con un chorrito de limón.'] },
];

export const MENU = [['Lun', 2], ['Mar', 3], ['Mié', 5], ['Jue', 1], ['Vie', 4]];

export const AISLES = [
  ['Frutas y verduras', /plátano|jitomate|cebolla|aguacate|limón|limones|mango|zanahoria|fruta/i],
  ['Lácteos y huevo', /huevo|yogur|leche|queso/i],
  ['Carnes', /pollo|carne|pescado/i],
  ['Abarrotes', /./],
];
export const aisleOf = (n) => AISLES.find(([, r]) => r.test(n))[0];

export const MILESTONES = {
  sofi: [['m1', 'Salta en un pie', 5], ['m2', 'Dibuja una persona con 3 partes', 10], ['m3', 'Cuenta 10 objetos', 8], ['m4', 'Se viste sola con poca ayuda', null], ['m5', 'Cuenta una historia corta', 6], ['m6', 'Ensarta cuentas o pasta', 7]],
  mateo: [['n1', 'Lee frases cortas en voz alta', 12], ['n2', 'Ata sus agujetas', null], ['n3', 'Suma y resta hasta 20', 9], ['n4', 'Sigue instrucciones de 3 pasos', 12], ['n5', 'Camina en línea recta sin caerse', 5]],
};

export const CHORES = {
  sofi: [['Recoger juguetes', 5], ['Lavarse los dientes sin recordar', 3], ['Ayudar a poner la mesa', 5], ['Dormir en su cama', 5]],
  mateo: [['Hacer la tarea solo', 5], ['Poner la mesa', 5], ['Bañarse sin repelar', 3], ['Leer 15 minutos', 5]],
};
// Hitos y quehaceres: hay listas de ejemplo para Sofi y Mateo; para cualquier otro niño se usan según su edad.
const ageList = (kk) => (KIDS[kk] && KIDS[kk].age <= 5 ? 'sofi' : 'mateo');
export const milestonesOf = (kk) => MILESTONES[kk] || MILESTONES[ageList(kk)].map(([id, t, a]) => [`${kk}-${id}`, t, a]);
export const choresOf = (kk) => CHORES[kk] || CHORES[ageList(kk)];
export const REWARDS = [['Cuento extra', 10], ['Elegir la cena del viernes', 20], ['Parque con papá el sábado', 30]];

export const CAMS = [
  { id: 'c1', n: 'Cuarto de Sofi', type: 'Monitor de bebé', via: 'Se abre en la app del fabricante', sensor: '22 °C · 48 % humedad' },
  { id: 'c2', n: 'Sala', type: 'Cámara Wi-Fi', via: 'Conectada vía Google Home', sensor: null },
];
export const CAM_EVENTS = [
  { cam: 'c1', t: '15:12', txt: 'Movimiento en la cuna' },
  { cam: 'c1', t: '15:40', txt: 'Llanto detectado durante 2 min' },
  { cam: 'c2', t: '16:05', txt: 'Persona detectada en la sala' },
];
export const ARRIVALS = [
  { who: 'carmen', place: 'Kínder Montessori', t: '13:56' },
  { who: 'carmen', place: 'Casa', t: '14:31' },
  { who: 'jorge', place: 'Club de natación', t: '17:22' },
];

export const SRC = {
  familia: { n: 'Tribbu familiar', l: 'T', color: 'sun' },
  google: { n: 'Google · personal', l: 'G', color: 'leaf' },
  outlook: { n: 'Outlook · trabajo', l: 'O', color: 'sky' },
  icloud: { n: 'iCloud · personal', l: 'i', color: 'berry' },
};

// ---------- Fechas ----------
export const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
export const dk = (d) => { const z = new Date(d); return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, '0')}-${String(z.getDate()).padStart(2, '0')}`; };
export const addD = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
export const fromKey = (k) => new Date(k + 'T12:00:00');
export const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const addMin = (t, n) => { const m = mins(t) + n; return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
export const overlaps = (a, b) => mins(a.time) < mins(b.end) && mins(b.time) < mins(a.end);
export const evKey = (e) => `${e.d}|${e.time}|${e.t}`;
export const now = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
export const todayIdx = (today.getDay() + 6) % 7; // 0 = lunes
export const money = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const dayShort = (d) => DAYS[d.getDay()].slice(0, 3);
export const dayLong = (d) => `${DAYS[d.getDay()]} ${d.getDate()}`;
export const dateLong = (d) => `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;

const E = (n, time, t, kid, tag) => ({ d: dk(addD(n)), time, t, kid, tag });
export const BASE_EVENTS = [
  E(0, '08:00', 'Entrada al kínder', 'sofi', 'Escuela'),
  E(0, '14:00', 'Abuela Carmen recoge a Sofi', 'sofi', 'Turno'),
  E(0, '16:30', 'Clase de ballet', 'sofi', 'Clase'),
  E(0, '17:30', 'Natación', 'mateo', 'Clase'),
  E(1, '10:30', 'Vacuna de refuerzo (DPT)', 'sofi', 'Salud'),
  E(1, '16:00', 'Tarea de ciencias: maqueta', 'mateo', 'Escuela'),
  E(2, '19:00', 'Junta de padres', 'mateo', 'Escuela'),
  E(3, '12:00', 'Comida familiar en casa de los abuelos', 'sofi', 'Familia'),
  E(5, '11:00', 'Cumpleaños de Valentina', 'sofi', 'Familia'),
];
export const EXT_EVENTS = [
  ['outlook', 0, '09:00', '11:00', 'Junta con dirección'], ['outlook', 1, '10:00', '12:00', 'Revisión trimestral'],
  ['outlook', 2, '08:00', '18:00', 'Viaje a Monterrey'], ['google', 1, '18:30', '19:30', 'Dentista'],
  ['icloud', 3, '20:00', '22:00', 'Cena con amigos'], ['icloud', 0, '19:30', '20:30', 'Clase de yoga'],
].map(([src, n, time, end, t]) => ({ src, d: dk(addD(n)), time, end, t }));

// ---------- Estado inicial ----------
export function fresh() {
  const k = (i) => evKey(BASE_EVENTS[i]);
  return {
    v: 1, kid: 'sofi', role: 'padres', view: 'hoy', jtab: 'act', ctab: 'menu', skill: null,
    have: ['calcetines', 'cucharas', 'ollas', 'vasos', 'papel', 'crayones', 'cinta', 'agua'],
    tasks: [
      { id: 1, t: 'Comprar pañales talla 4', who: 'yo', done: false },
      { id: 2, t: 'Recoger a Sofi del kínder a las 14:00', who: 'carmen', done: false },
      { id: 5, t: 'Merienda de Sofi a las 17:00 (sin cacahuate)', who: 'carmen', done: false },
      { id: 3, t: 'Llevar a Mateo a natación', who: 'jorge', done: false },
      { id: 4, t: 'Firmar permiso de excursión', who: 'papa', done: true },
    ],
    myrecs: [],
    feed: [
      { id: 1, who: 'carmen', kid: 'sofi', kind: 'Comió', txt: 'Se comió toda la sopa y media quesadilla.', t: '14:40', lvl: 'info' },
      { id: 2, who: 'carmen', kid: 'sofi', kind: 'Siesta', txt: 'Durmió de 15:10 a 16:20.', t: '16:22', lvl: 'info' },
      { id: 3, who: 'jorge', kid: 'mateo', kind: 'Mensaje', txt: 'Mateo dice que le duele un poco la garganta, ya le di agua tibia. ¿Le damos algo?', t: '17:05', lvl: 'atencion' },
    ],
    cal: { google: { on: true, mode: 'ocupado' }, outlook: { on: true, mode: 'ocupado' }, icloud: { on: false, mode: 'detalle' } },
    myevents: [],
    shop: [{ id: 1, t: 'Pañales talla 4', a: 'Abarrotes', done: false }, { id: 2, t: 'Leche entera', a: 'Lácteos y huevo', done: false }],
    docs: [
      { id: 1, t: 'Cartilla Nacional de Vacunación', kid: 'sofi', kind: 'Salud', note: 'Próxima: refuerzo DPT, mañana', shared: true },
      { id: 2, t: 'Póliza de gastos médicos', kind: 'Seguro', note: 'Vigente hasta mar 2027', shared: true },
      { id: 3, t: 'Acta de nacimiento', kid: 'sofi', kind: 'Identidad', shared: false },
      { id: 4, t: 'CURP', kid: 'sofi', kind: 'Identidad', shared: false },
      { id: 5, t: 'Receta: amoxicilina', kid: 'mateo', kind: 'Salud', note: 'Dra. Ruiz · 2 oct', shared: false },
      { id: 6, t: 'Boleta 1er bimestre', kid: 'mateo', kind: 'Escuela', shared: false },
      { id: 7, t: 'Cartilla Nacional de Vacunación', kid: 'mateo', kind: 'Salud', note: 'Esquema completo', shared: true },
    ],
    exp: [
      { id: 1, t: 'Colegiatura del kínder (octubre)', amt: 4800, paid: 'yo', split: 50 },
      { id: 2, t: 'Pediatra (consulta de Mateo)', amt: 900, paid: 'papa', split: 50 },
      { id: 3, t: 'Natación (mensualidad)', amt: 1100, paid: 'papa', split: 50 },
      { id: 4, t: 'Uniforme de ballet', amt: 650, paid: 'yo', split: 50 },
    ],
    copa: false, pts: { sofi: 14, mateo: 26 }, mile: { m1: true, m3: true, n1: true, n5: true },
    evchat: {
      [k(2)]: [{ who: 'yo', txt: 'La mochila de ballet está junto a la puerta. Las zapatillas van adentro.', t: '08:05' }],
      [k(8)]: [{ who: 'papa', txt: '¿Quién compra el regalo?', t: '09:12' }, { who: 'carmen', txt: 'Yo paso a la juguetería el viernes.', t: '09:40' }],
      [k(4)]: [{ who: 'yo', txt: 'Lleven la cartilla, está en Documentos.', t: '07:50' }],
    },
    locs: { carmen: true, jorge: true }, camlog: true, summary: null,
  };
}

// ---------- Datos de ejemplo vs. familia real ----------
// Las pantallas leen KIDS, PEOPLE, SHIFT, MEMBERS… directamente. Aquí se cambian "en su lugar" entre la
// demostración y los datos de la familia que inició sesión.
const clone = (x) => JSON.parse(JSON.stringify(x));
const setObj = (t, src) => { Object.keys(t).forEach((k) => { delete t[k]; }); Object.assign(t, src); };
const setArr = (t, src) => { t.splice(0, t.length, ...src); };
const DEMO = {
  KIDS: clone(KIDS), PEOPLE: clone(PEOPLE), PARENTS: [...PARENTS], SHIFT: { ...SHIFT }, MEMBERS: clone(MEMBERS),
  BASE_EVENTS: clone(BASE_EVENTS), EXT_EVENTS: clone(EXT_EVENTS), ARRIVALS: clone(ARRIVALS), CAMS: clone(CAMS), CAM_EVENTS: clone(CAM_EVENTS),
};
export function setDemoWorld() {
  setObj(KIDS, clone(DEMO.KIDS)); setObj(PEOPLE, clone(DEMO.PEOPLE)); setArr(PARENTS, DEMO.PARENTS); setObj(SHIFT, { ...DEMO.SHIFT });
  setArr(MEMBERS, clone(DEMO.MEMBERS)); setArr(BASE_EVENTS, clone(DEMO.BASE_EVENTS)); setArr(EXT_EVENTS, clone(DEMO.EXT_EVENTS));
  setArr(ARRIVALS, clone(DEMO.ARRIVALS)); setArr(CAMS, clone(DEMO.CAMS)); setArr(CAM_EVENTS, clone(DEMO.CAM_EVENTS));
}
// kids: filas de la tabla kids [{key, data}]; members: filas de members; meKey: person_key de quien inició sesión.
export function setFamilyWorld({ kids, members, meKey }) {
  const k = {};
  kids.forEach((r) => {
    k[r.key] = { allergy: 'Ninguna conocida', blood: 'Sin registrar', ped: 'Sin registrar', ins: 'Sin registrar', routine: [], age: 0, ...r.data };
  });
  setObj(KIDS, k);
  const people = {};
  members.forEach((m) => { people[m.person_key] = [m.display_name, (m.display_name[0] || '?').toUpperCase(), m.display_name]; });
  setObj(PEOPLE, people);
  setArr(PARENTS, members.filter((m) => m.role === 'parent').map((m) => m.person_key));
  setArr(MEMBERS, members.map((m) => ({ key: m.person_key, name: m.display_name, role: m.role, kid: m.kid_key, from: m.shift_from, to: m.shift_to })));
  const mine = members.find((m) => m.person_key === meKey);
  const cg = mine && mine.role === 'caregiver' ? mine : members.find((m) => m.role === 'caregiver');
  setObj(SHIFT, cg
    ? { who: cg.person_key, kid: cg.kid_key, from: cg.shift_from, to: cg.shift_to }
    : { who: '', kid: Object.keys(k)[0] || '', from: '00:00', to: '23:59' });
  [BASE_EVENTS, EXT_EVENTS, ARRIVALS, CAMS, CAM_EVENTS].forEach((a) => setArr(a, []));
}

// ---------- Derivados según el rol ----------
export const isCG = (S) => S.role === 'cuidador';
export const kidKey = (S) => (isCG(S) ? SHIFT.kid : S.kid);
export const isCloud = (S) => !!S.cloud;
export const me = (S) => S.me || (isCG(S) ? 'carmen' : 'yo');

export function dayEvents(S, d) {
  const fam = [...BASE_EVENTS.filter((e) => e.d === d), ...S.myevents.filter((e) => e.d === d)]
    .map((e) => ({ ...e, src: 'familia', end: e.end || addMin(e.time, 60) }));
  const ext = EXT_EVENTS.filter((e) => e.d === d && S.cal[e.src] && S.cal[e.src].on);
  const all = [...fam, ...ext].sort((a, b) => mins(a.time) - mins(b.time));
  return { fam, ext, all };
}
export const inShift = (e) => e.d === dk(today) && e.kid === SHIFT.kid && mins(e.time) >= mins(SHIFT.from) && mins(e.time) < mins(SHIFT.to);
export const allRecipes = (S) => [...S.myrecs, ...RECIPES];
