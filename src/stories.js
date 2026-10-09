// Cuentos armados por Tribbu: eliges un tema y quiénes son los personajes (los niños, los papás o cuidadores, o un
// personaje imaginario) y se arma una historia de 7 párrafos con un final tranquilo.
// Son plantillas escritas a mano, NO inventadas por IA; con la IA real (fase 3) podrán ser cuentos totalmente libres.
//
// Cómo se escriben las plantillas:
//   {N}  nombres de los protagonistas ("Sofi", "Sofi y Mateo", "Sofi, Mateo y Abuela Carmen")
//   {h}  nombre corto del ayudante;  {H}  presentación del ayudante («Tito, un tiranosaurio…»)
//   {v:singular|plural}  se elige según haya uno o varios protagonistas (los verbos y frases cambian)
//   {lugar} {objeto}  se elige al azar entre las opciones del tema; {Lugar} {Objeto} lo mismo con mayúscula inicial.
// No se usan adjetivos con género para los protagonistas (no sabemos si son niño o niña): se usan frases como «con una gran sonrisa».

export const IMAGINARY = [
  { name: 'Chispa', desc: 'un dragoncito de ojos brillantes' },
  { name: 'Tuerca', desc: 'un robot curioso que siempre hace preguntas' },
  { name: 'Brisa', desc: 'un hada del viento' },
  { name: 'Pompón', desc: 'un osito hecho de nubes' },
  { name: 'Luna', desc: 'una zorrita que conoce todos los caminos' },
  { name: 'Bruma', desc: 'un fantasma amable al que le gusta la luz de las velas' },
];

