// Ideas de recetas nutritivas para cuando se acaben las ideas.
// Las recetas son originales de Tribbu: están pensadas con los criterios de las guías de abajo
// (variedad de grupos de alimentos, leguminosas y alimentos de origen animal, verduras y frutas, agua simple,
// poca sal y sin azúcar añadida) y con las advertencias de seguridad al comer. No son recetas
// publicadas por esas instituciones y no sustituyen la guía de tu pediatra.

export const NUTRI_SOURCES = {
  plato: {
    n: 'Plato del Bien Comer · guía de alimentación (gob.mx, basada en la NOM-043-SSA2)',
    url: 'https://www.gob.mx/cms/uploads/attachment/file/138259/alimentacion-PETCDF.pdf',
  },
  oms: {
    n: 'OMS · guía de alimentación complementaria de 6 a 23 meses (2023)',
    url: 'https://ncbi.nlm.nih.gov/books/n/who373358/pdf',
  },
  unicef: {
    n: 'UNICEF México · primera infancia',
    url: 'https://www.unicef.org/mexico/primera-infancia',
  },
  ahogo: {
    n: 'Riesgo de atragantamiento en niños (resumen de la declaración de la AAP)',
    url: 'https://www.nationwidechildrens.org/newsroom/news-releases/2010/02/american-academy-of-pediatrics-releases-new-policy-statement-on-choking',
  },
  corte: {
    n: 'Alimentos seguros para bebés y niños: peligro de atragantamiento (NDSU Extension)',
    url: 'https://www.ag.ndsu.edu/PUBLICATIONS/food-nutrition/safe-food-for-babies-and-children-choking-dangers',
  },
  miel: {
    n: 'Miel y botulismo infantil: no dar miel antes de los 12 meses (UF/IFAS Extension)',
    url: 'https://ask.ifas.ufl.edu/publication/AA142',
  },
};

export const NUTRI_NOTE = 'Criterios: en cada comida, alimentos de los grupos del Plato del Bien Comer (verduras y frutas, cereales, leguminosas y alimentos de origen animal); agua simple como bebida; poca sal; sin azúcar ni miel añadidas. Para bebés menores de 12 meses o con alergias, consulta primero a tu pediatra.';

export const NUTRI_MEALS = ['Desayuno', 'Comida', 'Cena', 'Colación'];
export const NUTRI_TAGS = ['Hierro', 'Calcio', 'Fibra', 'Proteína'];

const R = (id, t, meal, ageMin, min, tags, alg, ing, steps, why, safety, src) => ({
  id, t, meal, ageMin, age: `${ageMin}+`, min, tags, alg, ing, steps, why, safety, src, by: 'Tribbu', nutri: true,
});

