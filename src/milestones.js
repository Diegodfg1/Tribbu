// Catálogo de hitos del desarrollo por edad.
//
// Base: los «indicadores del desarrollo» del CDC de Estados Unidos (Aprenda los signos. Reaccione pronto), revisados en 2022:
// son cosas que el 75 % o más de los niños hace a esa edad. De 6 a 11 años el CDC no tiene lista de hitos; ahí se
// resumen sus «consejos de crianza positiva» como «lo que suele verse». Las frases están escritas con palabras de Tribbu.
// En México, la prueba oficial de tamizaje es la EDI (Evaluación del Desarrollo Infantil, Secretaría de Salud),
// de 1 mes a 5 años 11 meses; la aplica personal de salud. Esta lista NO la sustituye ni es un diagnóstico.
// (Este archivo no importa nada de data.js a propósito, para que data.js pueda usarlo.)

export const AREAS = {
  social: 'Social y emocional',
  lenguaje: 'Lenguaje y comunicación',
  cognitivo: 'Pensar y aprender',
  movimiento: 'Movimiento y cuerpo',
};

// m = meses de la edad de referencia. Los de 72 y 108 son «lo que suele verse» (tips).
export const MILE_AGES = [
  { m: 2, label: '2 meses' }, { m: 4, label: '4 meses' }, { m: 6, label: '6 meses' }, { m: 9, label: '9 meses' },
  { m: 12, label: '1 año' }, { m: 15, label: '15 meses' }, { m: 18, label: '18 meses' }, { m: 24, label: '2 años' },
  { m: 30, label: '2 años y medio' }, { m: 36, label: '3 años' }, { m: 48, label: '4 años' }, { m: 60, label: '5 años' },
  { m: 72, label: '6 a 8 años', tips: true }, { m: 108, label: '9 a 11 años', tips: true },
];

export const MILE_SOURCES = [
  { n: 'CDC · indicadores del desarrollo a los 5 años', url: 'https://www.cdc.gov/act-early/digital-online-checklist/5-years.html' },
  { n: 'CDC · indicadores del desarrollo a los 2 años', url: 'https://www.cdc.gov/act-early/milestones-in-action/2-years.html' },
  { n: 'CDC · crianza positiva, 6 a 8 años', url: 'https://www.cdc.gov/child-development/positive-parenting-tips/middle-childhood-6-8-years.html' },
  { n: 'CDC · crianza positiva, 9 a 11 años', url: 'https://www.cdc.gov/child-development/positive-parenting-tips/middle-childhood-9-11-years-old.html' },
];

export const MILE_NOTE = 'Los hitos son lo que la mayoría de los niños (75 % o más) hace a cada edad. No son un examen ni un diagnóstico: cada niño tiene su ritmo. Si algo te preocupa, coméntalo con tu pediatra. En México, la prueba EDI de la Secretaría de Salud (de 1 mes a 5 años 11 meses) la aplica personal de salud.';

