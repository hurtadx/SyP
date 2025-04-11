import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Linking,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { appColors } from '../utils/colors';
import { supabase } from '../utils/supabase';
import { sendActivityNotification } from '../utils/notifications';

const { width } = Dimensions.get('window');

export default function MusicScreen({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedSongs, setSavedSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [memory, setMemory] = useState('');
  const [viewMode, setViewMode] = useState('saved'); 
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSavedSong, setSelectedSavedSong] = useState(null);

  
  const CLIENT_ID = '56677b28071346778f24fa4ee0752ca4';
  const CLIENT_SECRET = 'f54e15b52aa540f6aa04648b7ddd6422';

  
  useEffect(() => {
    getSpotifyToken();
    loadSavedSongs();
  }, []);

  const getSpotifyToken = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      setToken(data.access_token);
      await AsyncStorage.setItem('spotify_token', data.access_token);
    } catch (error) {
      console.error('Error obteniendo token de Spotify:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando canciones:', error);
        return;
      }

      if (data) {
        setSavedSongs(data);
      }
    } catch (error) {
      console.error('Error cargando canciones guardadas:', error);
    }
  };

  const searchSpotify = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setViewMode('search');
    
    try {
      if (!token) {
        await getSpotifyToken();
      }
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 401) {
        
        await getSpotifyToken();
        
        
        const retryResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const data = await retryResponse.json();
        setSearchResults(data.tracks.items);
      } else {
        const data = await response.json();
        setSearchResults(data.tracks.items);
      }
    } catch (error) {
      console.error('Error buscando en Spotify:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSong = async () => {
    if (!selectedSong || !memory.trim()) return;
    
    setLoading(true);
    
    try {
      const newSong = {
        song_id: selectedSong.id,
        title: selectedSong.name,
        artist: selectedSong.artists.map(artist => artist.name).join(', '),
        album: selectedSong.album.name,
        cover_image: selectedSong.album.images[0]?.url || '',
        spotify_url: selectedSong.external_urls.spotify,
        memory: memory,
        added_by: currentUser || 'unknown'
      };
      
      const { data, error } = await supabase
        .from('memories')
        .insert([newSong])
        .select();

      if (error) throw error;
      
      if (data) {
        setSavedSongs([...data, ...savedSongs]);
        
        // Enviar notificación al otro usuario
        const userName = currentUser === 'salo' ? 'Salo' : 'Tao';
        await sendActivityNotification(
          currentUser,
          'new_song',
          `¡${userName} añadió una nueva canción: "${selectedSong.name}"!`,
          {
            song_id: data[0].id,
            song_title: selectedSong.name,
            artist: selectedSong.artists.map(artist => artist.name).join(', ')
          }
        );
      }
      
      setModalVisible(false);
      setMemory('');
      setSelectedSong(null);
      setViewMode('saved');
    } catch (error) {
      console.error('Error guardando canción:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSong = async (id) => {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSavedSongs(savedSongs.filter(song => song.id !== id));
    } catch (error) {
      console.error('Error eliminando canción:', error);
    }
  };

  const renderSearchItem = ({ item }) => {
    const albumArt = item.album.images[0]?.url || 'https://via.placeholder.com/60';
    
    return (
      <TouchableOpacity 
        style={styles.searchResultItem}
        onPress={() => {
          setSelectedSong(item);
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: albumArt }} style={styles.albumArt} />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {item.artists.map(artist => artist.name).join(', ')}
          </Text>
        </View>
        <View style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={appColors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSavedItem = ({ item }) => {
    const isSalo = item.added_by === 'salo';
    
    return (
      <TouchableOpacity 
        style={styles.savedSongContainer}
        onPress={() => {
          setSelectedSavedSong(item);
          setDetailModalVisible(true);
        }}
      >
        <View style={[
          styles.savedSongInner,
          
          isSalo ? styles.saloSongContainer : styles.taoSongContainer
        ]}>
          <Image 
            source={{ uri: item.cover_image || 'https://via.placeholder.com/80' }} 
            style={styles.savedAlbumArt} 
          />
          <View style={styles.savedSongInfo}>
            <Text style={styles.savedSongTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.savedArtistName} numberOfLines={1}>{item.artist}</Text>
            <Text style={styles.memoryText} numberOfLines={2}>{item.memory}</Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              deleteSong(item.id);
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        {}
        {item.added_by && (
          <Image 
            source={isSalo ? require('../assets/Icons/Sol.png') : require('../assets/Icons/Tao.png')} 
            style={[
              styles.userIcon,
              isSalo ? styles.saloIcon : styles.taoIcon
            ]} 
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    );
  };

  const openSpotify = (url) => {
    try {
      
      let trackId;
      
      
      if (url.includes('spotify.com/track/')) {
        const trackPath = url.split('track/')[1];
        trackId = trackPath.split('?')[0].split('/')[0];
      } else if (url.startsWith('spotify:track:')) {
        trackId = url.split('spotify:track:')[1];
      } else {
        trackId = url;
      }
      
      const spotifyAppUrl = `spotify:track:${trackId}`;
      
      Linking.canOpenURL(spotifyAppUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(spotifyAppUrl);
          } else {
            const webUrl = `https://open.spotify.com/track/${trackId}`;
            return Linking.openURL(webUrl);
          }
        })
        .catch(err => {
          console.error("Error abriendo Spotify:", err);
          Linking.openURL(url);
        });
    } catch (error) {
      console.error("Error procesando URL de Spotify:", error);
      Linking.openURL(url);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/fondos/tomatesFondo.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Nuestras Canciones</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar una canción..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchSpotify}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchSpotify}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, viewMode === 'saved' && styles.activeTab]}
            onPress={() => setViewMode('saved')}
          >
            <Text style={[styles.tabText, viewMode === 'saved' && styles.activeTabText]}>
              Nuestra Música
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, viewMode === 'search' && styles.activeTab]}
            onPress={() => searchResults.length > 0 && setViewMode('search')}
          >
            <Text style={[styles.tabText, viewMode === 'search' && styles.activeTabText]}>
              Resultados
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appColors.primary} />
          </View>
        )}

        {!loading && viewMode === 'search' && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No se encontraron resultados
                </Text>
                <Image
                  source={require('../assets/Icons/Sol.png')}
                  style={styles.emptyImage}
                />
              </View>
            }
          />
        )}

        {!loading && viewMode === 'saved' && (
          <FlatList
            data={savedSongs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSavedItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Aún no hay canciones guardadas. ¡Busca y agrega canciones especiales!
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
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ImageBackground
              source={require('../assets/Label.jpg')}
              style={styles.modalBackground}
              imageStyle={styles.modalBackgroundImage}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Añadir un recuerdo</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#999" />
                  </TouchableOpacity>
                </View>

                {selectedSong && (
                  <View style={styles.selectedSongContainer}>
                    <Image 
                      source={{ uri: selectedSong.album.images[0]?.url }} 
                      style={styles.selectedAlbumArt} 
                    />
                    <View style={styles.selectedSongInfo}>
                      <Text style={styles.selectedSongTitle} numberOfLines={2}>
                        {selectedSong.name}
                      </Text>
                      <Text style={styles.selectedArtistName} numberOfLines={1}>
                        {selectedSong.artists.map(artist => artist.name).join(', ')}
                      </Text>
                    </View>
                  </View>
                )}

                <TextInput
                  style={styles.memoryInput}
                  placeholder="¿Qué recuerdo te trae esta canción?"
                  multiline={true}
                  numberOfLines={4}
                  value={memory}
                  onChangeText={setMemory}
                />

                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={saveSong}
                  disabled={!memory.trim()}
                >
                  <Text style={styles.saveButtonText}>Guardar Recuerdo</Text>
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
          <View style={styles.modalOverlay}>
            <ImageBackground
              source={require('../assets/Label.jpg')}
              style={styles.modalBackground}
              imageStyle={styles.modalBackgroundImage}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Nuestro recuerdo</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#999" />
                  </TouchableOpacity>
                </View>

                {selectedSavedSong && (
                  <>
                    <View style={styles.selectedSongContainer}>
                      <Image 
                        source={{ uri: selectedSavedSong.cover_image }} 
                        style={styles.selectedAlbumArt} 
                      />
                      <View style={styles.selectedSongInfo}>
                        <Text style={styles.selectedSongTitle} numberOfLines={2}>
                          {selectedSavedSong.title}
                        </Text>
                        <Text style={styles.selectedArtistName} numberOfLines={1}>
                          {selectedSavedSong.artist}
                        </Text>
                      </View>
                      
                      {selectedSavedSong.added_by && (
                        <Image 
                          source={
                            selectedSavedSong.added_by === 'salo' 
                              ? require('../assets/Icons/Sol.png') 
                              : require('../assets/Icons/Tao.png')
                          } 
                          style={styles.detailUserIcon} 
                          resizeMode="contain"
                        />
                      )}
                    </View>
                    
                    <ScrollView style={styles.memoryScroll}>
                      <Text style={styles.memoryFullText}>{selectedSavedSong.memory}</Text>
                    </ScrollView>

                    <TouchableOpacity 
                      style={styles.spotifyButton} 
                      onPress={() => openSpotify(selectedSavedSong.spotify_url)}
                    >
                      <Ionicons name="musical-notes" size={20} color="white" style={styles.buttonIcon} />
                      <Text style={styles.spotifyButtonText}>Abrir en Spotify</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ImageBackground>
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
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: appColors.primary,
    textAlign: 'center',
    marginVertical: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 18,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    transform: [{ rotate: '0.5deg' }],
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: appColors.primary,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 22,
    transform: [{ rotate: '-0.3deg' }],
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  albumArt: {
    width: 55,
    height: 55,
    borderRadius: 6,
  },
  songInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  artistName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    padding: 6,
  },
  savedSongContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  savedSongInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
    
    
    borderTopLeftRadius: 18,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 20,
    transform: [{ rotate: '0.3deg' }],
  },
  savedAlbumArt: {
    width: 65,
    height: 65,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  savedSongInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  savedSongTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  savedArtistName: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
  memoryText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteButton: {
    padding: 6,
  },
  userIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 10,
  },
  saloIcon: {
    bottom: -10,
    right: 0,
    transform: [{ rotate: '10deg' }],
  },
  taoIcon: {
    bottom: -10,
    right: 0,
    transform: [{ rotate: '-5deg' }],
  },
  saloSongContainer: {
    backgroundColor: 'rgba(255, 240, 240, 0.95)',
    borderColor: 'rgba(255, 126, 126, 0.5)',
    borderWidth: 1.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 22,
    transform: [{ rotate: '0.3deg' }],
    shadowColor: '#FF7E7E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  taoSongContainer: {
    backgroundColor: 'rgba(240, 245, 255, 0.95)',
    borderColor: 'rgba(75, 137, 220, 0.5)',
    borderWidth: 1.5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 14,
    transform: [{ rotate: '-0.3deg' }],
    shadowColor: '#4B89DC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
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
  selectedSongContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedAlbumArt: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedSongInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  selectedSongTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedArtistName: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  detailUserIcon: {
    position: 'absolute',
    width: 35,
    height: 35,
    top: -10,
    right: -10,
    transform: [{ rotate: '10deg' }],
  },
  memoryInput: {
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
  saveButton: {
    backgroundColor: appColors.primary,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
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
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  memoryScroll: {
    maxHeight: 180,
    marginBottom: 20,
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderRadius: 10,
    padding: 12,
  },
  memoryFullText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  spotifyButton: {
    backgroundColor: '#1DB954',
    flexDirection: 'row',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    
    
    borderTopLeftRadius: 20,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 15,
    transform: [{ rotate: '-0.5deg' }],
  },
  spotifyButtonText: {
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
});