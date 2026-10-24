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
  {
    id: 'desayuno',
    ask: '¿Cuál es tu desayuno favorito?',
    quiz: (name) => `¿Cuál es el desayuno favorito de ${name}?`,
    options: ['Arepa con huevo', 'Pancakes', 'Calentado', 'Huevos revueltos', 'Cereal', 'Frutas', 'Waffles'],
  },
  {
    id: 'fruta',
    ask: '¿Cuál es tu fruta favorita?',
    quiz: (name) => `¿Cuál es la fruta favorita de ${name}?`,
    options: ['Mango', 'Fresa', 'Banano', 'Sandía', 'Piña', 'Uva', 'Manzana'],
  },
  {
    id: 'snack',
    ask: '¿Cuál es tu snack favorito?',
    quiz: (name) => `¿Cuál es el snack favorito de ${name}?`,
    options: ['Papitas', 'Chocolate', 'Gomitas', 'Galletas', 'Palomitas', 'Maní', 'Helado'],
  },
  {
    id: 'comida_rapida',
    ask: '¿Qué comida rápida prefieres?',
    quiz: (name) => `¿Cuál es la comida rápida preferida de ${name}?`,
    options: ['Hamburguesa', 'Perro caliente', 'Pizza', 'Salchipapa', 'Empanadas', 'Tacos', 'Alitas'],
  },
  {
    id: 'helado',
    ask: '¿Qué sabor de helado prefieres?',
    quiz: (name) => `¿Cuál es el sabor de helado preferido de ${name}?`,
    options: ['Chocolate', 'Vainilla', 'Fresa', 'Arequipe', 'Mora', 'Ron con pasas', 'Limón'],
  },
  {
    id: 'pizza',
    ask: '¿Qué pizza prefieres?',
    quiz: (name) => `¿Cuál es la pizza preferida de ${name}?`,
    options: ['Hawaiana', 'Pepperoni', 'Mexicana', 'Pollo con champiñones', 'Margarita', 'Carnes', 'Vegetariana'],
  },
  {
    id: 'domicilio',
    ask: '¿Qué pedirías a domicilio ahora mismo?',
    quiz: (name) => `¿Qué pediría a domicilio ${name} ahora mismo?`,
    options: ['Pizza', 'Sushi', 'Hamburguesa', 'Pollo', 'Comida china', 'Arepas', 'Wok'],
  },
  {
    id: 'genero_musical',
    ask: '¿Qué género musical te gusta más?',
    quiz: (name) => `¿Cuál es el género musical favorito de ${name}?`,
    options: ['Reggaetón', 'Pop', 'Rock', 'Salsa', 'Baladas', 'Electrónica', 'Vallenato', 'K-pop'],
  },
  {
    id: 'artista',
    ask: '¿Cuál es tu artista favorito?',
    quiz: (name) => `¿Cuál es el artista favorito de ${name}?`,
    options: ['Bad Bunny', 'Taylor Swift', 'Karol G', 'Shakira', 'Morat', 'Feid', 'Ed Sheeran', 'Billie Eilish'],
  },
  {
    id: 'genero_pelicula',
    ask: '¿Qué tipo de películas te gustan más?',
    quiz: (name) => `¿Cuál es el tipo de películas favorito de ${name}?`,
    options: ['Comedia', 'Terror', 'Romance', 'Acción', 'Animadas', 'Ciencia ficción', 'Drama'],
  },
  {
    id: 'pixar',
    ask: '¿Cuál es tu película animada favorita?',
    quiz: (name) => `¿Cuál es la película animada favorita de ${name}?`,
    options: ['Toy Story', 'Coco', 'Up', 'Enredados', 'Frozen', 'Monsters Inc.', 'Ratatouille', 'Intensamente'],
  },
  {
    id: 'personaje',
    ask: '¿Cuál es tu personaje de ficción favorito?',
    quiz: (name) => `¿Cuál es el personaje de ficción favorito de ${name}?`,
    options: ['Harry Potter', 'Shrek', 'Spider-Man', 'Elsa', 'Stitch', 'Batman', 'Merlina'],
  },
  {
    id: 'videojuego',
    ask: '¿Cuál es tu videojuego favorito?',
    quiz: (name) => `¿Cuál es el videojuego favorito de ${name}?`,
    options: ['Minecraft', 'Mario Kart', 'Fortnite', 'FIFA', 'Among Us', 'Zelda', 'Pokémon'],
  },
  {
    id: 'caricatura',
    ask: '¿Cuál era tu caricatura favorita en tu infancia?',
    quiz: (name) => `¿Cuál era la caricatura favorita de ${name} en su infancia?`,
    options: ['Bob Esponja', 'Los Padrinos Mágicos', 'Dragon Ball', 'Pokémon', 'Hey Arnold', 'Las Chicas Superpoderosas', 'Scooby-Doo'],
  },
  {
    id: 'juguete',
    ask: '¿Cuál era tu juguete favorito en tu infancia?',
    quiz: (name) => `¿Cuál era el juguete favorito de ${name} en su infancia?`,
    options: ['Un peluche', 'Muñecas', 'Carritos', 'Legos', 'La bicicleta', 'Videojuegos', 'Una pelota'],
  },
  {
    id: 'sueno_infancia',
    ask: '¿Qué querías ser en tu infancia?',
    quiz: (name) => `¿Qué quería ser ${name} en su infancia?`,
    options: ['Astronauta', 'Cantante', 'Futbolista', 'Policía', 'Artista', 'Chef', 'Youtuber', 'Dentista'],
  },
  {
    id: 'materia',
    ask: '¿Cuál era tu materia favorita en el colegio?',
    quiz: (name) => `¿Cuál era la materia favorita de ${name} en el colegio?`,
    options: ['Matemáticas', 'Educación física', 'Artes', 'Inglés', 'Biología', 'Historia', 'Música', 'El recreo'],
  },
  {
    id: 'clima',
    ask: '¿Cuál es tu clima favorito?',
    quiz: (name) => `¿Cuál es el clima favorito de ${name}?`,
    options: ['Soleado', 'Lluvioso', 'Frío', 'Nublado', 'Calor de playa', 'Tormenta'],
  },
  {
    id: 'hora',
    ask: '¿Cuál es tu momento favorito del día?',
    quiz: (name) => `¿Cuál es el momento favorito del día de ${name}?`,
    options: ['La mañana', 'El mediodía', 'La tarde', 'El atardecer', 'La noche', 'La madrugada'],
  },
  {
    id: 'dia_semana',
    ask: '¿Cuál es tu día favorito de la semana?',
    quiz: (name) => `¿Cuál es el día favorito de la semana de ${name}?`,
    options: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  },
  {
    id: 'epoca',
    ask: '¿Qué época del año te gusta más?',
    quiz: (name) => `¿Cuál es la época del año favorita de ${name}?`,
    options: ['Navidad', 'Año nuevo', 'Vacaciones de mitad de año', 'Halloween', 'Semana Santa', 'Mi cumpleaños'],
  },
  {
    id: 'flor',
    ask: '¿Cuál es tu flor favorita?',
    quiz: (name) => `¿Cuál es la flor favorita de ${name}?`,
    options: ['Rosas', 'Girasoles', 'Tulipanes', 'Margaritas', 'Orquídeas', 'Lirios'],
  },
  {
    id: 'olor',
    ask: '¿Cuál es tu olor favorito?',
    quiz: (name) => `¿Cuál es el olor favorito de ${name}?`,
    options: ['Café recién hecho', 'Lluvia', 'Pan recién horneado', 'Ropa limpia', 'Vainilla', 'Perfume', 'Chocolate'],
  },
  {
    id: 'numero',
    ask: '¿Cuál es tu número favorito?',
    quiz: (name) => `¿Cuál es el número favorito de ${name}?`,
    options: ['3', '7', '8', '13', '21', '1', '10'],
  },
  {
    id: 'deporte',
    ask: '¿Qué deporte te gusta más?',
    quiz: (name) => `¿Cuál es el deporte favorito de ${name}?`,
    options: ['Fútbol', 'Natación', 'Baloncesto', 'Voleibol', 'Tenis', 'Ciclismo', 'Ninguno'],
  },
  {
    id: 'mascota',
    ask: '¿Qué mascota te gustaría tener?',
    quiz: (name) => `¿Qué mascota le gustaría tener a ${name}?`,
    options: ['Perro', 'Gato', 'Conejo', 'Hámster', 'Tortuga', 'Loro', 'Pez'],
  },
  {
    id: 'talento',
    ask: '¿Cuál es tu talento oculto?',
    quiz: (name) => `¿Cuál es el talento oculto de ${name}?`,
    options: ['Cantar', 'Dibujar', 'Cocinar', 'Bailar', 'Imitar voces', 'Hacer reír', 'Recordar fechas'],
  },
  {
    id: 'mania',
    ask: '¿Qué manía tienes?',
    quiz: (name) => `¿Qué manía tiene ${name}?`,
    options: ['Morderme las uñas', 'Mover la pierna', 'Ordenar todo', 'Revisar el celular', 'Hablar sin parar', 'Tararear canciones'],
  },
  {
    id: 'app',
    ask: '¿Qué app usas más?',
    quiz: (name) => `¿Qué app usa más ${name}?`,
    options: ['TikTok', 'Instagram', 'WhatsApp', 'YouTube', 'Spotify', 'Netflix', 'Pinterest'],
  },
  {
    id: 'emoji',
    ask: '¿Cuál es tu emoji más usado?',
    quiz: (name) => `¿Cuál es el emoji que más usa ${name}?`,
    options: ['😂', '❤️', '🥺', '😭', '🥰', '✨', '😅'],
  },
  {
    id: 'palabra',
    ask: '¿Qué palabra dices demasiado?',
    quiz: (name) => `¿Qué palabra dice demasiado ${name}?`,
    options: ['Literal', 'Obvio', 'Parce', 'Qué pena', 'O sea', 'Jajaja', 'Normal'],
  },
  {
    id: 'prenda',
    ask: '¿Qué prenda usas más?',
    quiz: (name) => `¿Qué prenda usa más ${name}?`,
    options: ['Hoodie', 'Jeans', 'Pijama', 'Camiseta oversize', 'Tenis', 'Vestido', 'Sudadera'],
  },
  {
    id: 'siempre_lleva',
    ask: '¿Qué cosa siempre llevas contigo?',
    quiz: (name) => `¿Qué cosa siempre lleva ${name}?`,
    options: ['El celular', 'Audífonos', 'Bálsamo de labios', 'Las llaves', 'Agua', 'Un snack', 'El cargador'],
  },
  {
    id: 'lugar_casa',
    ask: '¿Cuál es tu lugar favorito de la casa?',
    quiz: (name) => `¿Cuál es el lugar favorito de la casa de ${name}?`,
    options: ['La cama', 'El sofá', 'La cocina', 'El balcón', 'La ducha', 'El escritorio'],
  },
  {
    id: 'lugar_ciudad',
    ask: '¿Cuál es tu lugar favorito de la ciudad?',
    quiz: (name) => `¿Cuál es el lugar favorito de la ciudad de ${name}?`,
    options: ['Un parque', 'Un centro comercial', 'Un mirador', 'Una cafetería', 'Un restaurante', 'El cine', 'Un museo'],
  },
  {
    id: 'vivir',
    ask: '¿Dónde te gustaría vivir?',
    quiz: (name) => `¿Dónde le gustaría vivir a ${name}?`,
    options: ['En la playa', 'En la montaña', 'En una ciudad grande', 'En el campo', 'En otro país', 'En una cabaña'],
  },
  {
    id: 'cita',
    ask: '¿Cuál sería tu cita ideal?',
    quiz: (name) => `¿Cuál es la cita ideal de ${name}?`,
    options: ['Cena romántica', 'Picnic', 'Cine', 'Ver el atardecer', 'Parque de diversiones', 'Películas en casa', 'Viaje sorpresa'],
  },
  {
    id: 'regalo',
    ask: '¿Qué regalo te encantaría recibir?',
    quiz: (name) => `¿Qué regalo le encantaría recibir a ${name}?`,
    options: ['Flores', 'Una carta', 'Ropa', 'Chocolates', 'Un viaje', 'Un peluche', 'Algo hecho a mano'],
  },
  {
    id: 'amor',
    ask: '¿Cómo te gusta más recibir amor?',
    quiz: (name) => `¿Cómo le gusta más recibir amor a ${name}?`,
    options: ['Palabras bonitas', 'Tiempo de calidad', 'Abrazos y besos', 'Regalos', 'Detalles y ayuda'],
  },
  {
    id: 'relaja',
    ask: '¿Qué es lo que más te relaja?',
    quiz: (name) => `¿Qué es lo que más relaja a ${name}?`,
    options: ['Dormir', 'Escuchar música', 'Una ducha caliente', 'Caminar', 'Ver series', 'Comer algo rico', 'Hablar contigo'],
  },
  {
    id: 'llorar',
    ask: '¿Qué te hace llorar fácil?',
    quiz: (name) => `¿Qué hace llorar fácil a ${name}?`,
    options: ['Películas tristes', 'Videos de perritos', 'Canciones', 'Despedidas', 'La cebolla', 'Que me regañen'],
  },
  {
    id: 'pereza',
    ask: '¿Qué te da más pereza?',
    quiz: (name) => `¿Qué es lo que más pereza le da a ${name}?`,
    options: ['Lavar los platos', 'Madrugar', 'Hacer ejercicio', 'Ordenar el cuarto', 'Hacer filas', 'Planchar'],
  },
  {
    id: 'despertar',
    ask: '¿Qué es lo primero que haces al despertar?',
    quiz: (name) => `¿Qué es lo primero que hace ${name} al despertar?`,
    options: ['Ver el celular', 'Ir al baño', 'Tomar agua', 'Hacer café', 'Volver a dormir', 'Bañarme', 'Escribirte'],
  },
  {
    id: 'loteria',
    ask: '¿Qué harías si te ganaras la lotería?',
    quiz: (name) => `¿Qué haría ${name} si se ganara la lotería?`,
    options: ['Viajar por el mundo', 'Comprar una casa', 'Ayudar a mi familia', 'Ahorrarlo todo', 'Montar un negocio', 'Comprar un carro'],
  },
  {
    id: 'sueno',
    ask: '¿Cuál es tu mayor sueño?',
    quiz: (name) => `¿Cuál es el mayor sueño de ${name}?`,
    options: ['Viajar por el mundo', 'Tener casa propia', 'Tener mi propio negocio', 'Formar una familia', 'Graduarme', 'Vivir en otro país'],
  },
];

export const QUIZ_LENGTH = 10;

// Cada día se desbloquean ABOUT_PER_DAY preguntas nuevas del "Sobre mí"
export const ABOUT_PER_DAY = 5;

export const aboutForDay = (day) =>
  Array.from({ length: ABOUT_PER_DAY }, (_, i) => ABOUT_QUESTIONS[(day * ABOUT_PER_DAY + i) % ABOUT_QUESTIONS.length]);
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
