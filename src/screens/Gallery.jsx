import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';
import { appColors } from '../utils/colors';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { sendActivityNotification } from '../utils/notifications';

const { width } = Dimensions.get('window');
const imageWidth = width / 2 - 24; 

export default function GalleryScreen({ currentUser }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterUser, setFilterUser] = useState('all'); 

  
  const scale = useSharedValue(1);
  
  useEffect(() => {
    fetchImages();
  }, [filterUser]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      
      if (filterUser !== 'all') {
        query = query.eq('uploaded_by', filterUser);
      }

      const { data, error } = await query;

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      Alert.alert('Error', 'No se pudieron cargar las imágenes.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesitan permisos para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setModalVisible(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesitan permisos para acceder a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setModalVisible(true);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage?.base64) return;
    
    setUploading(true);
    
    try {
      
      const fileName = `${Date.now()}_${currentUser}.jpg`;
      
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photo_gallery')
        .upload(fileName, decode(selectedImage.base64), {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Error de subida:", uploadError);
        throw uploadError;
      }
      
      
      const { data } = supabase.storage
        .from('photo_gallery')
        .getPublicUrl(fileName);
      
      const publicURL = data.publicUrl;
      
      
      const { data: imageData, error: dbError } = await supabase
        .from('photos')
        .insert([{
          image_url: publicURL,
          caption: caption,
          uploaded_by: currentUser 
        }])
        .select();
      
      if (dbError) throw dbError;
      
      
      const otherUser = currentUser === 'salo' ? 'tao' : 'salo';
      const userName = currentUser === 'salo' ? 'Salo' : 'Tao';
      
      await sendActivityNotification(
        currentUser,
        'new_photo',
        `¡${userName} añadió una nueva foto${caption ? `: "${caption}"` : ''}!`,
        {
          photo_id: imageData[0].id,
          photo_url: publicURL
        }
      );
      
      
      fetchImages();
      
      
      setModalVisible(false);
      setCaption('');
      setSelectedImage(null);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Error', 
        `No se pudo subir la imagen: ${error.message || 'Error desconocido'}`
      );
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id, url) => {
    try {
      
      const fileName = url.split('/').pop();
      
      
      const { error: dbError } = await supabase
        .from('photos') 
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      
      const { error: storageError } = await supabase.storage
        .from('photo_gallery') 
        .remove([fileName]);
      
      
      
      if (storageError) {
        console.warn("No se pudo eliminar el archivo del storage:", storageError);
      }
      
      
      setImages(images.filter(img => img.id !== id));
      setDetailModalVisible(false);
      
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'No se pudo eliminar la imagen completamente.');
    }
  };

  
  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
      scale.value = ctx.startScale * event.scale;
    },
    onEnd: () => {
      scale.value = withSpring(1, { stiffness: 100, damping: 10 });
    },
  });

  
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  
  const renderItem = ({ item }) => {
    const isSalo = item.created_by === 'salo';
    
    return (
      <TouchableOpacity 
        style={styles.polaroidContainer}
        onPress={() => {
          setViewImage(item);
          setDetailModalVisible(true);
        }}
      >
        <View style={[
          styles.polaroidInner,
          isSalo ? styles.saloPolaroid : styles.taoPolaroid
        ]}>
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.polaroidImage}
            resizeMode="cover"
          />
          <View style={styles.polaroidCaption}>
            <Text style={styles.captionText} numberOfLines={2}>
              {item.caption || "Sin descripción"}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          {}
          <Image 
            source={isSalo ? require('../assets/Icons/Sol.png') : require('../assets/Icons/Tao.png')} 
            style={[
              styles.userIcon,
              isSalo ? styles.saloIcon : styles.taoIcon
            ]} 
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  
  const FilterButton = ({ label, value, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, filterUser === value && styles.activeFilterButton]}
      onPress={onPress}
    >
      <Text 
        style={[styles.filterButtonText, filterUser === value && styles.activeFilterText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={require('../assets/fondos/fresitasFondo.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Galería de Recuerdos</Text>
        
        {}
        <View style={styles.filterContainer}>
          <FilterButton 
            label="Todos" 
            value="all" 
            onPress={() => setFilterUser('all')} 
          />
          <FilterButton 
            label="Salo" 
            value="salo" 
            onPress={() => setFilterUser('salo')} 
          />
          <FilterButton 
            label="Tao" 
            value="tao" 
            onPress={() => setFilterUser('tao')} 
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={appColors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={images}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.galleryList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No hay imágenes para mostrar
                </Text>
                <Image 
                  source={require('../assets/saloIMG/rabbit.png')} 
                  style={styles.emptyImage} 
                />
              </View>
            }
          />
        )}
        
        {}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Galería</Text>
          </TouchableOpacity>
        </View>
        
        {}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedImage(null);
            setCaption('');
          }}
        >
          <View style={styles.modalOverlay}>
            <ImageBackground
              source={require('../assets/Label.jpg')}
              style={styles.modalBackground}
              imageStyle={styles.modalBackgroundImage}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Añadir a la Galería</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#999" />
                  </TouchableOpacity>
                </View>

                {selectedImage && (
                  <View style={styles.selectedImageContainer}>
                    <Image 
                      source={{ uri: selectedImage.uri }} 
                      style={styles.selectedImage} 
                    />
                  </View>
                )}

                <TextInput
                  style={styles.captionInput}
                  placeholder="Describe este momento..."
                  multiline={true}
                  numberOfLines={4}
                  value={caption}
                  onChangeText={setCaption}
                />

                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={uploadImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color="white" style={styles.buttonIcon} />
                      <Text style={styles.uploadButtonText}>Subir Imagen</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </Modal>
        
        {}
        <Modal
          animationType="fade"
          transparent={true}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailModalContainer}>
              {viewImage && (
                <>
                  <View style={styles.detailModalHeader}>
                    <Text style={styles.detailModalTitle}>
                      {new Date(viewImage.created_at).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                      <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <PinchGestureHandler onGestureEvent={pinchHandler}>
                    <Animated.Image
                      source={{ uri: viewImage.image_url }}
                      style={[styles.detailImage, animatedImageStyle]}
                      resizeMode="contain"
                    />
                  </PinchGestureHandler>
                  
                  <View style={styles.detailModalFooter}>
                    <View style={styles.detailModalCreator}>
                      <Image
                        source={
                          viewImage.created_by === 'salo' 
                            ? require('../assets/Icons/Sol.png')
                            : require('../assets/Icons/Tao.png')
                        }
                        style={styles.detailCreatorIcon}
                      />
                      <Text style={styles.detailCreatorText}>
                        Subido por {viewImage.created_by === 'salo' ? 'Salo' : 'Tao'}
                      </Text>
                    </View>
                    
                    {viewImage.caption && (
                      <Text style={styles.detailCaptionText}>{viewImage.caption}</Text>
                    )}
                    
                    {viewImage.created_by === currentUser && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          Alert.alert(
                            'Eliminar imagen',
                            '¿Estás seguro de que quieres eliminar esta imagen?',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Eliminar', onPress: () => deleteImage(viewImage.id, viewImage.image_url) }
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash" size={18} color="#fff" />
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: appColors.primary,
    textAlign: 'center',
    marginVertical: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  galleryList: {
    paddingBottom: 100,
  },
  
  polaroidContainer: {
    width: imageWidth,
    margin: 8,
    alignItems: 'center',
  },
  polaroidInner: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
    
    transform: [{ rotate: '1deg' }],
  },
  
  saloPolaroid: {
    borderTopWidth: 3,
    borderColor: '#FF7E7E',
    backgroundColor: 'rgba(255, 250, 250, 0.95)',
    transform: [{ rotate: '1.5deg' }],
  },
  taoPolaroid: {
    borderTopWidth: 3,
    borderColor: '#4B89DC',
    backgroundColor: 'rgba(250, 250, 255, 0.95)',
    transform: [{ rotate: '-1deg' }],
  },
  polaroidImage: {
    width: '100%',
    height: imageWidth,
    borderRadius: 4,
  },
  polaroidCaption: {
    padding: 8,
    paddingBottom: 12,
  },
  captionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  
  userIcon: {
    position: 'absolute',
    width: 30,
    height: 30,
    zIndex: 10,
  },
  saloIcon: {
    bottom: -10,
    right: -10,
    transform: [{ rotate: '10deg' }],
  },
  taoIcon: {
    bottom: -10,
    right: -10,
    transform: [{ rotate: '-5deg' }],
  },
  
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  activeFilterButton: {
    backgroundColor: appColors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    
    borderTopLeftRadius: 22,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 22,
    transform: [{ rotate: '-0.5deg' }],
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    width: width * 0.9,
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: 20,
  },
  modalBackgroundImage: {
    borderRadius: 20,
  },
  modalContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.primary,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  selectedImageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  captionInput: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 15,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  uploadButton: {
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    
    borderTopLeftRadius: 25,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 25,
    transform: [{ rotate: '0.5deg' }],
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  detailModalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  detailImage: {
    width: '100%',
    height: '70%',
    alignSelf: 'center',
  },
  detailModalFooter: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  detailModalCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailCreatorIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  detailCreatorText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  detailCaptionText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  emptyImage: {
    width: 80,
    height: 80,
    opacity: 0.7,
    marginTop: 10,
  },
  loader: {
    marginTop: 40,
  },
});