// [meses, área, texto, id de actividad para practicarlo (opcional)]
const RAW = [
  [2, 'social', 'Se tranquiliza cuando alguien le habla o le hace cariño'],
  [2, 'social', 'Te mira a la cara'],
  [2, 'social', 'Se ve contento de verte cuando te acercas'],
  [2, 'social', 'Sonríe cuando le hablas o le sonríes'],
  [2, 'lenguaje', 'Hace sonidos además de llorar'],
  [2, 'lenguaje', 'Reacciona a los ruidos fuertes'],
  [2, 'cognitivo', 'Te sigue con la mirada cuando te mueves'],
  [2, 'cognitivo', 'Mira un juguete por varios segundos'],
  [2, 'movimiento', 'Levanta la cabeza cuando está boca abajo'],
  [2, 'movimiento', 'Mueve los dos brazos y las dos piernas'],
  [2, 'movimiento', 'Abre las manos por momentos'],

  [4, 'social', 'Sonríe por su cuenta para llamar tu atención'],
  [4, 'social', 'Se ríe un poquito cuando intentas hacerle gracia'],
  [4, 'social', 'Te mira, se mueve o hace sonidos para que le sigas poniendo atención'],
  [4, 'lenguaje', 'Hace sonidos como «oooo» y «aahh» (arrullos)'],
  [4, 'lenguaje', 'Te responde con sonidos cuando le hablas'],
  [4, 'lenguaje', 'Voltea hacia el sonido de tu voz'],
  [4, 'cognitivo', 'Si tiene hambre, abre la boca al ver el pecho o el biberón'],
  [4, 'cognitivo', 'Mira sus manos con interés'],
  [4, 'movimiento', 'Sostiene la cabeza firme cuando lo cargas'],
  [4, 'movimiento', 'Agarra un juguete cuando se lo pones en la mano'],
  [4, 'movimiento', 'Mueve el brazo para golpear juguetes'],
  [4, 'movimiento', 'Se lleva las manos a la boca'],
  [4, 'movimiento', 'Se apoya en los codos o antebrazos cuando está boca abajo'],

  [6, 'social', 'Reconoce a las personas conocidas'],
  [6, 'social', 'Le gusta mirarse en el espejo'],
  [6, 'social', 'Se ríe a carcajadas'],
  [6, 'lenguaje', 'Se turna contigo para hacer sonidos'],
  [6, 'lenguaje', 'Hace «trompetillas»'],
  [6, 'lenguaje', 'Hace sonidos agudos, como chillidos'],
  [6, 'cognitivo', 'Se lleva las cosas a la boca para explorarlas'],
  [6, 'cognitivo', 'Estira la mano para alcanzar un juguete que quiere'],
  [6, 'cognitivo', 'Cierra los labios para mostrar que no quiere más comida'],
  [6, 'movimiento', 'Rueda de boca abajo a boca arriba'],
  [6, 'movimiento', 'Se levanta con los brazos estirados cuando está boca abajo'],
  [6, 'movimiento', 'Se apoya en las manos para sostenerse sentado'],

  [9, 'social', 'Se muestra tímido, se pega a ti o se asusta con personas desconocidas'],
  [9, 'social', 'Muestra varias expresiones: contento, triste, enojado, sorprendido'],
  [9, 'social', 'Voltea cuando dices su nombre'],
  [9, 'social', 'Reacciona cuando te vas (te mira, te estira los brazos o llora)'],
  [9, 'social', 'Sonríe o se ríe cuando juegan a «cu-cú»'],
  [9, 'lenguaje', 'Hace sonidos como «mamamama» y «bababa»'],
  [9, 'lenguaje', 'Levanta los brazos para que lo carguen'],
  [9, 'cognitivo', 'Busca objetos que se le caen fuera de su vista (cuchara, juguete)'],
  [9, 'cognitivo', 'Golpea dos objetos entre sí', 2],
  [9, 'movimiento', 'Se sienta por sí solo'],
  [9, 'movimiento', 'Pasa objetos de una mano a la otra'],
  [9, 'movimiento', 'Usa los dedos para «rastrillar» la comida hacia sí'],
  [9, 'movimiento', 'Se sienta sin apoyo'],

  [12, 'social', 'Juega contigo a las palmaditas («tortillitas») u otros juegos'],
  [12, 'lenguaje', 'Dice adiós con la mano'],
  [12, 'lenguaje', 'Llama «mamá» o «papá» (u otro nombre especial) a quien lo cuida'],
  [12, 'lenguaje', 'Entiende «no» (se detiene o hace una pausa cuando lo dices)'],
  [12, 'cognitivo', 'Mete un objeto en un recipiente (un cubo en una taza)', 8],
  [12, 'cognitivo', 'Busca cosas que viste esconder (un juguete bajo una cobija)'],
  [12, 'movimiento', 'Se jala para ponerse de pie'],
  [12, 'movimiento', 'Camina agarrándose de los muebles'],
  [12, 'movimiento', 'Toma agua de un vaso sin tapa si tú lo sostienes', 11],
  [12, 'movimiento', 'Agarra cosas pequeñas con el pulgar y el índice (pellizco)'],

  [15, 'social', 'Copia a otros niños al jugar'],
  [15, 'social', 'Te muestra un objeto que le gusta'],
  [15, 'social', 'Aplaude cuando está emocionado'],
  [15, 'social', 'Abraza un muñeco o peluche'],
  [15, 'social', 'Te demuestra cariño (abrazos, besos)'],
  [15, 'lenguaje', 'Intenta decir una o dos palabras además de «mamá» o «papá»'],
  [15, 'lenguaje', 'Mira un objeto conocido cuando lo nombras'],
  [15, 'lenguaje', 'Sigue indicaciones con gesto y palabra («dame el juguete» con la mano abierta)'],
  [15, 'lenguaje', 'Señala para pedir algo o pedir ayuda'],
  [15, 'cognitivo', 'Intenta usar las cosas como son (teléfono, taza, libro)'],
  [15, 'cognitivo', 'Apila al menos dos objetos pequeños'],
  [15, 'movimiento', 'Da algunos pasos solo'],
  [15, 'movimiento', 'Usa los dedos para comer algunos alimentos'],

  [18, 'social', 'Se aleja de ti pero voltea para ver que sigues cerca'],
  [18, 'social', 'Señala para mostrarte algo interesante'],
  [18, 'social', 'Te extiende las manos para que se las laves'],
  [18, 'social', 'Mira algunas páginas de un libro contigo'],
  [18, 'social', 'Te ayuda a vestirlo (mete el brazo en la manga o levanta el pie)'],
  [18, 'lenguaje', 'Intenta decir tres o más palabras además de «mamá» o «papá»'],
  [18, 'lenguaje', 'Sigue indicaciones de un paso sin gestos («dámelo»)'],
  [18, 'cognitivo', 'Te copia al hacer quehaceres (barrer con la escoba)'],
  [18, 'cognitivo', 'Juega con juguetes de forma sencilla (empujar un carrito)'],
  [18, 'movimiento', 'Camina sin agarrarse de nada ni de nadie', 5],
  [18, 'movimiento', 'Garabatea', 10],
  [18, 'movimiento', 'Toma de un vaso sin tapa y a veces lo derrama'],
  [18, 'movimiento', 'Come con los dedos'],
  [18, 'movimiento', 'Intenta usar una cuchara'],
  [18, 'movimiento', 'Sube y baja del sillón o de una silla sin ayuda'],

  [24, 'social', 'Se da cuenta cuando otros están lastimados o tristes (se detiene o se pone serio si alguien llora)'],
  [24, 'social', 'Te mira a la cara para saber cómo reaccionar en una situación nueva'],
  [24, 'lenguaje', 'Señala cosas de un libro cuando le preguntas («¿dónde está el oso?»)'],
  [24, 'lenguaje', 'Dice al menos dos palabras juntas («más leche»)'],
  [24, 'lenguaje', 'Señala al menos dos partes del cuerpo cuando se lo pides'],
  [24, 'lenguaje', 'Usa más gestos además de saludar y señalar (tirar un beso, decir que sí con la cabeza)'],
  [24, 'cognitivo', 'Sostiene algo con una mano mientras usa la otra'],
  [24, 'cognitivo', 'Intenta usar interruptores, perillas o botones de un juguete'],
  [24, 'cognitivo', 'Juega con más de un juguete a la vez (comida de juguete en un plato)'],
  [24, 'movimiento', 'Patea una pelota', 9],
  [24, 'movimiento', 'Corre'],
  [24, 'movimiento', 'Sube algunos escalones caminando (no gateando), con o sin ayuda'],
  [24, 'movimiento', 'Come con cuchara'],

  [30, 'social', 'Juega junto a otros niños y a veces con ellos'],
  [30, 'social', 'Te muestra lo que sabe hacer diciendo «¡mírame!»'],
  [30, 'social', 'Sigue rutinas sencillas cuando se lo piden (ayudar a recoger los juguetes)'],
  [30, 'lenguaje', 'Dice unas 50 palabras'],
  [30, 'lenguaje', 'Dice dos o más palabras con una acción («perrito corre»)'],
  [30, 'lenguaje', 'Nombra cosas de un libro cuando le preguntas «¿qué es esto?»'],
  [30, 'lenguaje', 'Usa palabras como «yo», «me» o «nosotros»'],
  [30, 'cognitivo', 'Usa objetos para jugar a que son otra cosa (darle de comer un bloque a una muñeca)'],
  [30, 'cognitivo', 'Resuelve problemas sencillos (se sube a un banquito para alcanzar algo)'],
  [30, 'cognitivo', 'Sigue instrucciones de dos pasos («deja el juguete y cierra la puerta»)'],
  [30, 'cognitivo', 'Conoce al menos un color (señala el crayón rojo cuando se lo pides)', 8],
  [30, 'movimiento', 'Usa las manos para girar cosas (perillas, tapas de rosca)'],
  [30, 'movimiento', 'Se quita algo de ropa solo (pantalón flojo, chamarra abierta)'],
  [30, 'movimiento', 'Salta con los dos pies despegándolos del suelo', 5],
  [30, 'movimiento', 'Pasa las páginas de un libro de una en una'],

  [36, 'social', 'Se calma en unos 10 minutos después de que te vas (por ejemplo, en la guardería)'],
  [36, 'social', 'Nota a otros niños y se une a jugar con ellos'],
  [36, 'lenguaje', 'Conversa contigo con al menos dos turnos de ida y vuelta'],
  [36, 'lenguaje', 'Hace preguntas con «quién», «qué», «dónde» o «por qué»'],
  [36, 'lenguaje', 'Dice qué acción ocurre en una imagen o libro («corriendo», «comiendo»)'],
  [36, 'lenguaje', 'Dice su nombre cuando se lo preguntan'],
  [36, 'lenguaje', 'Habla de forma que otros le entienden la mayor parte del tiempo'],
  [36, 'cognitivo', 'Dibuja un círculo después de que le enseñas cómo', 10],
  [36, 'cognitivo', 'Evita tocar objetos calientes (como la estufa) cuando se lo adviertes'],
  [36, 'movimiento', 'Ensarta objetos, como cuentas grandes o macarrones', 7],
  [36, 'movimiento', 'Se pone algo de ropa solo (pantalón flojo, chamarra)'],
  [36, 'movimiento', 'Usa un tenedor'],

  [48, 'social', 'Juega a ser otra cosa (maestra, superhéroe, perro)'],
  [48, 'social', 'Pide jugar con otros niños si no hay ninguno cerca'],
  [48, 'social', 'Consuela a quien se lastimó o está triste'],
  [48, 'social', 'Evita peligros (no se avienta de lugares muy altos en el parque)'],
  [48, 'social', 'Le gusta ser «ayudante»'],
  [48, 'social', 'Cambia su comportamiento según el lugar (iglesia, biblioteca, parque)'],
  [48, 'lenguaje', 'Dice oraciones de cuatro palabras o más'],
  [48, 'lenguaje', 'Dice algunas palabras de una canción, cuento o rima'],
  [48, 'lenguaje', 'Cuenta al menos una cosa que le pasó en el día', 6],
  [48, 'lenguaje', 'Contesta preguntas sencillas («¿para qué sirve una chamarra?»)'],
  [48, 'cognitivo', 'Nombra algunos colores de las cosas', 8],
  [48, 'cognitivo', 'Dice qué sigue en un cuento que conoce'],
  [48, 'cognitivo', 'Dibuja una persona con tres o más partes del cuerpo', 10],
  [48, 'movimiento', 'Atrapa una pelota grande la mayor parte del tiempo', 9],
  [48, 'movimiento', 'Se sirve comida o agua con supervisión'],
  [48, 'movimiento', 'Desabotona algunos botones'],
  [48, 'movimiento', 'Sostiene el crayón o lápiz con los dedos y el pulgar (no con el puño)'],

  [60, 'social', 'Sigue reglas o espera su turno al jugar con otros niños', 9],
  [60, 'social', 'Canta, baila o actúa para ti'],
  [60, 'social', 'Hace quehaceres sencillos en casa (emparejar calcetines, levantar los platos)'],
  [60, 'lenguaje', 'Cuenta un cuento que oyó o inventó, con al menos dos sucesos', 6],
  [60, 'lenguaje', 'Contesta preguntas sencillas sobre un cuento después de escucharlo'],
  [60, 'lenguaje', 'Mantiene una conversación con más de tres turnos de ida y vuelta'],
  [60, 'lenguaje', 'Usa o reconoce rimas sencillas (gato–pato, pelota–bota)'],
  [60, 'cognitivo', 'Cuenta hasta 10', 8],
  [60, 'cognitivo', 'Nombra algunos números del 1 al 5 cuando se los señalas'],
  [60, 'cognitivo', 'Usa palabras de tiempo («ayer», «mañana», «en la noche»)'],
  [60, 'cognitivo', 'Pone atención de 5 a 10 minutos en una actividad o cuento'],
  [60, 'cognitivo', 'Escribe algunas letras de su nombre', 12],
  [60, 'cognitivo', 'Nombra algunas letras cuando se las señalas'],
  [60, 'movimiento', 'Se abotona algunos botones'],
  [60, 'movimiento', 'Brinca en un pie', 5],

  [72, 'movimiento', 'Se viste sin ayuda'],
  [72, 'movimiento', 'Atrapa una pelota usando solo las manos', 9],
  [72, 'movimiento', 'Se amarra las agujetas'],
  [72, 'social', 'Muestra más independencia de la familia'],
  [72, 'social', 'Da más importancia a los amigos y al trabajo en equipo'],
  [72, 'social', 'Quiere caer bien y ser aceptado por sus amigos'],
  [72, 'lenguaje', 'Describe mejor lo que le pasó'],
  [72, 'lenguaje', 'Habla mejor de sus sentimientos y pensamientos'],
  [72, 'cognitivo', 'Se fija más en los demás y menos en sí mismo'],
  [72, 'cognitivo', 'Empieza a pensar en el futuro y en su lugar en el mundo'],

  [108, 'movimiento', 'Aparecen cambios de la pubertad (suelen notarse antes en las niñas)'],
  [108, 'movimiento', 'Se fija más en su propio cuerpo'],
  [108, 'social', 'Se nota más independiente de la familia y más interesado en los amigos'],
  [108, 'social', 'La presión de los amigos se vuelve más fuerte'],
  [108, 'cognitivo', 'Enfrenta más retos académicos en la escuela'],
  [108, 'cognitivo', 'Entiende mejor el punto de vista de otras personas'],
  [108, 'cognitivo', 'Mantiene la atención por más tiempo'],
];