export const THEMES = [
  {
    id: 'dino', name: 'Dinosaurios', blurb: 'Una aventura para encontrar algo perdido.', value: 'calma y atención',
    helper: { n: 'Tito', d: 'un tiranosaurio pequeñito de ojos brillantes' },
    slots: { lugar: ['la isla de los helechos gigantes', 'el valle de los volcanes dormidos', 'la selva de los árboles altísimos'], objeto: ['un huevo enorme y moteado', 'un huevo pequeño de color azul', 'un huevo con rayitas doradas'] },
    title: 'El huevo perdido',
    paras: [
      'Había una vez {lugar}, un lugar donde los dinosaurios vivían sin prisa. Un día, {N} {v:llegó|llegaron} de visita con una mochila llena de curiosidad.',
      'Junto al río estaba {H}. —¡Qué bueno que {v:llegaste|llegaron}! —dijo {h}—. Alguien perdió {objeto} y su mamá dinosaurio está muy preocupada.',
      '{N} {v:miró|miraron} a su alrededor. El huevo había rodado colina abajo y no se veía por ningún lado. Había huellas enormes, un charco y un camino lleno de piedras. No sería fácil encontrarlo.',
      '{v:Primero buscó a toda prisa|Primero buscaron a toda prisa}, pero no {v:encontró|encontraron} nada. {v:Sintió|Sintieron} un poco de miedo, porque la noche se acercaba.',
      'Entonces {v:respiró|respiraron} hondo, {v:escuchó|escucharon} con atención y {v:se dio|se dieron} cuenta de algo: ¡el huevo hacía «toc, toc, toc» desde detrás de los helechos! {h} sonrió: —A veces hay que parar un momento para encontrar lo que buscamos.',
      '{N} {v:se acercó|se acercaron} despacito y {v:cargó|cargaron} el huevo con mucho cuidado. Al regresarlo, la mamá dinosaurio dio un abrazo enorme con su cola gigante. —¡Muchas gracias por no rendirse! —dijo.',
      'Esa noche, {N} {v:se despidió|se despidieron} de {h} y {v:volvió|volvieron} a casa con una gran sonrisa. {v:Había aprendido|Habían aprendido} que con calma, atención y la ayuda de los amigos se pueden encontrar hasta las cosas más difíciles. Fin.',
    ],
    ask: ['¿Qué {v:hizo|hicieron} {N} cuando no {v:podía|podían} encontrar el huevo?', '¿Cuándo te ha servido a ti parar un momento y escuchar con atención?'],
  },
  {
    id: 'espacio', name: 'Espacio', blurb: 'Un viaje entre las estrellas antes de dormir.', value: 'curiosidad y valentía',
    helper: { n: 'Estrellita', d: 'una estrella pequeña que se perdió de su constelación' },
    slots: { lugar: ['un cohete plateado', 'una nave con ventanas redondas', 'un cohete hecho de cartón que de pronto cobró vida'], objeto: ['la Luna', 'un planeta de anillos naranjas', 'una nube de polvo brillante'] },
    title: 'La estrella perdida',
    paras: [
      'Una noche en que el sueño no llegaba, {N} {v:encontró|encontraron} {lugar} en el patio. —¡Tres, dos, uno… despegue! —{v:gritó|gritaron}.',
      'El cohete subió más y más, hasta que las luces de la ciudad parecían puntitos. Allá arriba esperaba {H}.',
      '—Estoy perdida —dijo {h}—. Mi constelación se apagó y no sé cómo volver. ¿{v:Me ayudas|Me ayudan} a encontrar el camino?',
      'Para llegar tenían que pasar junto a {objeto}. El cielo estaba muy oscuro y silencioso, y {N} {v:sintió|sintieron} un poquito de nervios.',
      '{N} {v:respiró|respiraron} lento, {v:miró|miraron} con atención y {v:descubrió|descubrieron} que la oscuridad no estaba vacía: estaba llena de estrellitas que brillaban para marcar el camino.',
      'Siguiendo la luz más brillante, {h} reconoció su lugar. —¡Es aquí! —gritó—. Las estrellas de su constelación se encendieron una por una y todo el cielo se llenó de colores.',
      'De regreso, el cohete aterrizó suavemente. {N} {v:se metió|se metieron} a la cama y, antes de cerrar los ojos, {v:miró|miraron} por la ventana: allá arriba, una estrellita guiñaba un ojo. {v:Se durmió|Se durmieron} en paz. Fin.',
    ],
    ask: ['¿Qué {v:sintió|sintieron} {N} cuando el cielo estaba oscuro y qué {v:hizo|hicieron} para sentirse mejor?', 'Si pudieras viajar al espacio, ¿a qué lugar irías?'],
  },
  {
    id: 'bosque', name: 'Animales del bosque', blurb: 'Pedir ayuda y trabajar en equipo.', value: 'cooperar y pedir ayuda',
    helper: { n: 'Nuez', d: 'una ardilla muy trabajadora' },
    slots: { lugar: ['el bosque de los pinos cantores', 'el bosque donde el río hace cosquillas', 'el bosque de las hojas doradas'], objeto: ['el puente de ramas', 'la casita de hojas', 'el camino de piedras'] },
    title: 'El puente del bosque',
    paras: [
      'Había una vez {lugar}, donde los animales vivían como buenos vecinos. Una mañana, {N} {v:salió|salieron} a caminar y {v:escuchó|escucharon} un llanto pequeñito.',
      'Era {H}. —Se rompió {objeto} que usamos todos —dijo {h} entre sollozos—. Pesa muchísimo y yo sola no puedo arreglarlo.',
      '{N} {v:probó|probaron} empujar la rama más grande, pero no se movió ni un poquito. {v:Lo intentó|Lo intentaron} otra vez y otra vez. Nada.',
      '—Tal vez necesitamos más manos —{v:pensó|pensaron}. Entonces {v:fue|fueron} a pedir ayuda: el conejo trajo cuerdas, la tortuga puso sus hombros fuertes y los pájaros llevaron hojas para tapar los huecos.',
      'Todos juntos empujaron al mismo tiempo, contando: «¡una, dos y tres!». La rama se movió, rodó y quedó justo en su lugar.',
      '{Objeto} quedó más firme que antes. Los animales aplaudieron y {h} preparó una merienda de nueces y frutas para todos.',
      '{N} {v:volvió|volvieron} a casa con las manos llenas de tierra y el corazón lleno de alegría. {v:Había aprendido|Habían aprendido} que pedir ayuda no es de débiles: es la forma más inteligente de lograr cosas grandes. Fin.',
    ],
    ask: ['¿A quién {v:pidió|pidieron} ayuda {N} y cómo se resolvió el problema?', '¿Cuándo te ha ayudado alguien cuando algo era muy pesado o difícil?'],
  },
  {
    id: 'mar', name: 'Mar y tesoros', blurb: 'Una búsqueda del tesoro en equipo.', value: 'compartir y trabajar juntos',
    helper: { n: 'Perlita', d: 'una tortuga marina de caparazón brillante' },
    slots: { lugar: ['el mar de las olas azules', 'una bahía de arena blanca', 'un arrecife lleno de colores'], objeto: ['un mapa roto en cuatro pedazos', 'un cofre cerrado con un candado de conchas', 'una botella con un mensaje secreto'] },
    title: 'El tesoro del mar',
    paras: [
      'En {lugar}, el sol brillaba sobre el agua. {N} {v:caminaba|caminaban} por la orilla cuando {v:vio|vieron} algo extraño entre las olas: {objeto}.',
      'De pronto, una cabecita asomó del agua. Era {H}. —Ese objeto lleva a un tesoro escondido —susurró {h}—, pero solo se encuentra si se busca con paciencia.',
      '{N} {v:siguió|siguieron} las pistas por la arena: una concha en forma de estrella, una piedra con un dibujo, una huella de cangrejo. Cada pista llevaba a la siguiente.',
      'En un punto, el camino se cortó. Había un charco enorme y no se podía pasar. {N} {v:se detuvo|se detuvieron} a pensar. —Si usamos esta tabla como puente… —dijo {h}.',
      'Pasaron con cuidado, uno por uno, ayudándose a no resbalar. Al otro lado encontraron una cueva brillante y, en el fondo, un cofre.',
      'Adentro no había oro. Había cientos de perlas de colores. —Son para compartir —explicó {h}—. Así el mar siempre tiene tesoros para todos. Cada quien eligió una y dejó las demás para el siguiente explorador.',
      '{N} {v:regresó|regresaron} a casa con una perla en la mano y un recuerdo en el corazón. {v:Entendió|Entendieron} que lo más valioso de una aventura no es lo que se gana, sino lo que se comparte. Fin.',
    ],
    ask: ['¿Qué había dentro del cofre y qué {v:decidió|decidieron} hacer {N}?', '¿Qué cosa te gusta compartir con otras personas?'],
  },
  {
    id: 'dormir', name: 'La hora de dormir', blurb: 'Para calmarse y dormir sin miedo.', value: 'calma y respirar',
    helper: { n: 'Sueño', d: 'un búho de plumas suaves que cuida las noches' },
    slots: { lugar: ['el cuarto', 'la habitación de las sombras amistosas', 'la casa en silencio'], objeto: ['una sombra alargada en la pared', 'un ruidito en la ventana', 'un rincón muy oscuro'] },
    title: 'El búho de las noches',
    paras: [
      'Era hora de dormir. En {lugar} ya estaba todo listo: la cobija suave, el peluche favorito y la luz bajita. Pero {N} {v:no podía|no podían} cerrar los ojos.',
      'Había {objeto}. {N} {v:se quedó|se quedaron} mirando con atención y {v:sintió|sintieron} un cosquilleo en la panza. —Qué raro —{v:pensó|pensaron}—, ¿será algo que da miedo?',
      'Justo entonces apareció, volando muy despacito, {H}. —No te asustes —dijo {h} con voz de terciopelo—. Vengo a enseñarte un secreto para las noches.',
      '—Pon las manos en la panza —dijo {h}—. Respira por la nariz y, al soltar el aire, imagina que sale un globo grandote. Inflar… y desinflar. Inflar… y desinflar.',
      '{N} {v:respiró|respiraron} así cinco veces. La panza dejó de cosquillear y el cuerpo se sintió pesadito y calientito, como cuando uno se mete a la cama en invierno.',
      'Con la luz que entraba por la ventana, {N} {v:descubrió|descubrieron} que {objeto} no era nada peligroso: solo era una de las sombras amistosas que cuidan el cuarto por la noche.',
      '—Buenas noches —susurró {h}—. Cada vez que tengas miedo, respira como globo. Y {N} {v:se durmió|se durmieron} en paz, soñando con un cielo lleno de estrellas. Fin.',
    ],
    ask: ['¿Qué le enseñó {h} a {N} para estar en calma antes de dormir?', '¿Quieres que practiquemos «respirar como globo» juntos?'],
  },
  {
    id: 'enojo', name: 'Cuando me enojo', blurb: 'Entender el enojo y calmarse.', value: 'nombrar lo que sentimos',
    helper: { n: 'Volcancito', d: 'un volcán pequeñito que a veces también se enoja' },
    slots: { lugar: ['el parque de los columpios', 'la sala llena de juguetes', 'la playa de arena suave'], objeto: ['una torre altísima de bloques', 'un dibujo muy bonito', 'un castillo de arena'] },
    title: 'El volcán que se enoja',
    paras: [
      'En {lugar}, {N} {v:se concentraba|se concentraban} en una tarea especial: {v:había hecho|habían hecho} {objeto}. Era lo más bonito que había hecho en todo el día.',
      '¡Pum! Algo se cayó y {objeto} se deshizo en mil pedazos. {N} {v:sintió|sintieron} que en la panza se encendía algo caliente, que subía por el pecho y llegaba hasta la cabeza.',
      'En ese momento llegó {H}. —Yo también me enojo —dijo {h}—. Cuando algo me sale mal, me pongo rojo y hago «¡pffff!». ¿Te pasa igual?',
      '—Hay un truco —dijo {h}—. Primero, alto: quedarse quieto como estatua. Segundo, respirar hondo contando hasta cinco. Tercero, decir en voz alta: «Me enojé porque…».',
      '{N} {v:se quedó|se quedaron} sin moverse, {v:respiró|respiraron} contando hasta cinco y {v:dijo|dijeron}: «Me enojé porque mi trabajo se rompió». Poco a poco el calor bajó, como cuando se apaga una estufa.',
      '—Gracias por esperar —dijo {h}—. Ahora que ya respiraste y estás en calma, ¿qué quieres hacer? —{v:Quiero|Queremos} volver a empezar, pero esta vez más abajo y con una base más grande —{v:contestó|contestaron}.',
      'Y así lo hicieron, con ayuda de {h}. Esta vez el resultado quedó todavía mejor. {N} {v:aprendió|aprendieron} que enojarse es normal, y que se puede aprender a calmarse para que el enojo no mande. Fin.',
    ],
    ask: ['¿Qué {v:hizo|hicieron} {N} para calmarse cuando {v:sintió|sintieron} enojo?', '¿Qué haces tú cuando sientes que te enojas? ¿Probamos el truco de {h}?'],
  },
  {
    id: 'compartir', name: 'Compartir y turnos', blurb: 'Cuando solo hay uno y todos lo quieren.', value: 'compartir y esperar turnos',
    helper: { n: 'Brincos', d: 'un conejo muy platicador' },
    slots: { lugar: ['la plaza del pueblo', 'el patio de la escuela', 'el jardín de las flores grandes'], objeto: ['un columpio', 'una pelota roja', 'una caja de colores'] },
    title: 'El turno de todos',
    paras: [
      'Una tarde, en {lugar}, {N} {v:encontró|encontraron} {objeto}. ¡Era justo lo que quería! Pero había un pequeño problema: solo había uno, y otros niños también lo querían.',
      '—¡Es mío! —dijo alguien. —¡No, yo lo vi primero! —dijo otro. Se juntó un montón de voces y nadie escuchaba a nadie.',
      'Entonces llegó saltando {H}. —¡Alto, alto, alto! —dijo {h}—. Así nadie va a jugar. ¿Y si probamos otra forma?',
      '—Cada quien tendrá un turno —propuso {h}—. Contamos hasta veinte en voz alta y después le toca a quien sigue. Mientras esperan, pueden hacer porras o inventar un juego.',
      '{N} {v:tuvo|tuvieron} el primer turno y {v:disfrutó|disfrutaron} cada momento. Cuando llegó a veinte, {v:entregó|entregaron} el turno con una sonrisa. ¡Y se sintió bonito ver la cara de alegría de quien seguía!',
      'Entre turno y turno, todos se pusieron a inventar juegos. Descubrieron que esperar era más divertido en compañía, y que compartir hacía el juego más grande.',
      'Al final, {N} {v:regresó|regresaron} a casa con más amigos que al llegar. {v:Aprendió|Aprendieron} que cuando se comparte, la alegría no se acaba: se multiplica. Fin.',
    ],
    ask: ['¿Qué idea tuvo {h} para que todos pudieran jugar?', '¿Cuándo te ha tocado esperar tu turno? ¿Cómo te sentiste?'],
  },
  {
    id: 'dientes', name: 'Lavarse los dientes', blurb: 'La misión de los dientes brillantes.', value: 'cuidar el cuerpo',
    helper: { n: 'Cepillín', d: 'un cepillo de dientes aventurero' },
    slots: { lugar: ['el Reino de las Sonrisas', 'la Ciudad Brillante', 'el Valle de los Dientes Fuertes'], objeto: ['una canción de dos minutos', 'un cepillo de cerdas suaves', 'un poquito de pasta del tamaño de un chícharo'] },
    title: 'Los monstruitos del azúcar',
    paras: [
      'Dentro de la boca hay un lugar muy especial: {lugar}. Allí viven los dientes, blancos y fuertes, que ayudan a morder, a reír y a decir palabras.',
      'Una noche, mientras todos dormían, unos monstruitos pequeñitos y pegajosos empezaron a caminar sobre los dientes. —¡Somos los monstruitos del azúcar! —se reían—. ¡Vamos a hacerles hoyitos!',
      'Los dientes se asustaron y gritaron pidiendo ayuda. Y llegó volando… ¡{H}! —¡No se preocupen! Yo sé cómo ahuyentar a esos monstruitos —dijo {h}.',
      'A la mañana siguiente, {N} {v:tomó|tomaron} a {h} y {v:usó|usaron} {objeto}. {v:Cepilló|Cepillaron} arriba, abajo, por delante y por detrás, sin olvidar las muelas del fondo.',
      '¡Fuera, monstruitos! Los monstruitos del azúcar se resbalaron, se marearon y salieron corriendo de la boca, enjuagados con agua fresca. Los dientes brillaban de felicidad.',
      'Desde ese día, {N} {v:se cepilla|se cepillan} por la mañana y por la noche, con calma y sin prisa, contando hasta cien o cantando una canción. Los monstruitos nunca más volvieron.',
      '{h} cuida cada rincón de la sonrisa. {N} {v:aprendió|aprendieron} que cuidar los dientes todos los días es una forma de quererse mucho. Y cada vez que sonríen, un diente guiña un ojo para decir «gracias». Fin.',
    ],
    ask: ['¿Cómo {v:ahuyentó|ahuyentaron} {N} a los monstruitos del azúcar?', '¿Quieres cantar una canción mientras nos lavamos los dientes esta noche?'],
  },
];

