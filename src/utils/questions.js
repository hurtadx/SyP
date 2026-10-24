export const QUESTIONS = [
  '¿Cuál fue tu primera impresión de mí?',
  '¿Qué fue lo primero que te enamoró de mí?',
  '¿En qué momento supiste que te gustaba?',
  '¿Cuál es tu recuerdo favorito de nosotros?',
  '¿Qué pensaste la primera vez que hablamos?',
  '¿Qué es lo que más te gusta de cómo te miro?',
  '¿Cuál ha sido nuestra mejor cita hasta ahora?',
  '¿Qué canción te recuerda a mí y por qué?',
  '¿Qué es algo pequeño que hago que te hace feliz?',
  '¿A dónde te gustaría que viajáramos los dos?',
  '¿Qué cosa nueva te gustaría que hiciéramos los dos?',
  '¿Cuál fue el momento en que más te reíste conmigo?',
  '¿Qué fue lo que más te sorprendió de mí al conocerme?',
  '¿Qué apodo mío es tu favorito?',
  '¿Cómo describirías nuestra relación en tres palabras?',
  '¿Qué es lo que más extrañas de mí cuando no nos vemos?',
  '¿Cuál es tu foto favorita de nosotros?',
  '¿Qué día con nosotros repetirías si pudieras?',
  '¿Qué es algo que nunca le has dicho a nadie más que a mí?',
  '¿Qué te gustaría que hiciéramos en nuestro próximo aniversario?',
  '¿Qué comida te recuerda a nosotros?',
  '¿Cuál es el mejor regalo que te he dado?',
  '¿Qué cualidad mía admiras más?',
  '¿Qué es lo primero que piensas cuando despiertas y me recuerdas?',
  '¿Cómo te imaginas que seremos en diez años?',
  '¿Qué lugar es especial para nosotros y por qué?',
  '¿Cuándo sientes más mi amor?',
  '¿Cuál fue tu reacción cuando te di el primer beso?',
  '¿Qué es algo que te gustaría aprender conmigo?',
  '¿Qué película te gustaría que viéramos los dos otra vez?',
  '¿Qué sueño te gustaría que cumpliéramos los dos?',
  '¿Qué fue lo que más te costó decirme al principio?',
  '¿Cuál es tu forma favorita de pasar un domingo conmigo?',
  '¿Qué olor te recuerda a mí?',
  '¿Qué te gustaría que hiciera más seguido?',
  '¿Qué momento difícil superamos que te llena de orgullo?',
  '¿Qué pensaste la primera vez que me viste sonreír?',
  '¿Qué tres cosas te llevarías a una isla desierta si yo voy contigo?',
  '¿Cuál es tu recuerdo más tierno de mí?',
  '¿Qué es lo que más te gusta de nuestras conversaciones?',
  '¿Qué cita sorpresa te gustaría que te preparara?',
  '¿Qué fue lo que te hizo confiar en mí?',
  '¿Qué es algo de mí que te parece adorable y yo no lo sé?',
  '¿Qué te gustaría decirme hoy que no me hayas dicho?',
  '¿Cuál es la mejor noche que hemos pasado los dos?',
  '¿Qué tradición te gustaría que tuviéramos?',
  '¿Qué te hace reír de mí aunque no lo admitas?',
  '¿Qué es lo que más te gusta de cuando estamos a solas?',
  '¿Qué aventura loca te gustaría vivir conmigo?',
  '¿Por qué me elegirías otra vez?',
];

const dayNumber = (date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

export const dateKey = (date = new Date()) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const questionForDate = (date = new Date()) => QUESTIONS[dayNumber(date) % QUESTIONS.length];

