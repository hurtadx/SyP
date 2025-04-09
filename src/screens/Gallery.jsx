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
  ImageBackground,
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { appColors } from '../utils/colors';
import * as FileSystem from 'expo-file-system';


const decode = (base64String) => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return byteArray;
};

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = width / 3 - 10;

export default function GalleryScreen({ currentUser }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setRefreshing(true);
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
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

  
  const syncBucketWithDatabase = async () => {
    try {
      setLoading(true);
      
      
      const { data: files, error: bucketError } = await supabase
        .storage
        .from('photo_gallery')
        .list();
      
      if (bucketError) throw bucketError;
      
      
      const { data: existingPhotos, error: dbError } = await supabase
        .from('photos')
        .select('image_url');
      
      if (dbError) throw dbError;
      
      
      const existingUrls = existingPhotos.map(p => {
        
        const urlParts = p.image_url.split('/');
        return urlParts[urlParts.length - 1];
      });
      
      const newFiles = files.filter(file => !existingUrls.includes(file.name));
      
      
      for (const file of newFiles) {
        const { data: publicUrlData } = supabase
          .storage
          .from('photo_gallery')
          .getPublicUrl(file.name);
        
        
        const isUserSalo = file.name.startsWith('salo-');
        const isUserTao = file.name.startsWith('tao-');
        const uploadedBy = isUserSalo ? 'salo' : (isUserTao ? 'tao' : 'user');
        
        await supabase
          .from('photos')
          .insert([{
            image_url: publicUrlData.publicUrl,
            caption: '',
            uploaded_by: uploadedBy,
            created_at: new Date(file.created_at || Date.now()).toISOString()
          }]);
      }
      
      
      await fetchPhotos();
      
      if (newFiles.length > 0) {
        Alert.alert('Sincronización completa', `Se han agregado ${newFiles.length} fotos nuevas`);
      }
    } catch (error) {
      console.error('Error sincronizando fotos:', error);
      Alert.alert('Error', 'No se pudieron sincronizar las imágenes con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const openImagePicker = async () => {
    try {
      console.log("Solicitando permisos de galería...");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      console.log("Estado de permisos:", status);
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tus fotos');
        return;
      }
      
      console.log("Abriendo galería...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,  
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      console.log("Resultado de selección:", result.canceled ? "Cancelado" : "Imagen seleccionada");
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log("URI de la imagen:", result.assets[0].uri);
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al abrir el selector de imágenes:", error);
      Alert.alert(
        'Error al abrir galería', 
        'No se pudo acceder a la galería de imágenes. Por favor intenta de nuevo.'
      );
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploadingPhoto(true);
      
      
      console.log("Comprimiendo imagen...");
      const compressed = await manipulateAsync(
        uri,
        [{ resize: { width: 500 } }],
        { compress: 0.3, format: SaveFormat.JPEG }
      );
      
      
      const userIdentifier = currentUser === 'salo' || currentUser === 'tao' 
        ? currentUser 
        : 'salo'; 
      
      const fileName = `${userIdentifier}-${Date.now()}.jpg`;
      
      
      const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      console.log("Subiendo imagen...");
      
      
      const uploadPromise = new Promise(async (resolve, reject) => {
        try {
          const { data, error } = await supabase.storage
            .from('photo_gallery')
            .upload(fileName, base64, { 
              contentType: 'image/jpeg',
              upsert: true
            });
            
          if (error) reject(error);
          else resolve(data);
        } catch (err) {
          reject(err);
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Tiempo de espera agotado")), 30000)
      );
      
      
      const data = await Promise.race([uploadPromise, timeoutPromise]);
      
      console.log("Archivo subido correctamente");
      
      
      const { data: publicUrlData } = supabase
        .storage
        .from('photo_gallery')
        .getPublicUrl(fileName);
      
      
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          image_url: publicUrlData.publicUrl,
          caption: '',
          uploaded_by: userIdentifier, 
          created_at: new Date().toISOString()
        }]);
      
      if (dbError) throw dbError;
      
      fetchPhotos();
      Alert.alert('Éxito', '¡Foto subida correctamente!');
      
    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert(
        'Error al subir imagen', 
        'Verifica tu conexión a internet e inténtalo de nuevo.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showPhotoDetail = (photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const renderPhotoItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.thumbnailContainer}
        onPress={() => showPhotoDetail(item)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {item.uploaded_by === currentUser && (
          <View style={styles.ownerIndicator}>
            <Text style={styles.ownerText}>Tú</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getPhotoCreationDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ImageBackground 
      source={require('../assets/paper_texture.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Nuestra Galería</Text>
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={syncBucketWithDatabase}
            disabled={loading || refreshing}
          >
            <Ionicons name="sync" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appColors.primary} />
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={60} color="#999" />
            <Text style={styles.emptyText}>No hay fotos aún.</Text>
            <Text style={styles.emptySubtext}>¡Sube tu primera foto para crear recuerdos juntos!</Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.photoGrid}
            refreshing={refreshing}
            onRefresh={fetchPhotos}
          />
        )}

        <TouchableOpacity 
          style={[styles.addButton, uploadingPhoto && styles.disabledButton]}
          onPress={openImagePicker}
          disabled={uploadingPhoto}
        >
          {uploadingPhoto ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.buttonText}>Subir Foto</Text>
            </>
          )}
        </TouchableOpacity>
      
        
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {selectedPhoto && getPhotoCreationDate(selectedPhoto.created_at)}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close-circle" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView 
                    contentContainerStyle={styles.photoViewContainer}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                  >
                    {selectedPhoto && (
                      <Image
                        source={{ uri: selectedPhoto.image_url }}
                        style={styles.fullSizeImage}
                        resizeMode="contain"
                      />
                    )}
                  </ScrollView>
                  
                  <View style={styles.photoInfo}>
                    {selectedPhoto && selectedPhoto.caption && (
                      <Text style={styles.photoCaption}>{selectedPhoto.caption}</Text>
                    )}
                    <Text style={styles.photoUploader}>
                      Subida por {selectedPhoto?.uploaded_by === 'salo' ? 'Salo' : 'Tao'}
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: appColors.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  syncButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: appColors.accent,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGrid: {
    paddingBottom: 80, 
  },
  thumbnailContainer: {
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    position: 'relative',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  ownerIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: appColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ownerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  photoViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizeImage: {
    width: width,
    height: width,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  photoCaption: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  photoUploader: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: appColors.secondary,
    padding: 12,
    borderRadius: 30,
    elevation: 4,
  },
});