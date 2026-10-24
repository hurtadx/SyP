// Preguntas del "Sobre mí". `options` son respuestas falsas para el modo de opciones del quiz
export const ABOUT_QUESTIONS = [
  {
    id: 'comida',
    ask: '¿Cuál es tu comida favorita?',
    quiz: (name) => `¿Cuál es la comida favorita de ${name}?`,
    options: ['Pizza', 'Sushi', 'Hamburguesa', 'Pasta', 'Tacos', 'Arepas', 'Pollo frito', 'Lasaña'],
  },
  {
    id: 'comida_odiada',
    ask: '¿Qué comida no soportas?',
    quiz: (name) => `¿Qué comida no soporta ${name}?`,
    options: ['El brócoli', 'La cebolla', 'El hígado', 'Las aceitunas', 'El pescado', 'La coliflor', 'El aguacate'],
  },
  {
    id: 'postre',
    ask: '¿Cuál es tu postre favorito?',
    quiz: (name) => `¿Cuál es el postre favorito de ${name}?`,
    options: ['Torta de chocolate', 'Helado', 'Flan', 'Cheesecake', 'Brownie', 'Tres leches', 'Galletas'],
  },
  {
    id: 'bebida',
    ask: '¿Cuál es tu bebida favorita?',
    quiz: (name) => `¿Cuál es la bebida favorita de ${name}?`,
    options: ['Café', 'Té', 'Jugo de mango', 'Limonada', 'Chocolate caliente', 'Gaseosa', 'Malteada'],
  },
  {
    id: 'pelicula',
    ask: '¿Cuál es tu película favorita?',
    quiz: (name) => `¿Cuál es la película favorita de ${name}?`,
    options: ['Titanic', 'Toy Story', 'Harry Potter', 'Shrek', 'Avengers', 'El Rey León', 'Coco', 'Up'],
  },
  {
    id: 'serie',
    ask: '¿Cuál es tu serie favorita?',
    quiz: (name) => `¿Cuál es la serie favorita de ${name}?`,
    options: ['Friends', 'Stranger Things', 'La casa de papel', 'Los Simpson', 'Breaking Bad', 'Merlina', 'The Office'],
  },
  {
    id: 'cancion',
    ask: '¿Cuál es tu canción favorita?',
    quiz: (name) => `¿Cuál es la canción favorita de ${name}?`,
    options: ['Perfect', 'Bohemian Rhapsody', 'Flowers', 'Yellow', 'Despacito', 'Shape of You', 'La Bachata'],
  },
  {
    id: 'color',
    ask: '¿Cuál es tu color favorito?',
    quiz: (name) => `¿Cuál es el color favorito de ${name}?`,
    options: ['Azul', 'Rojo', 'Verde', 'Morado', 'Rosado', 'Negro', 'Amarillo', 'Blanco'],
  },
  {
    id: 'animal',
    ask: '¿Cuál es tu animal favorito?',
    quiz: (name) => `¿Cuál es el animal favorito de ${name}?`,
    options: ['Perro', 'Gato', 'Conejo', 'Panda', 'Delfín', 'Pingüino', 'Zorro', 'Búho'],
  },
  {
    id: 'viaje',
    ask: '¿Cuál es tu lugar soñado para viajar?',
    quiz: (name) => `¿Cuál es el lugar soñado de ${name} para viajar?`,
    options: ['París', 'Japón', 'Nueva York', 'Italia', 'Grecia', 'México', 'Islandia', 'Brasil'],
  },
  {
    id: 'miedo',
    ask: '¿Qué es lo que más miedo te da?',
    quiz: (name) => `¿Qué es lo que más miedo le da a ${name}?`,
    options: ['Las arañas', 'La oscuridad', 'Las alturas', 'La soledad', 'Los payasos', 'El mar profundo', 'Hablar en público'],
  },
  {
    id: 'mal_humor',
    ask: '¿Qué te pone de mal humor?',
    quiz: (name) => `¿Qué pone de mal humor a ${name}?`,
    options: ['El hambre', 'El tráfico', 'Que me ignoren', 'Despertar temprano', 'El ruido', 'Esperar mucho'],
  },
  {
    id: 'hobby',
    ask: '¿Cuál es tu pasatiempo favorito?',
    quiz: (name) => `¿Cuál es el pasatiempo favorito de ${name}?`,
    options: ['Leer', 'Dibujar', 'Jugar videojuegos', 'Cocinar', 'Bailar', 'Hacer ejercicio', 'Ver series'],
  },
  {
    id: 'domingo',
    ask: '¿Cuál es tu plan perfecto de domingo?',
    quiz: (name) => `¿Cuál es el plan perfecto de domingo para ${name}?`,
    options: ['Dormir todo el día', 'Ver películas', 'Salir a comer', 'Ir al parque', 'Jugar videojuegos', 'Cocinar algo rico'],
  },
  {
    id: 'superpoder',
    ask: 'Si tuvieras un superpoder, ¿cuál sería?',
    quiz: (name) => `¿Qué superpoder elegiría ${name}?`,
    options: ['Volar', 'Ser invisible', 'Leer mentes', 'Teletransportarse', 'Viajar en el tiempo', 'Súper fuerza'],
  },
];

