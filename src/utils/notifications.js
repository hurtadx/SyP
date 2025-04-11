import { supabase } from './supabase';

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
    
    const { error } = await supabase.from('notifications')
      .insert([{
        from_user: currentUser,
        to_user: otherUser,
        type: type,
        message: message,
        data: data,
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