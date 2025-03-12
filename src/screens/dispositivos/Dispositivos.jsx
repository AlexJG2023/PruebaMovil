import React, { useState, useEffect } from 'react';
import { 
    Text, 
    View, 
    ImageBackground, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    Modal, 
    Alert,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { NativeBaseProvider, Select, CheckIcon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Dispositivos.styles';
import { 
    agregarDispositivo, 
    eliminarDispositivo, 
    actualizarDispositivo, 
    obtenerDispositivos,
    obtenerUsuarios,
    inicializarDB
} from '../../servicios/Database';
import { useSQLiteContext } from 'expo-sqlite';

const image = require('../../../assets/fondo.png'); 

export const Dispositivos = () => {
  const db = useSQLiteContext();
  const [nombre, setNombre] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [estado, setEstado] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [dispositivoEditando, setDispositivoEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  const recargarDatos = async () => {
    try {
      setLoading(true);
      await db.withExclusiveTransactionAsync(async () => {
        const listaDispositivos = await obtenerDispositivos(db);
        const listaUsuarios = await obtenerUsuarios(db);
        setDispositivos(listaDispositivos);
        setUsuarios(listaUsuarios);
      });
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      try {
        await inicializarDB(db);
        recargarDatos();
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    
    inicializar();
  }, []);

  const handleAgregarDispositivo = async () => {
    if (nombre.trim()) {
      try {
        await agregarDispositivo(db, nombre, modelo, numeroSerie, estado, usuarioId || null);
        limpiarFormulario();
        await recargarDatos();
      } catch (error) {
        console.error("Error al agregar dispositivo:", error);
        Alert.alert("Error", "No se pudo agregar el dispositivo");
      }
    } else {
      Alert.alert("Error", "El nombre del dispositivo es obligatorio");
    }
  };

  const handleEditarDispositivo = (dispositivo) => {
    setDispositivoEditando(dispositivo);
    setNombre(dispositivo.nombre);
    setModelo(dispositivo.modelo || '');
    setNumeroSerie(dispositivo.numero_serie || '');
    setEstado(dispositivo.estado || '');
    setUsuarioId(dispositivo.usuario_id ? String(dispositivo.usuario_id) : '');
    setModalVisible(true);
  };

  const handleGuardarCambios = async () => {
    if (nombre.trim()) {
      try {
        await actualizarDispositivo(
          db, 
          dispositivoEditando.id, 
          nombre, 
          modelo, 
          numeroSerie, 
          estado, 
          usuarioId || null
        );
        setModalVisible(false);
        limpiarFormulario();
        await recargarDatos();
      } catch (error) {
        console.error("Error al actualizar dispositivo:", error);
        Alert.alert("Error", "No se pudo actualizar el dispositivo");
      }
    } else {
      Alert.alert("Error", "El nombre del dispositivo es obligatorio");
    }
  };

  const handleEliminarDispositivo = async (id) => {
    try {
      Alert.alert(
        "Confirmar eliminación",
        "¿Estás seguro de que deseas eliminar este dispositivo?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Eliminar", 
            onPress: async () => {
              await eliminarDispositivo(db, id);
              await recargarDatos();
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error al eliminar dispositivo:", error);
      Alert.alert("Error", "No se pudo eliminar el dispositivo");
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setModelo('');
    setNumeroSerie('');
    setEstado('');
    setUsuarioId('');
    setDispositivoEditando(null);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Activo': return '#22C55E';
      case 'Inactivo': return '#EF4444';
      case 'En reparación': return '#F97316';
      default: return '#A3A3A3';
    }
  };

  const estadosDisponibles = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' },
    { label: 'En reparación', value: 'En reparación' },
    { label: 'Desconocido', value: 'Desconocido' }
  ];

  const renderItem = ({ item }) => (
    <View key={item.id} style={styles.itemContainer}>
      <View style={styles.deviceIconContainer}>
        <Ionicons name="hardware-chip" size={24} color="#10B981" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.nombreDispositivo}>{item.nombre}</Text>
        {item.modelo && <Text style={styles.modeloText}>Modelo: {item.modelo}</Text>}
        {item.numero_serie && <Text style={styles.serieText}>S/N: {item.numero_serie}</Text>}
        {item.nombre_usuario && (
          <View style={styles.usuarioAsignado}>
            <Ionicons name="person-outline" size={12} color="#A3A3A3" />
            <Text style={styles.usuarioText}>{item.nombre_usuario}</Text>
          </View>
        )}
        {item.estado && (
          <View style={[styles.estadoBadge, { backgroundColor: `${getEstadoColor(item.estado)}20` }]}>
            <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
              {item.estado}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditarDispositivo(item)}
        >
          <Ionicons name="create-outline" size={20} color="#0891B2" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleEliminarDispositivo(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#E11D48" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.title}>Gestión de Dispositivos</Text>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Buscar dispositivos..."
                  placeholderTextColor="#888"
                />
              </View>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Agregar Dispositivo</Text>
              <TextInput
                style={styles.entrada}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del dispositivo"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.entrada}
                value={modelo}
                onChangeText={setModelo}
                placeholder="Modelo (opcional)"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.entrada}
                value={numeroSerie}
                onChangeText={setNumeroSerie}
                placeholder="Número de serie (opcional)"
                placeholderTextColor="#888"
              />
              
              <Select
                selectedValue={estado}
                minWidth="200"
                height="50"
                borderWidth={0}
                backgroundColor="rgba(255, 255, 255, 0.9)"
                borderRadius={10}
                marginBottom={3}
                fontSize={16}
                color="#333"
                placeholder="Seleccione un estado"
                _selectedItem={{
                  bg: "teal.600",
                  endIcon: <CheckIcon size="5" />
                }}
                onValueChange={itemValue => setEstado(itemValue)}
              >
                {estadosDisponibles.map((item) => (
                  <Select.Item 
                    key={item.value} 
                    label={item.label} 
                    value={item.value} 
                  />
                ))}
              </Select>
              
              <Select
                selectedValue={usuarioId}
                minWidth="200"
                height="50"
                borderWidth={0}
                backgroundColor="rgba(255, 255, 255, 0.9)"
                borderRadius={10}
                marginBottom={3}
                fontSize={16}
                color="#333"
                placeholder="Asignar a un usuario (opcional)"
                _selectedItem={{
                  bg: "teal.600",
                  endIcon: <CheckIcon size="5" />
                }}
                onValueChange={itemValue => setUsuarioId(itemValue)}
              >
                {usuarios.map((usuario) => (
                  <Select.Item 
                    key={usuario.id} 
                    label={usuario.nombre} 
                    value={usuario.id.toString()} 
                  />
                ))}
              </Select>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAgregarDispositivo}
              >
                <Text style={styles.addButtonText}>Agregar Dispositivo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listaContainer}>
              <Text style={styles.tituloSeccion}>Lista de Dispositivos</Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.loadingText}>Cargando dispositivos...</Text>
                </View>
              ) : dispositivos.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="hardware-chip" size={50} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyListText}>No hay dispositivos registrados</Text>
                  <Text style={styles.emptySubText}>Agrega un dispositivo para comenzar</Text>
                </View>
              ) : (
                <FlatList
                  data={dispositivos}
                  renderItem={renderItem}
                  keyExtractor={item => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
            
            {/* Modal para editar dispositivo */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Editar Dispositivo</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        setModalVisible(false);
                        limpiarFormulario();
                      }}
                    >
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalForm}>
                    <Text style={styles.inputLabel}>Nombre del dispositivo *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={nombre}
                      onChangeText={setNombre}
                      placeholder="Nombre del dispositivo"
                    />
                    
                    <Text style={styles.inputLabel}>Modelo</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={modelo}
                      onChangeText={setModelo}
                      placeholder="Modelo del dispositivo"
                    />
                    
                    <Text style={styles.inputLabel}>Número de serie</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={numeroSerie}
                      onChangeText={setNumeroSerie}
                      placeholder="Número de serie"
                    />
                    
                    <Text style={styles.inputLabel}>Estado</Text>
                    <Select
                      selectedValue={estado}
                      minWidth="200"
                      height="50"
                      borderWidth={1}
                      borderColor="#ddd"
                      backgroundColor="#f5f5f5"
                      borderRadius={10}
                      marginBottom={12}
                      fontSize={16}
                      color="#333"
                      placeholder="Seleccione un estado"
                      _selectedItem={{
                        bg: "teal.600",
                        endIcon: <CheckIcon size="5" />
                      }}
                      onValueChange={itemValue => setEstado(itemValue)}
                    >
                      {estadosDisponibles.map((item) => (
                        <Select.Item 
                          key={item.value} 
                          label={item.label} 
                          value={item.value} 
                        />
                      ))}
                    </Select>
                    
                    <Text style={styles.inputLabel}>Asignar a un usuario</Text>
                    <Select
                      selectedValue={usuarioId}
                      minWidth="200"
                      height="50"
                      borderWidth={1}
                      borderColor="#ddd"
                      backgroundColor="#f5f5f5"
                      borderRadius={10}
                      marginBottom={12}
                      fontSize={16}
                      color="#333"
                      placeholder="Seleccione un usuario"
                      _selectedItem={{
                        bg: "teal.600",
                        endIcon: <CheckIcon size="5" />
                      }}
                      onValueChange={itemValue => setUsuarioId(itemValue)}
                    >
                      <Select.Item label="Sin asignar" value="" />
                      {usuarios.map((usuario) => (
                        <Select.Item 
                          key={usuario.id} 
                          label={usuario.nombre} 
                          value={usuario.id.toString()} 
                        />
                      ))}
                    </Select>
                  </View>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.buttonCancel]}
                      onPress={() => {
                        setModalVisible(!modalVisible);
                        limpiarFormulario();
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.buttonSave]}
                      onPress={handleGuardarCambios}
                    >
                      <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </ImageBackground>
      </View>
    </NativeBaseProvider>
  );
};