export const QUIZ_LENGTH = 10;
export const QUIZ_MIN_ANSWERS = 3;

const normalize = (text) => text.trim().toLowerCase();

export const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const buildOptions = (questionId, realAnswer) => {
  const question = ABOUT_QUESTIONS.find(q => q.id === questionId);
  const fakes = shuffle(question.options.filter(o => normalize(o) !== normalize(realAnswer))).slice(0, 3);
  return shuffle([realAnswer, ...fakes]);
};

export const isSameAnswer = (a, b) => normalize(a) === normalize(b);

export const scoreLabel = (score, total) => {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.9) return '¡Se conocen muchísimo! ♡';
  if (ratio >= 0.6) return '¡Nada mal! ✦';
  return 'Hay que conocerse un poquito más ✦';
};

// "¿Quién es más probable que…?": cada día salen MOST_LIKELY_PER_DAY seguidas de la lista
export const MOST_LIKELY = [
  'llegue tarde a una cita',
  'se ría en un momento serio',
  'se coma el último pedazo de pizza sin preguntar',
  'llore viendo una película',
  'se pierda usando el GPS',
  'olvide una fecha importante',
  'gaste todo su dinero en comida',
  'diga "te amo" primero en el día',
  'se duerma primero en una llamada',
  'organice una fiesta sorpresa',
  'cante en la ducha a todo volumen',
  'se quede viendo series hasta la madrugada',
  'pida perdón primero después de una pelea',
  'se coma algo que se cayó al piso',
  'le hable a los animales en la calle',
  'compre algo que no necesita',
  'se asuste viendo una película de terror',
  'planee el próximo viaje',
  'se ría de sus propios chistes',
  'mande mensajes a las 3 de la mañana',
  'cocine algo rico sin receta',
  'queme la comida',
  'se tome mil fotos en un viaje',
  'deje la ropa tirada',
  'quiera adoptar muchas mascotas',
  'sienta celos por una tontería',
  'se emocione con un regalo pequeño',
  'olvide dónde dejó las llaves',
  'baile en público sin pena',
  'haga trampa en un juego de mesa',
  'gane una discusión',
  'pida la comida de siempre',
  'pruebe la comida del otro sin preguntar',
  'responda los mensajes más rápido',
  'deje el celular sin batería',
  'llore de felicidad en nuestra boda',
  'se despierte de mal humor',
  'se robe las cobijas en la noche',
  'diga "cinco minutos más" en la mañana',
  'se gaste la plata en un antojo',
  'cuente un secreto sin querer',
  'haga un chiste malo en el peor momento',
  'recuerde qué llevábamos puesto en la primera cita',
  'escriba una carta de amor',
  'se pierda en un centro comercial',
  'se quede en silencio cuando algo le molesta',
  'vea el final de una serie sin el otro',
  'lleve snacks a todos lados',
  'tenga la última palabra',
  'se emocione más en Navidad',
];

export const MOST_LIKELY_PER_DAY = 5;

export const mostLikelyForDay = (day) =>
  Array.from({ length: MOST_LIKELY_PER_DAY }, (_, i) => MOST_LIKELY[(day * MOST_LIKELY_PER_DAY + i) % MOST_LIKELY.length]);
