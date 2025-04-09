import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Modal, FlatList, ScrollView, Linking } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

export default function MapScreen({ currentUser }) {
  const [region, setRegion] = useState({
    latitude: 6.2476, 
    longitude: -75.5658,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [markerDescription, setMarkerDescription] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const isProcessing = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesita permiso para acceder a la ubicación');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();

    fetchMarkers();
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchMarkers = async () => {
    try {
      const { data, error } = await supabase
        .from('markers')
        .select('*');

      if (error) throw error;
      
      if (data) {
        setMarkers(data);
      }
    } catch (error) {
      console.error('Error al cargar marcadores:', error);
      alert('No se pudieron cargar los marcadores');
    }
  };

  const handleMapPress = (event) => {
    if (isAddingMarker) {
      const { coordinate } = event.nativeEvent;
      setTempMarker(coordinate);
      setModalVisible(true);
    }
  };

  const saveMarker = async () => {
    try {
      if (!tempMarker) return;

      const newMarker = {
        latitude: tempMarker.latitude,
        longitude: tempMarker.longitude,
        description: markerDescription || 'Lugar especial',
        date: new Date().toISOString(),
        created_by: currentUser
      };

      const { error } = await supabase
        .from('markers')
        .insert([newMarker]);

      if (error) throw error;

      fetchMarkers();
      
      setMarkerDescription('');
      setTempMarker(null);
      setModalVisible(false);
      setIsAddingMarker(false);
      
      alert('¡Lugar guardado con éxito!');
    } catch (error) {
      console.error('Error al guardar marcador:', error);
      alert('No se pudo guardar el lugar');
    }
  };

  const cancelMarker = () => {
    setTempMarker(null);
    setMarkerDescription('');
    setModalVisible(false);
  };

  const togglePanel = () => {
    if (isProcessing.current) return;
    
    isProcessing.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isPanelVisible && selectedMarkerId) {
      const marker = markers.find(m => m.id === selectedMarkerId);
      if (marker) {
        setRegion({
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsPanelVisible(!isPanelVisible);
      isProcessing.current = false;
    }, 50);
  };

  const focusMarker = (marker) => {
    if (isProcessing.current) return;
    
    isProcessing.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setSelectedMarkerId(marker.id);
    setIsPanelVisible(false);
    
    timeoutRef.current = setTimeout(() => {
      setRegion({
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      isProcessing.current = false;
    }, 100);
  };

  const showMarkerDetail = (marker) => {
    setSelectedMarker(marker);
    setDetailModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {tempMarker && (
          <Marker
            coordinate={tempMarker}
            pinColor="#ff6b6b"
          />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            pinColor={marker.created_by === 'salo' ? '#ff6b6b' : '#4B89DC'}
            onCalloutPress={() => showMarkerDetail(marker)}
          >
            <Callout tooltip={true}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>
                  {new Date(marker.date).toLocaleDateString()}
                </Text>
                <Text style={styles.calloutDescription} numberOfLines={2}>
                  {marker.description}
                </Text>
                <Text style={styles.calloutAction}>Toca para ver más</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      <TouchableOpacity 
        style={styles.placesButton}
        onPress={togglePanel}
      >
        <Ionicons name="list" size={24} color="white" />
        <Text style={styles.buttonText}>
          {isPanelVisible ? "Ocultar lugares" : "Ver lugares"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.addButton, 
          isAddingMarker ? styles.cancelButton : {}
        ]}
        onPress={() => setIsAddingMarker(!isAddingMarker)}
      >
        <Ionicons 
          name={isAddingMarker ? "close" : "add"} 
          size={24} 
          color="white" 
        />
        <Text style={styles.buttonText}>
          {isAddingMarker ? 'Cancelar' : 'Añadir lugar'}
        </Text>
      </TouchableOpacity>
      
      <View style={[
        styles.placesPanel, 
        { 
          height: isPanelVisible ? 250 : 0,
          opacity: isPanelVisible ? 1 : 0
        }
      ]}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Nuestros lugares especiales</Text>
          <TouchableOpacity onPress={togglePanel}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        {isPanelVisible && (
          <FlatList
            data={markers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.placeItem,
                  selectedMarkerId === item.id && styles.selectedPlaceItem
                ]} 
                onPress={() => focusMarker(item)}
              >
                <View style={[
                  styles.placeIcon, 
                  { backgroundColor: item.created_by === 'salo' ? '#ff6b6b' : '#4B89DC' }
                ]} />
                <View style={styles.placeInfo}>
                  <Text style={styles.placeDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.placeDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.placesList}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nuevo lugar especial</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Describe este lugar..."
              value={markerDescription}
              onChangeText={setMarkerDescription}
              multiline
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={cancelMarker}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={saveMarker}
              >
                <Text style={styles.textStyle}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.detailModalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.detailModalTitle}>
                {selectedMarker && new Date(selectedMarker.date).toLocaleDateString("es-ES", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.markerCreatorInfo}>
              <View style={[styles.creatorIndicator, { 
                backgroundColor: selectedMarker?.created_by === 'salo' ? '#ff6b6b' : '#4B89DC' 
              }]} />
              <Text style={styles.creatorText}>
                Añadido por {selectedMarker?.created_by === 'salo' ? 'Salo' : 'Tao'}
              </Text>
            </View>
            
            <ScrollView style={styles.detailScrollView}>
              <Text style={styles.detailText}>
                {selectedMarker?.description}
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                if (selectedMarker) {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.latitude},${selectedMarker.longitude}`;
                  Linking.openURL(url);
                }
              }}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.directionsButtonText}>Cómo llegar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  cancelButton: {
    backgroundColor: '#ff9e9e',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonSave: {
    backgroundColor: '#ff6b6b',
  },
  buttonCancel: {
    backgroundColor: '#ddd',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  callout: {
    width: 200,
    padding: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  calloutDescription: {
    fontSize: 12,
    marginTop: 5,
  },
  placesButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4B89DC',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placesPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    overflow: 'hidden', // Evita que el contenido sea visible cuando el panel está cerrado
    transition: 'height 0.3s ease', // Añade transición CSS nativa
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placesList: {
    paddingHorizontal: 15,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPlaceItem: {
    backgroundColor: '#f0f8ff',
  },
  placeIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  placeDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutAction: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: '#4B89DC',
    fontStyle: 'italic',
  },
  detailModalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  markerCreatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  creatorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  creatorText: {
    fontSize: 14,
    color: '#666',
  },
  detailScrollView: {
    maxHeight: 200,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  directionsButton: {
    backgroundColor: '#4B89DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});