export const MILE_ITEMS = RAW.map(([m, area, t, act], i) => {
  const n = RAW.slice(0, i).filter((r) => r[0] === m).length + 1;
  return { id: `${m}-${n}`, m, area, t, act: act || null, tips: m >= 72 };
});

// Edad en años del niño → edad de referencia (meses) que se muestra por defecto.
export function bracketForAge(years) {
  const months = years === 0 ? 6 : years * 12; // a un bebé de 0 años se le muestra «6 meses»; los demás, su cumpleaños
  let cur = MILE_AGES[0];
  MILE_AGES.forEach((b) => { if (b.m <= months) cur = b; });
  return cur;
}

// Una clave por niño y por hito, para que cada niño lleve su propio avance.
export const mileKey = (kk, id) => `${kk}|${id}`;
// El valor guardado es la fecha en que se logró (AAAA-MM-DD); un `true` antiguo también cuenta como logrado.
export const isDone = (S, kk, id) => !!(S.mile || {})[mileKey(kk, id)];
export const doneDate = (S, kk, id) => { const v = (S.mile || {})[mileKey(kk, id)]; return typeof v === 'string' ? v : null; };

// Estadísticas del desarrollo de un niño con su edad actual.
export function mileStats(S, kk, years) {
  const cur = bracketForAge(years);
  const done = (it) => isDone(S, kk, it.id);
  const byArea = {};
  Object.keys(AREAS).forEach((a) => {
    const all = MILE_ITEMS.filter((i) => i.m === cur.m && i.area === a);
    byArea[a] = { done: all.filter(done).length, total: all.length };
  });
  const curItems = MILE_ITEMS.filter((i) => i.m === cur.m);
  const upto = MILE_ITEMS.filter((i) => !i.tips && i.m <= cur.m);
  const earlier = MILE_ITEMS.filter((i) => !i.tips && i.m < cur.m);
  const pending = earlier.filter((i) => !done(i));
  const perAge = MILE_AGES.filter((b) => !b.tips).map((b) => {
    const all = MILE_ITEMS.filter((i) => i.m === b.m);
    return { m: b.m, label: b.label, done: all.filter(done).length, total: all.length };
  });
  const recent = MILE_ITEMS.filter((i) => doneDate(S, kk, i.id)).sort((a, b) => doneDate(S, kk, b.id).localeCompare(doneDate(S, kk, a.id))).slice(0, 5)
    .map((i) => ({ ...i, date: doneDate(S, kk, i.id) }));
  return {
    cur, byArea, perAge, recent,
    curDone: curItems.filter(done).length, curTotal: curItems.length,
    allDone: upto.filter(done).length, allTotal: upto.length,
    pending, firstPending: pending.length ? pending[0].m : null,
  };
}
