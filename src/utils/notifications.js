import { supabase } from './supabase';

const TITLES = {
  kiss: (data) => (data.special ? 'Besito besito ♡' : 'Un besito para ti ♡'),
  new_song: () => 'Nueva canción ♪',
  new_photo: () => 'Nueva foto ✦',
  new_place: () => 'Nuevo lugar ✦',
  daily_answer: () => 'Pregunta del día ♡',
  quiz: () => '¿Qué tanto me conoces? ✦',
};

export const notificationTitle = (type, data = {}) =>
  TITLES[type] ? TITLES[type](data) : 'Nueva notificación';

export const savePushToken = async (currentUser, token) => {
  const { error } = await supabase.from('user_settings')
    .upsert({ user_id: currentUser, push_token: token, updated_at: new Date().toISOString() });
  if (error) console.error('Error guardando push token:', error);
};

const sendPush = async (toUser, title, body, data, channelId) => {
  try {
    const { data: settings } = await supabase.from('user_settings')
      .select('push_token')
      .eq('user_id', toUser)
      .maybeSingle();

    if (!settings?.push_token) return false;

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        to: settings.push_token,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
        channelId,
      }),
    });
    const result = await response.json();
    return result?.data?.status === 'ok';
  } catch (error) {
    console.error('Error enviando push:', error);
    return false;
  }
};

/**
 * Envía una notificación al otro usuario cuando se realiza alguna acción
 * @param {string} currentUser - Usuario actual (salo o tao)
 * @param {string} type - Tipo de notificación (song, photo, place, etc.)
 * @param {string} message - Mensaje personalizado
 * @param {Object} data - Datos adicionales relevantes para la notificación
 */
export const sendActivityNotification = async (currentUser, type, message, data = {}) => {
  try {
    const otherUser = currentUser === 'salo' ? 'tao' : 'salo';
    const channelId = type === 'kiss' ? 'special-moments' : 'reminders';
    const pushed = await sendPush(otherUser, notificationTitle(type, data), message, data, channelId);

    const { error } = await supabase.from('notifications')
      .insert([{
        from_user: currentUser,
        to_user: otherUser,
        type: type,
        message: message,
        data: { ...data, pushed },
        seen: false,
        created_at: new Date().toISOString()
      }]);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    return false;
  }
};

/**
 * Obtiene y marca como vistas las notificaciones para el usuario actual
 * @param {string} currentUser - Usuario actual (salo o tao)
 * @returns {Array} - Arreglo de notificaciones no vistas
 */
export const getAndMarkNotifications = async (currentUser) => {
  try {
    const { data, error } = await supabase.from('notifications')
      .select('*')
      .eq('to_user', currentUser)
      .eq('seen', false);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const notificationIds = data.map(n => n.id);
      await supabase.from('notifications')
        .update({ seen: true })
        .in('id', notificationIds);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return [];
  }
};