export const NUTRI = [
  R(1001, 'Frijoles con huevo y tortilla', 'Desayuno', 1, 15, ['Proteína', 'Hierro', 'Fibra'], ['Huevo'],
    ['1/2 taza de frijoles de la olla (sin chile)', '1 huevo', '1 tortilla de maíz', '1 cucharadita de aceite'],
    ['Machaca los frijoles con un tenedor, con un poco de su caldo.', 'Revuelve el huevo en una sartén con el aceite hasta que cuaje por completo.', 'Sirve el huevo con los frijoles y la tortilla caliente cortada en tiras.'],
    'Junta una leguminosa, un alimento de origen animal y un cereal en el mismo plato.', 'El huevo siempre bien cocido.', ['plato', 'oms']),
  R(1002, 'Avena con plátano y canela', 'Desayuno', 1, 10, ['Fibra'], ['Gluten'],
    ['1/2 taza de avena en hojuelas', '1 taza de agua o de leche', '1/2 plátano maduro', 'Una pizca de canela'],
    ['Cuece la avena con el agua o la leche a fuego bajo de 5 a 7 minutos, moviendo.', 'Machaca el plátano y mézclalo al final.', 'Espolvorea la canela. No necesita azúcar.'],
    'Cereal integral con fibra y fruta para empezar el día.', 'No agregues miel a niños menores de 12 meses. Si hay alergia al gluten o enfermedad celíaca, revisa la etiqueta de la avena.', ['plato', 'miel']),
  R(1003, 'Quesadillas de espinaca', 'Cena', 1, 15, ['Calcio', 'Hierro'], ['Lácteos'],
    ['2 tortillas de maíz', '1/2 taza de espinaca picada fina', '1/3 taza de queso fresco o Oaxaca deshebrado'],
    ['Saltea la espinaca 2 minutos en una sartén sin aceite.', 'Rellena las tortillas con la espinaca y el queso.', 'Dóralas en el comal hasta que el queso se derrita.', 'Deja enfriar y corta en triángulos pequeños.'],
    'Verdura de hoja verde y un alimento con calcio en una cena fácil.', 'Deja enfriar el queso derretido antes de servir.', ['plato']),
  R(1004, 'Sopa de lentejas con zanahoria y calabaza', 'Comida', 1, 40, ['Hierro', 'Fibra', 'Proteína'], [],
    ['1/2 taza de lentejas', '1 zanahoria', '1 calabacita', '1/4 de cebolla', '3 tazas de agua o caldo sin sal', 'Unas gotas de limón'],
    ['Lava las lentejas y cuécelas con la cebolla unos 25 minutos.', 'Agrega la zanahoria y la calabacita picadas y cuece 10 minutos más.', 'Machaca un poco para que quede espesa y suave.', 'Al servir, exprime unas gotas de limón.'],
    'Las leguminosas aportan hierro y fibra; el limón (vitamina C) ayuda a aprovechar mejor el hierro de origen vegetal.', 'Que las verduras queden muy suaves.', ['plato', 'oms']),
  R(1005, 'Tortitas de atún y papa', 'Cena', 2, 25, ['Proteína'], ['Pescado', 'Huevo'],
    ['1 papa mediana cocida', '1 lata de atún en agua, escurrida', '1 huevo', '1 cucharada de perejil picado', 'Un poco de aceite'],
    ['Machaca la papa y mézclala con el atún, el huevo y el perejil.', 'Forma tortitas pequeñas.', 'Dóralas 3 minutos por lado en una sartén con poco aceite.'],
    'Alimento de origen animal con cereal o tubérculo en una cena rápida.', 'Revisa que el atún no tenga espinas. Pregunta a tu pediatra cada cuánto ofrecer pescado a niños pequeños.', ['plato', 'oms']),
  R(1006, 'Licuado de plátano y yogur', 'Colación', 1, 5, ['Calcio'], ['Lácteos'],
    ['1 plátano maduro', '1/2 taza de yogur natural sin azúcar', '1/2 taza de agua o leche'],
    ['Licúa todo hasta que quede terso.', 'Sirve de inmediato.'],
    'Colación con calcio y fruta, sin azúcar añadida.', 'Sin miel ni azúcar. Ofrécelo con vaso o taza, sentado.', ['plato', 'miel']),
  R(1007, 'Puré de garbanzo con limón', 'Colación', 1, 10, ['Fibra', 'Hierro', 'Proteína'], [],
    ['1 taza de garbanzos cocidos', 'Jugo de 1/2 limón', '1 cucharada de aceite de oliva', '2 cucharadas de agua'],
    ['Licúa o machaca todo hasta tener una pasta cremosa.', 'Sirve con zanahoria o calabacita cocidas y suaves, y tortilla en tiras.'],
    'Leguminosa con fibra y hierro; combina bien con verduras.', 'Ofrece las verduras cocidas y suaves: las crudas y duras, como la zanahoria cruda, son riesgo de atragantamiento antes de los 4 años.', ['plato', 'oms', 'ahogo']),
  R(1008, 'Molletes suaves de frijol y queso', 'Desayuno', 2, 15, ['Fibra', 'Calcio'], ['Lácteos', 'Gluten'],
    ['1/2 bolillo (la miga)', '1/3 taza de frijoles machacados', '1/4 taza de queso rallado'],
    ['Unta la miga del bolillo con los frijoles.', 'Cubre con el queso.', 'Gratina en el horno 5 minutos, hasta que se derrita.', 'Deja enfriar y corta en tiras.'],
    'Cereal, leguminosa y lácteo: un desayuno completo.', 'Retira la corteza dura del pan si es para niños pequeños.', ['plato']),
  R(1009, 'Caldo de pollo con verduras', 'Comida', 1, 45, ['Proteína'], [],
    ['1 muslo de pollo sin piel', '1 zanahoria', '1 calabacita', '1 chayote', '1/4 de cebolla', '6 tazas de agua'],
    ['Cuece el pollo con la cebolla 25 minutos.', 'Agrega las verduras en trozos y cuece 15 minutos más.', 'Desmenuza el pollo y sirve con arroz o tortilla. Sal muy poca o nada.'],
    'Alimento de origen animal y verduras en un plato caliente y fácil de comer.', 'Retira huesos, piel y cartílagos y desmenuza el pollo.', ['plato']),
  R(1010, 'Pasta con jitomate y lentejas', 'Comida', 2, 30, ['Hierro', 'Fibra'], ['Gluten'],
    ['1 taza de pasta corta', '1/2 taza de lentejas cocidas', '2 jitomates', '1/4 de cebolla'],
    ['Cuece la pasta según el empaque.', 'Licúa los jitomates con la cebolla y cuécelos 5 minutos en una sartén.', 'Agrega las lentejas, mezcla con la pasta y sirve.'],
    'Cereal y leguminosa juntos, con jitomate (vitamina C).', 'Sirve la pasta bien cocida.', ['plato', 'oms']),
  R(1011, 'Fruta con yogur y amaranto', 'Colación', 2, 10, ['Calcio', 'Fibra'], ['Lácteos'],
    ['1 taza de fruta picada (papaya, mango o fresa)', '1/2 taza de yogur natural sin azúcar', '1 cucharada de amaranto'],
    ['Pon la fruta en un tazón.', 'Agrega el yogur y espolvorea el amaranto.'],
    'Fruta, calcio y un cereal tradicional mexicano.', 'Corta la fruta en trozos pequeños; las uvas, en cuartos a lo largo.', ['plato', 'corte']),
  R(1012, 'Taquitos suaves de frijol y aguacate', 'Cena', 1, 10, ['Fibra', 'Proteína'], [],
    ['2 tortillas de maíz', '1/2 taza de frijoles machacados', '1/4 de aguacate'],
    ['Calienta las tortillas.', 'Rellena con frijoles y aguacate machacado.', 'Enrolla y corta en trozos pequeños.'],
    'Leguminosa, cereal y una grasa saludable del aguacate.', 'Machaca bien el aguacate y los frijoles.', ['plato']),
  R(1013, 'Omelette de verduras', 'Cena', 1, 12, ['Proteína'], ['Huevo'],
    ['2 huevos', '1/4 taza de calabacita picada muy fina', '1 cucharada de jitomate picado', 'Un poco de aceite'],
    ['Saltea la calabacita 2 minutos con el aceite.', 'Bate los huevos, agrégalos y cuaja a fuego medio.', 'Añade el jitomate, dobla y corta en tiras.'],
    'Proteína y verduras en una cena de 12 minutos.', 'El huevo siempre bien cocido.', ['plato']),
  R(1014, 'Tortitas de brócoli y queso', 'Cena', 1, 30, ['Calcio', 'Fibra'], ['Huevo', 'Lácteos', 'Gluten'],
    ['1 taza de brócoli cocido y picado', '1 huevo', '1/4 taza de queso rallado', '2 cucharadas de harina o de avena molida'],
    ['Mezcla todo.', 'Forma tortitas pequeñas y ponlas en una charola engrasada.', 'Hornea a 200 °C unos 15 minutos, volteando a la mitad.'],
    'Una forma de comer verdura verde con calcio.', 'Corta en trozos pequeños antes de servir.', ['plato']),
  R(1015, 'Pollo con calabacitas y arroz', 'Comida', 1, 35, ['Proteína', 'Fibra'], [],
    ['1 pechuga de pollo cocida y desmenuzada', '2 calabacitas', '1/2 taza de arroz', '1 jitomate', '1/4 de cebolla'],
    ['Cuece el arroz con la cebolla y el jitomate licuado.', 'Saltea las calabacitas picadas hasta que estén suaves.', 'Mezcla con el pollo desmenuzado y sirve.'],
    'Cereal, verdura y proteína en un plato completo.', 'Desmenuza bien el pollo.', ['plato']),
  R(1016, 'Plátano con crema de cacahuate', 'Colación', 2, 5, ['Proteína'], ['Cacahuate'],
    ['1 plátano', '1 cucharadita de crema de cacahuate'],
    ['Corta el plátano en rodajas.', 'Unta una capa muy delgada de crema de cacahuate.'],
    'Fruta con una fuente de proteína vegetal.', 'Unta una capa muy fina: los grumos o cucharadas de crema de cacahuate pueden atragantar. Si hay antecedentes de alergias en la familia, consulta antes con tu pediatra.', ['plato', 'ahogo']),
  R(1017, 'Nopales con huevo', 'Desayuno', 2, 15, ['Fibra', 'Proteína'], ['Huevo'],
    ['1 taza de nopales cocidos y picados', '2 huevos', '1 cucharadita de aceite', '1 jitomate picado'],
    ['Sofríe el jitomate con el aceite 2 minutos.', 'Agrega los nopales y calienta.', 'Añade los huevos batidos y revuelve hasta que cuajen por completo.'],
    'Una verdura mexicana con fibra, junto con proteína.', 'El huevo siempre bien cocido.', ['plato']),
  R(1018, 'Calabacitas con elote y queso', 'Comida', 2, 20, ['Fibra', 'Calcio'], ['Lácteos'],
    ['2 calabacitas', '1/2 taza de granos de elote', '1/4 de cebolla', '1/4 taza de queso fresco desmoronado'],
    ['Cuece la calabacita y el elote con la cebolla en poca agua hasta que estén suaves.', 'Escurre, agrega el queso y mezcla.'],
    'Verduras de temporada con un poco de queso.', 'Antes de los 4 años, machaca ligeramente los granos de elote y corta la calabacita en trozos pequeños.', ['plato', 'corte']),
];

// ---- Alergias: ¿la receta contiene algo que el niño no puede comer? ----
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const SYN = {
  lacteos: ['lacteo', 'leche', 'lactosa', 'queso', 'yogur', 'yogurt'],
  gluten: ['gluten', 'trigo', 'celiaq', 'celiac'],
  huevo: ['huevo'],
  pescado: ['pescado', 'atun', 'marisco'],
  cacahuate: ['cacahuate', 'mani'],
};
export function allergenHits(recipe, allergyText) {
  const a = norm(allergyText);
  if (!a || /ninguna|no tiene|sin alergia|sin registrar/.test(a)) return [];
  return recipe.alg.filter((al) => {
    const k = norm(al);
    return a.includes(k) || (SYN[k] || []).some((w) => a.includes(w));
  });
}
