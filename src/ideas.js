// «Tengo este objeto en casa»: arma ideas de actividad a partir de un objeto que escribe un papá o una mamá.
// Funciona con plantillas por tipo de objeto (no es IA): reconoce de qué tipo es el objeto por su nombre y llena
// los pasos con ese nombre. Con la IA real (fase 3) se podrán inventar actividades libres.
// Cada plantilla trae un rango de edad, para que las ideas sean adecuadas para el niño.

// Objetos que NO se deben dar a los niños para jugar (peligro de atragantamiento, intoxicación, cortes o descarga).
const UNSAFE = /\bpilas?\b|bater[ií]a|medicin|pastilla|jarabe|cuchillo|navaja|encendedor|f[oó]sforo|cerillo|cable|enchufe|extensi[oó]n el|clavo|aguja|alfiler|cloro|detergente|limpiador|veneno|insecticida|alcohol|can[ií]ca|im[aá]n|tornillo|tuerca|vidrio|cristal|bolsa de pl[aá]stico|bolsa pl[aá]stica|\barmas?\b|pistola|gasolina|thinner|pegamento|resistol|encend|\bvelas?\b/i;

export const UNSAFE_MSG = 'Ese objeto no es seguro para que un niño juegue con él (por pequeño, filoso, tóxico o eléctrico). Elige otro objeto de casa, como una caja, un rollo de papel o una tela.';

