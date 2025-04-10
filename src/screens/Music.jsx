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
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { appColors } from '../utils/colors';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

export default function MusicScreen() {
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

  // Credenciales de Spotify API
  const CLIENT_ID = '56677b28071346778f24fa4ee0752ca4';
  const CLIENT_SECRET = 'f54e15b52aa540f6aa04648b7ddd6422';

  // Obtener token al iniciar
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
        // Token expirado, obtener nuevo
        await getSpotifyToken();
        
        // intenta volver a buscarla
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
      };
      
      const { data, error } = await supabase
        .from('memories')
        .insert([newSong])
        .select();

      if (error) throw error;
      
      if (data) {
        setSavedSongs([...data, ...savedSongs]);
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
    return (
      <TouchableOpacity 
        style={styles.savedSongContainer}
        onPress={() => {
          setSelectedSavedSong(item);
          setDetailModalVisible(true);
        }}
      >
        <Image source={{ uri: item.cover_image || 'https://via.placeholder.com/80' }} style={styles.savedAlbumArt} />
        <View style={styles.savedSongInfo}>
          <Text style={styles.savedSongTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.savedArtistName} numberOfLines={1}>{item.artist}</Text>
          <Text style={styles.memoryText} numberOfLines={2}>{item.memory}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation(); // Evitar que se abra el modal al eliminar
            deleteSong(item.id);
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const openSpotify = (url) => {
    try {
      // Extraer el ID de manera más robusta
      let trackId;
      
      // Comprobar si es una URL completa o es ya un ID
      if (url.includes('spotify.com/track/')) {
        // Formato URL: https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh?si=...
        const trackPath = url.split('track/')[1];
        trackId = trackPath.split('?')[0].split('/')[0];
      } else if (url.startsWith('spotify:track:')) {
        
        trackId = url.split('spotify:track:')[1];
      } else {
        // Asumimos que es directamente un ID
        trackId = url;
      }
      
      console.log("ID de canción extraído:", trackId);
      const spotifyAppUrl = `spotify:track:${trackId}`;
      
      // Intentar abrir primero la app nativa de Spotify
      Linking.canOpenURL(spotifyAppUrl)
        .then(supported => {
          if (supported) {
            console.log("Abriendo app nativa de Spotify");
            return Linking.openURL(spotifyAppUrl);
          } else {
            console.log("App no instalada, probando URL web");
            // Intentar con formato web universal
            const webUrl = `https://open.spotify.com/track/${trackId}`;
            return Linking.openURL(webUrl);
          }
        })
        .catch(err => {
          console.error("Error abriendo Spotify:", err);
          // Intento final con la URL original
          Linking.openURL(url);
        });
    } catch (error) {
      console.error("Error procesando URL de Spotify:", error);
      // Si todo falla entonces, intenta con la URL original
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
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
            Nuestras Canciones
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
            <Text style={styles.emptyText}>
              No se encontraron resultados
            </Text>
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
            <Text style={styles.emptyText}>
              Aún no hay canciones guardadas. ¡Busca y agrega canciones especiales!
            </Text>
          }
        />
      )}

    
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginRight: 8,
  },
  searchButton: {
    width: 46,
    height: 46,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  activeTab: {
    borderBottomColor: appColors.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: appColors.primary,
  },
  listContainer: {
    paddingBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  savedAlbumArt: {
    width: 60,
    height: 60,
    borderRadius: 6,
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
    marginVertical: 2,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedSongContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedAlbumArt: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  selectedSongInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  selectedSongTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedArtistName: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  memoryInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: appColors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memoryScroll: {
    maxHeight: 180,
    marginBottom: 16,
  },
  memoryFullText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  spotifyButton: {
    backgroundColor: '#1DB954', 
    flexDirection: 'row',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});