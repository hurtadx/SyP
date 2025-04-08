import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
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

  useEffect(() => {
    (async () => {
      //llama al metodo para obtener los permisos de la ubicacion
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesita permiso para acceder a la ubicación');
        return;
      }

      // la misma mrd
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();

    // Cargar marcadores que esten guardados en la base de datos
    fetchMarkers();
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

      // Recargar marcadores
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
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{new Date(marker.date).toLocaleDateString()}</Text>
                <Text style={styles.calloutDescription}>{marker.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
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
});