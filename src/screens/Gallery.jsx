import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { appColors } from '../utils/colors';
import * as FileSystem from 'expo-file-system';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/config';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = (width - 48) / 3;



const processImageUrl = (url, noCache = false) => {
  if (!url) return '';
  
  
  if (url.startsWith('http')) {
    
    return noCache ? `${url.split('?')[0]}?t=${Date.now()}` : url;
  } 
  
  else {
    return noCache 
      ? `${SUPABASE_URL}/storage/v1/object/public/${url}?t=${Date.now()}`
      : `${SUPABASE_URL}/storage/v1/object/public/${url}`;
  }
};


const PhotoItem = React.memo(({ item, onPress, isCurrentUser, onImageLoad, isLoaded }) => {
  const [imageError, setImageError] = useState(false);
  
  
  const imageUrl = React.useMemo(() => {
    return processImageUrl(item.image_url, false); 
  }, [item.image_url]);
  
  return (
    <TouchableOpacity 
      style={styles.thumbnailContainer}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailWrapper}>
        {!imageError ? (
          <Image 
            source={{ 
              uri: imageUrl,
              cache: 'default',
              headers: {
                'Cache-Control': 'no-cache',
                'Accept': '*/*'
              }
            }}
            style={styles.thumbnail}
            resizeMode="cover"
            loadingIndicatorSource={require('../assets/placeholder.png')}
            onLoadStart={() => console.log("Cargando imagen:", item.image_url)}
            onLoad={() => {
              console.log("Imagen cargada correctamente:", item.image_url);
              
              if (!isLoaded) {
                onImageLoad(item.id);
              }
            }}
            onError={(e) => {
              console.error("Error cargando imagen:", item.image_url, e.nativeEvent.error);
              setImageError(true);
              onImageLoad(item.id);
            }}
          />
        ) : (
          <View style={styles.imageErrorContainer}>
            <Ionicons name="image-outline" size={32} color="#999" />
            <Text style={styles.imageErrorText}>Error al cargar</Text>
          </View>
        )}
        
        {!isLoaded && !imageError && (
          <ActivityIndicator 
            style={styles.thumbnailLoader}
            color={appColors.primary}
            size="small"
          />
        )}
      </View>
      
      {isCurrentUser && (
        <View style={styles.ownerIndicator}>
          <Text style={styles.ownerText}>Tú</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function GalleryScreen({ currentUser = 'tao' }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  
  useEffect(() => {
    fetchPhotos();
  }, []);

  

  const fetchPhotos = async () => {
    try {
      setRefreshing(true);
      
      
      setLoadedImages({});
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        console.log(`Cargadas ${data.length} fotos`);
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error al cargar fotos:', error);
      Alert.alert('Error', 'No se pudieron cargar las fotos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  
  const pickAndUploadImage = async () => {
    try {
      
      console.log("Solicitando permisos de galería...");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para subir fotos');
        return;
      }

      console.log("Estado de permisos:", status);
      
      
      console.log("Abriendo galería...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        quality: 0.8,
      });
      
      console.log("Resultado de selección:", result.canceled ? "Cancelado" : "Imagen seleccionada");
      
      if (result.canceled) return;
      
      
      const uri = result.assets[0].uri;
      console.log("URI de la imagen:", uri);
      uploadImage(uri);
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploadingPhoto(true);
      
      
      console.log("Comprimiendo imagen...");
      const compressed = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      
      
      const userIdentifier = currentUser || 'user';
      const fileName = `${userIdentifier}-${Date.now()}.jpg`;
      
      
      const formData = new FormData();
      formData.append('file', {
        uri: compressed.uri,
        name: fileName,
        type: 'image/jpeg'
      });
      
      
      console.log("Subiendo imagen directamente...");
      
      
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/photo_gallery/${fileName}`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
            'x-upsert': 'true'
          },
          body: formData
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de Supabase: ${response.status} - ${errorText}`);
      }
      
      console.log("Archivo subido correctamente");
      
      
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/photo_gallery/${fileName}`;
      
      
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          image_url: publicUrl,
          caption: '',
          uploaded_by: userIdentifier,
          created_at: new Date().toISOString()
        }]);
          
      if (dbError) throw dbError;
      
      
      fetchPhotos();
      Alert.alert('Éxito', '¡Foto subida correctamente!');
      
    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error al subir imagen', error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  
  const showPhotoDetail = (photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  

  const deletePhoto = async (id) => {
    try {
      setLoading(true);
      setModalVisible(false);
      
      
      const photoToDelete = photos.find(photo => photo.id === id);
      if (!photoToDelete) {
        throw new Error('Foto no encontrada');
      }
      
      
      if (photoToDelete.uploaded_by !== currentUser) {
        throw new Error('No tienes permiso para eliminar esta foto');
      }
      
      
      setPhotos(currentPhotos => currentPhotos.filter(photo => photo.id !== id));
      
      
      const imageUrl = photoToDelete.image_url;
      const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1).split('?')[0];
      
      
      await supabase.rpc('set_user_context', { user_id: currentUser });
      
      
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;
      
      
      const { error: storageError } = await supabase
        .storage
        .from('photo_gallery')
        .remove([fileName]);
      
      if (storageError) {
        console.error("Error al eliminar del almacenamiento:", storageError);
      }
      
      
      setTimeout(() => {
        fetchPhotos();
      }, 500);
      
      Alert.alert('Éxito', '¡Foto eliminada correctamente!');
      
    } catch (error) {
      console.error("Error completo:", error);
      Alert.alert('Error', `No se pudo eliminar la foto: ${error.message}`);
      fetchPhotos();
    } finally {
      setLoading(false);
    }
  };

  
  const getPhotoDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nuestra Galería</Text>
      </View>
      
      <FlatList
        data={photos}
        renderItem={({ item }) => (
          <PhotoItem 
            item={item}
            onPress={showPhotoDetail}
            isCurrentUser={item.uploaded_by === currentUser}
            isLoaded={!!loadedImages[item.id]} 
            onImageLoad={(id) => setLoadedImages(prev => ({...prev, [id]: true}))}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.photoList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchPhotos}
            colors={[appColors.primary]} 
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator color={appColors.primary} size="large" />
            ) : (
              <Text style={styles.emptyText}>No hay fotos para mostrar</Text>
            )}
          </View>
        )}
      />
      
      <TouchableOpacity
        style={[styles.fab, uploadingPhoto && styles.disabledFab]}
        onPress={pickAndUploadImage}
        disabled={uploadingPhoto}
      >
        {uploadingPhoto ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Ionicons name="camera" size={24} color="white" />
        )}
      </TouchableOpacity>

    
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={30} color="white" />
            </TouchableOpacity>
            
            {selectedPhoto && (
              <View style={styles.photoDetailContainer}>
                <Image 
                  source={{ 
                    uri: processImageUrl(selectedPhoto.image_url),
                    cache: 'reload',
                    headers: {
                      Accept: 'image/jpeg,image/png,image/jpg'
                    }
                  }}
                  style={styles.fullImage}
                  resizeMode="contain"
                  onError={(e) => {
                    console.error("Error cargando imagen en detalle:", selectedPhoto.image_url, e.nativeEvent.error);
                  }}
                />
                
                <View style={styles.photoInfo}>
                  <Text style={styles.photoDate}>
                    {getPhotoDate(selectedPhoto.created_at)}
                  </Text>
                  
                  <Text style={styles.photoOwner}>
                    Subida por {selectedPhoto.uploaded_by === 'salo' ? 'Salo' : 'Tao'}
                  </Text>
                  
                  {selectedPhoto.uploaded_by === currentUser && (
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Eliminar foto',
                          '¿Estás seguro de que quieres eliminar esta foto?',
                          [
                            {text: 'Cancelar', style: 'cancel'},
                            {text: 'Eliminar', style: 'destructive', onPress: () => deletePhoto(selectedPhoto.id)}
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash" size={18} color="white" />
                      <Text style={styles.deleteText}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.text,
  },
  photoList: {
    padding: 10,
    paddingBottom: 80,
  },
  thumbnailContainer: {
    position: 'relative',
    margin: 4,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  thumbnailLoader: {
    position: 'absolute',
  },
  ownerIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: appColors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  ownerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  disabledFab: {
    backgroundColor: appColors.disabled,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  photoDetailContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '70%',
  },
  photoInfo: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  photoDate: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  photoOwner: {
    color: 'white',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  imageErrorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  imageErrorText: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
});