const CATS = [
  { key: 'tubo', label: 'tubos', re: /rollo|tubo|canuto|popote|pajilla/i, temps: [
    { t: 'Telescopio explorador con {o}', age: [3, 9], min: 15, sk: 'logica', energy: 'Tranquila', why: 'Atención visual y vocabulario de colores y formas.', steps: ['Mira por {o} como si fuera un telescopio.', 'Pide a {name} que busque 3 cosas rojas, 2 cuadradas y 1 que suene.', 'Cambien de papel: ahora {name} te da las pistas.', 'Dibujen lo más curioso que encontraron.'] },
    { t: 'Pista para bolitas con {o}', age: [3, 10], min: 20, sk: 'motricidad', energy: 'Movida', why: 'Causa y efecto, puntería y coordinación.', steps: ['Con cinta, pega {o} en la pared o en el respaldo de una silla, inclinado.', 'Haz bolitas de papel o usa pelotas de calcetín.', 'Déjalas caer por {o} y atrápenlas abajo en una caja.', 'Cambien la inclinación y vean qué pasa.'] },
    { t: 'Teléfono secreto con {o}', age: [3, 9], min: 10, sk: 'lenguaje', energy: 'Tranquila', why: 'Escucha atenta y hablar con claridad.', steps: ['Cada quien toma un extremo de {o}.', 'Uno susurra una palabra por un extremo y el otro la repite.', 'Suban a frases de 3 palabras.', 'Inventen un mensaje secreto para alguien de la familia.'] },
  ] },
  { key: 'caja', label: 'cajas', re: /caja|cart[oó]n|cajita|empaque|charola/i, temps: [
    { t: 'Casita o autobús con {o}', age: [2, 7], min: 25, sk: 'creatividad', energy: 'Tranquila', why: 'Juego simbólico, imaginación y lenguaje.', steps: ['Decidan juntos qué será {o}: casa, autobús, barco o tienda.', 'Decórenla con crayones o papel.', 'Que {name} la use para jugar a que va de viaje.', 'Pregunta: ¿a dónde van? ¿quién viaja?'] },
    { t: 'Garaje de juguetes con {o}', age: [2, 6], min: 15, sk: 'logica', energy: 'Tranquila', why: 'Clasificar, comparar tamaños y ordenar.', steps: ['Usa {o} como garaje o cajón de juguetes.', 'Que {name} clasifique los juguetes por color o tamaño.', 'Cuenten cuántos hay en cada grupo.', 'Al final, guardan todo juntos.'] },
    { t: 'Tiro al blanco con {o}', age: [3, 9], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Puntería y cálculo de distancia.', steps: ['Pon {o} de lado en el piso.', 'Marquen con cinta la línea de lanzamiento.', 'Lancen calcetines enrollados para meterlos.', 'Alejen {o} cada vez que acierten 3 veces.'] },
  ] },
  { key: 'botella', label: 'botellas y envases', re: /botella|envase|frasco|bote\b|botes|garrafa|tarro|cubeta|balde/i, temps: [
    { t: 'Boliche con {o}', age: [3, 9], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Puntería, fuerza y conteo.', steps: ['Junta varias piezas de {o} (vacías y limpias) y ponlas en fila o triángulo.', 'Rueda una pelota o un calcetín enrollado para tirarlas.', 'Cuenten cuántas cayeron.', 'Sumen sus puntos después de 3 tiros.'] },
    { t: 'Trasvasar con {o}', age: [2, 5], min: 15, sk: 'calma', energy: 'Tranquila', why: 'Concentración y control de las manos.', steps: ['Pon una toalla y un poco de agua en {o}.', 'Que {name} pase el agua de un recipiente a otro con una cuchara o vaso.', 'Marquen con cinta hasta dónde llenar.', 'Al final, que ayude a secar. Acompáñalo siempre cerca del agua.'] },
    { t: 'Sonajas con {o}', age: [3, 8], min: 25, sk: 'creatividad', energy: 'Movida', why: 'Ritmo, causa y efecto.', steps: ['El adulto pone un poco de arroz o pasta dentro de {o} y cierra bien.', 'Asegura la tapa con cinta para que no se abra.', 'Agítenlas al ritmo de una canción.', 'Prueben con distintas cantidades y escuchen cómo cambia el sonido.'] },
  ] },
  { key: 'tela', label: 'telas y ropa', re: /tela|pa[nñ]uelo|bufanda|trapo|calcet|playera|camis|s[aá]bana|toalla|cobija|manta|rebozo|servilleta|mantel|vestido|gorra|sombrero/i, temps: [
    { t: 'Baile con {o}', age: [2, 8], min: 10, sk: 'motricidad', energy: 'Movida', why: 'Expresión corporal y ritmo.', steps: ['Pon música y bailen moviendo {o} en el aire.', 'Hagan olas, círculos y zigzags con {o}.', 'Cuando pare la música, quédense quietos como estatuas.', 'Cambien el estilo: lento, rápido, pequeño, enorme.'] },
    { t: 'Escondidas bajo {o}', age: [1, 5], min: 10, sk: 'logica', energy: 'Tranquila', why: 'Permanencia del objeto y turnos.', steps: ['Esconde un juguete bajo {o}.', 'Que {name} lo busque y diga qué encontró.', 'Cambien: {name} esconde y tú buscas.', 'Escondan dos juguetes y cuenten.'] },
    { t: 'Capa o disfraz con {o}', age: [3, 9], min: 25, sk: 'creatividad', energy: 'Tranquila', why: 'Juego simbólico y narración.', steps: ['Usen {o} como capa, falda o turbante.', 'Que {name} elija a qué personaje representa.', 'Inventen una escena: ¿qué problema resuelve el personaje?', 'Presenten la escena a la familia.'] },
  ] },
  { key: 'papel', label: 'papel', re: /papel|peri[oó]dico|revista|hoja|folleto|carta|sobre\b|libreta|cuaderno/i, temps: [
    { t: 'Bolitas de papel con {o}', age: [3, 10], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Fuerza en las manos y puntería.', steps: ['Que {name} arrugue {o} para hacer bolitas.', 'Pongan un bote o caja a distancia.', 'Lancen las bolitas para meterlas y cuenten los aciertos.', 'Junten las bolitas y reciclen todo al final.'] },
    { t: 'Aviones de {o}', age: [5, 10], min: 25, sk: 'logica', energy: 'Movida', why: 'Seguir pasos y comparar resultados.', steps: ['Dobla {o} para hacer un avión; ayúdalo con cada doblez.', 'Prueben cuál llega más lejos.', 'Cambien los dobleces y comparen.', 'Midan la distancia con pasos.'] },
    { t: 'Collage con {o}', age: [4, 10], min: 30, sk: 'creatividad', energy: 'Tranquila', why: 'Creatividad y motricidad fina.', steps: ['Rompan o recorten (con ayuda) trozos de {o}.', 'Acomódenlos en una hoja para formar un animal o una cara.', 'Péguenlos con pegamento escolar.', 'Que {name} le ponga título a su obra.'] },
  ] },
  { key: 'cocina', label: 'utensilios de cocina', re: /cuchara|tenedor|colador|embudo|taz[oó]n|olla|sart[eé]n|tapa|vaso|plato|taza|batidor|rodillo|molde|cacerola|charola|pinza|esp[aá]tula|cucharón/i, temps: [
    { t: 'Orquesta con {o}', age: [1, 7], min: 15, sk: 'creatividad', energy: 'Movida', why: 'Ritmo y atención auditiva.', steps: ['Prueben qué sonidos hace {o} al golpearlo con una cuchara de madera.', 'Marca un ritmo corto y que {name} lo repita.', 'Cambien de papel: {name} dirige.', 'Hagan una canción con todos los instrumentos.'] },
    { t: 'Pesca con {o}', age: [3, 8], min: 20, sk: 'motricidad', energy: 'Tranquila', why: 'Pinza fina y coordinación ojo-mano.', steps: ['Pon objetos seguros (tapas, calcetines enrollados) en un recipiente con agua o sin ella.', 'Que {name} los saque usando {o}.', 'Cuenten cuántos sacó en un minuto.', 'Intenten con la otra mano.'] },
    { t: 'Cocinita con {o}', age: [2, 6], min: 20, sk: 'creatividad', energy: 'Tranquila', why: 'Juego simbólico y vocabulario.', steps: ['Prepara una cocinita con {o} y otros utensilios.', 'Que {name} cocine una «sopa» para ti.', 'Pregunta: ¿qué lleva? ¿para quién es?', 'Limpien juntos al terminar.'] },
  ] },
  { key: 'pelota', label: 'pelotas y globos', re: /pelota|bal[oó]n|globo|bola/i, temps: [
    { t: 'Pasa {o}, turnos y reglas', age: [2, 8], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Turnos, coordinación y atención.', steps: ['Siéntense frente a frente y rueden {o}.', 'Suban el reto: pásenla con los pies o con los codos.', 'Digan en voz alta el nombre de quien la recibe.', 'Cuenten cuántos pases seguidos logran.'] },
    { t: 'Canasta con {o}', age: [3, 9], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Puntería y cálculo de distancia.', steps: ['Pon un bote o caja como canasta.', 'Lancen {o} para meterla desde una línea.', 'Anoten los aciertos con rayitas.', 'Alejen la canasta un paso cada 5 aciertos.'] },
    { t: 'Carrera lenta con {o}', age: [4, 10], min: 15, sk: 'calma', energy: 'Tranquila', why: 'Control del movimiento y paciencia.', steps: ['Marquen una salida y una meta con cinta.', 'Cada quien lleva {o} lo más despacio posible.', 'Gana quien llegue último sin que se le caiga.', 'Cambien la forma de llevarla: en la cabeza, en el hombro.'] },
  ] },
  { key: 'cuerda', label: 'cuerdas y listones', re: /cuerda|cord[oó]n|list[oó]n|estambre|hilo|lana|agujeta|cinta de/i, temps: [
    { t: 'Camino de equilibrio con {o}', age: [2, 8], min: 15, sk: 'motricidad', energy: 'Movida', why: 'Equilibrio y coordinación.', steps: ['Extiende {o} en el piso formando un camino recto y uno curvo.', 'Caminen sobre él como equilibristas.', 'Prueben de lado, de puntitas y hacia atrás.', 'Que {name} invente un camino nuevo.'] },
    { t: 'Serpiente con {o}', age: [2, 6], min: 15, sk: 'creatividad', energy: 'Movida', why: 'Seguir con la mirada y movimiento libre.', steps: ['Mueve {o} como si fuera una serpiente por el piso.', 'Que {name} la atrape pisándola con cuidado.', 'Cambien de papel.', 'Hagan formas: círculo, letra, número.'] },
    { t: 'Letras y formas con {o}', age: [4, 8], min: 20, sk: 'lenguaje', energy: 'Tranquila', why: 'Reconocer letras y formas.', steps: ['Forma con {o} la primera letra de su nombre en el piso.', 'Que {name} la recorra con el dedo.', 'Hagan otra letra o un número.', 'Adivina la que formó tu compañero.'] },
  ] },
  { key: 'seco', label: 'alimentos secos', re: /arroz|frijol|lenteja|pasta|macarr|cereal|avena|\bsal\b|harina|az[uú]car|garbanzo|semilla|ma[ií]z|palomit|fideo|espagueti/i, temps: [
    { t: 'Caja sensorial con {o}', age: [3, 7], min: 20, sk: 'calma', energy: 'Tranquila', why: 'Exploración con el tacto y concentración.', steps: ['Pon {o} en una charola o caja grande, sobre una toalla.', 'Dale cucharas y vasos para llenar y vaciar.', 'Escondan una tapa y que la encuentre con las manos.', 'Barran juntos. Acompáñalo siempre: no se come y los más pequeños pueden llevárselo a la boca.'] },
    { t: 'Dibujar en {o}', age: [3, 7], min: 15, sk: 'motricidad', energy: 'Tranquila', why: 'Preparación para escribir.', steps: ['Cubre una charola con una capa delgada de {o}.', 'Que {name} dibuje con un dedo líneas, círculos y letras.', 'Sacudan para borrar y empezar de nuevo.', 'Que copie el dibujo que hagas.'] },
    { t: 'Clasificar con {o}', age: [4, 8], min: 15, sk: 'logica', energy: 'Tranquila', why: 'Contar, agrupar y comparar.', steps: ['Mezcla {o} con otro alimento seco en un plato.', 'Que {name} los separe en vasos.', 'Cuenten cuántos hay de cada uno.', 'Solo con un adulto cerca; no se come lo que se usa para jugar.'] },
  ] },
  { key: 'juguete', label: 'juguetes y peluches', re: /juguete|mu[nñ]eco|peluche|carrito|carro\b|mu[nñ]eca|oso|lego|bloque|cubo|rompecabezas|dinosaurio|figura/i, temps: [
    { t: 'Hospital de {o}', age: [2, 7], min: 20, sk: 'creatividad', energy: 'Tranquila', why: 'Empatía, cuidado y juego simbólico.', steps: ['Arma un hospital: una cama (cobija) y un botiquín de juguete.', 'Que {name} cuide a {o} y le «cure» sus dolores.', 'Pregunta qué le duele y qué necesita.', 'Pónganle una cobija y cántenle una canción.'] },
    { t: 'Desfile de {o}', age: [2, 7], min: 15, sk: 'logica', energy: 'Tranquila', why: 'Ordenar, contar y hablar en secuencia.', steps: ['Alineen {o} y otros juguetes en un desfile.', 'Ordénenlos de grande a chico o por color.', 'Cuenten cuántos son y quién va primero.', 'Cambien el orden y cuenten de nuevo.'] },
    { t: 'Escondite de {o}', age: [2, 8], min: 15, sk: 'lenguaje', energy: 'Tranquila', why: 'Lenguaje de lugares: arriba, abajo, dentro.', steps: ['Esconde {o} en un lugar seguro de la casa.', 'Da pistas con palabras de lugar: «debajo», «junto a», «dentro».', 'Cambien de papel.', 'Después pídele que lo escriba o lo dibuje en un mapa.'] },
  ] },
  { key: 'mueble', label: 'muebles y cojines', re: /silla|almohada|coj[ií]n|sill[oó]n|mesa|colch|sof[aá]|banco|cobertor|puff/i, temps: [
    { t: 'Fuerte con {o}', age: [2, 9], min: 25, sk: 'creatividad', energy: 'Movida', why: 'Planeación y juego simbólico.', steps: ['Usen {o} para armar las paredes de un fuerte.', 'Cubran con una cobija y refuercen con almohadas.', 'Decidan qué es: castillo, cueva o nave.', 'Lean o cuenten un cuento adentro.'] },
    { t: 'Obstáculos con {o}', age: [3, 9], min: 20, sk: 'motricidad', energy: 'Movida', why: 'Planeación del movimiento y equilibrio.', steps: ['Arma un camino con {o}: pasar por encima, por debajo y rodeando.', 'Recórranlo despacio la primera vez.', 'Que {name} invente un obstáculo nuevo.', 'Cuenten en voz alta para medir el tiempo.'] },
  ] },
  { key: 'libro', label: 'libros', re: /libro|cuento|cartilla|enciclopedia|diccionario/i, temps: [
    { t: 'Detectives de {o}', age: [3, 9], min: 15, sk: 'lenguaje', energy: 'Tranquila', why: 'Observación y vocabulario.', steps: ['Abran {o} en una imagen.', 'Pide a {name} que busque 3 cosas que empiecen con la misma letra o sean del mismo color.', 'Que describa lo que ve sin decir el nombre y adivinas.', 'Cambien de página y repitan.'] },
    { t: 'Cambia el final de {o}', age: [4, 10], min: 20, sk: 'creatividad', energy: 'Tranquila', why: 'Imaginación y narración.', steps: ['Lean juntos {o} hasta antes del final.', 'Pregunta: ¿qué más podría pasar?', 'Que {name} invente un final diferente.', 'Dibujen el final nuevo.'] },
  ] },
  { key: 'agua', label: 'agua y esponjas', re: /agua|esponja|jab[oó]n|espuma|manguera|regadera|tina|lavadero|fregadero/i, temps: [
    { t: 'Hundir y flotar con {o}', age: [3, 8], min: 20, sk: 'logica', energy: 'Tranquila', why: 'Predecir y comprobar (ciencia).', steps: ['Llenen una tina con poca agua; siempre con un adulto.', 'Junta objetos seguros que se puedan mojar.', 'Que {name} adivine cuáles flotan y cuáles se hunden.', 'Comprueben y hagan dos grupos.'] },
    { t: 'Lavadero de juguetes con {o}', age: [2, 6], min: 20, sk: 'calma', energy: 'Tranquila', why: 'Concentración y cuidado de sus cosas.', steps: ['Pon agua en un recipiente con poco jabón, sobre una toalla.', 'Que {name} lave juguetes con {o}.', 'Enjuaguen y pongan a secar.', 'Cuenten cuántos lavaron. Nunca lo dejes solo cerca del agua.'] },
  ] },
  { key: 'musica', label: 'instrumentos', re: /tambor|sonaja|flauta|guitarra|piano|campana|maraca|silbato|pandero|xil[oó]fono/i, temps: [
    { t: 'Concierto con {o}', age: [2, 9], min: 15, sk: 'creatividad', energy: 'Movida', why: 'Ritmo, escucha y turnos.', steps: ['Toca un ritmo corto con {o} y que {name} lo repita.', 'Cambien de papel.', 'Hagan sonidos fuertes, suaves, rápidos y lentos.', 'Presenten un concierto a la familia.'] },
  ] },
];

// Plantillas para cualquier objeto.
const GENERIC = [
  { t: 'Explorador de {o}', age: [2, 10], min: 15, sk: 'logica', energy: 'Tranquila', why: 'Observación, vocabulario y curiosidad.', steps: ['Pon {o} sobre la mesa y obsérvenlo con calma.', 'Pide a {name} que lo describa: forma, color, textura, sonido y olor (si es seguro).', 'Pregunta: ¿para qué sirve? ¿en qué otra cosa podría convertirse?', 'Que lo dibuje y le invente un nombre nuevo.'] },
  { t: 'Tres usos nuevos para {o}', age: [4, 10], min: 20, sk: 'creatividad', energy: 'Tranquila', why: 'Pensamiento creativo y resolución de problemas.', steps: ['Pregunta a {name}: ¿qué más podríamos hacer con {o}?', 'Inventen 3 usos distintos, aunque suenen locos.', 'Prueben el que más les guste, con un adulto cerca.', 'Dibujen su invento y cuéntenselo a la familia.'] },
  { t: 'El cuento de {o}', age: [3, 10], min: 20, sk: 'lenguaje', energy: 'Tranquila', why: 'Narración con inicio, problema y final.', steps: ['Que {o} sea el personaje principal de un cuento.', 'Inventen: ¿quién es? ¿qué problema tiene? ¿quién lo ayuda?', 'Cuéntenlo por turnos, una frase cada quien.', 'Dibujen la escena que más les gustó.'] },
];

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ');

// Materiales de la biblioteca que se parecen a cada tipo de objeto (para sugerir actividades que ya existen).
const CAT_MATS = {
  tubo: [], caja: ['caja'], botella: ['botellas', 'tapas'], tela: ['calcetines', 'cobija', 'toalla'], papel: ['papel', 'periodico'],
  cocina: ['cucharas', 'ollas', 'vasos'], pelota: ['pelota', 'globos'], cuerda: ['cuerda'], seco: ['pasta', 'arroz', 'frijol', 'harina', 'sal'],
  juguete: [], mueble: ['almohadas', 'cobija'], libro: ['libros'], agua: ['agua', 'jabon'], musica: [],
};
export const similarMatsOf = (obj) => { const c = CATS.find((x) => x.re.test(norm(obj))); return c ? CAT_MATS[c.key] : []; };

export const isUnsafe = (obj) => UNSAFE.test(norm(obj));
export const categoryOf = (obj) => CATS.find((c) => c.re.test(norm(obj))) || null;
export const slug = (obj) => `x${norm(obj).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

// Devuelve { unsafe } o { ideas, category }. kidAge: edad en años; kidName: nombre del niño.
export function ideasFor(obj, kidAge, kidName) {
  // Sin el artículo del inicio («una piedra» → «piedra»).
  const o = norm(obj).replace(/^(un|una|unos|unas|el|la|los|las|mi|mis|tu|tus)\s+/i, '');
  if (!o) return { ideas: [], category: null };
  if (isUnsafe(o)) return { unsafe: true, ideas: [] };
  const cat = categoryOf(o);
  const fits = (t) => kidAge >= t.age[0] && kidAge <= t.age[1];
  const all = [...(cat ? cat.temps : []), ...GENERIC];
  let pool = all.filter(fits);
  // Si hay muy pocas para su edad, se agregan otras marcadas como «para más grandes».
  if (pool.length < 2) pool = [...pool, ...all.filter((t) => !fits(t))];
  const lower = o.toLowerCase();
  const id = slug(o);
  const fill = (s) => s.replace(/\{O\}/g, cap(o)).replace(/\{o\}/g, lower).replace(/\{name\}/g, kidName || 'tu hijo');
  const ideas = pool.slice(0, 3).map((t) => ({
    t: fill(t.t), why: t.why, steps: t.steps.map(fill), age: t.age, min: t.min, sk: t.sk, energy: t.energy, mats: [id],
    note: !fits(t) ? 'Está pensada para niños de otra edad: adáptala y acompáñalo en todo momento.' : kidAge < 3 ? 'Acompaña siempre y evita piezas pequeñas que se puedan tragar.' : null,
  }));
  return { ideas, category: cat ? cat.label : null, object: o };
}
