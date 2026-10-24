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