// ---- Generador ----
function rng(seed) {
  let t = (seed >>> 0) + 0x6d2b79f5;
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
export const joinNames = (names) => (names.length <= 1 ? names[0] || '' : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`);

// chars: { names: ['Sofi', 'Mateo'], imag: { name, desc } | null }
export function buildStory(themeId, chars, seed = 1) {
  const th = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const rand = rng(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const names = chars.names.filter(Boolean);
  const imag = chars.imag || null;
  const solo = !names.length && imag;
  const heroes = solo ? [imag.name] : names;
  const pl = heroes.length > 1;
  const helper = !solo && imag ? { n: imag.name, d: imag.desc } : th.helper;
  const slots = {};
  Object.keys(th.slots).forEach((k) => { slots[k] = pick(th.slots[k]); });
  const fill = (s) => s
    .replace(/\{v:([^|}]*)\|([^}]*)\}/g, (_, a, b) => (pl ? b : a))
    .replace(/\{N\}/g, joinNames(heroes))
    .replace(/\{h\}/g, helper.n)
    .replace(/\{H\}/g, `${helper.n}, ${helper.d}`)
    .replace(/\{(Lugar|Objeto)\}/g, (_, k) => cap(slots[k.toLowerCase()]))
    .replace(/\{(lugar|objeto)\}/g, (_, k) => slots[k]);
  return { theme: th.id, themeName: th.name, title: fill(th.title), paras: th.paras.map(fill), ask: th.ask.map(fill), heroes, helper: helper.n, seed };
}
