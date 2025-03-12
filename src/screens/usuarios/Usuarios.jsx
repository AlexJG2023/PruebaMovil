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
    ActivityIndicator
} from 'react-native';
import { NativeBaseProvider, Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Usuarios.styles';
import { 
    agregarUsuario, 
    eliminarUsuario, 
    actualizarUsuario, 
    obtenerUsuarios,
    inicializarDB
} from '../../servicios/Database';
import { useSQLiteContext } from 'expo-sqlite';

const image = require('../../../assets/fondo.png'); 

export const Usuarios = () => {
  const db = useSQLiteContext();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  const recargarUsuarios = async () => {
    try {
      setLoading(true);
      await db.withExclusiveTransactionAsync(async () => {
        const listaUsuarios = await obtenerUsuarios(db);
        setUsuarios(listaUsuarios);
      });
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      try {
        await inicializarDB(db);
        recargarUsuarios();
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    
    inicializar();
  }, []);

  const handleAgregarUsuario = async () => {
    if (nombre.trim() && correo.trim()) {
      try {
        await agregarUsuario(db, nombre, correo, telefono);
        setNombre('');
        setCorreo('');
        setTelefono('');
        await recargarUsuarios();
      } catch (error) {
        console.error("Error al agregar usuario:", error);
        Alert.alert("Error", "No se pudo agregar el usuario");
      }
    } else {
      Alert.alert("Error", "Nombre y correo son obligatorios");
    }
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setNombre(usuario.nombre);
    setCorreo(usuario.correo);
    setTelefono(usuario.telefono || '');
    setModalVisible(true);
  };

  const handleGuardarCambios = async () => {
    if (nombre.trim() && correo.trim()) {
      try {
        await actualizarUsuario(db, usuarioEditando.id, nombre, correo, telefono);
        setModalVisible(false);
        setNombre('');
        setCorreo('');
        setTelefono('');
        setUsuarioEditando(null);
        await recargarUsuarios();
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
        Alert.alert("Error", "No se pudo actualizar el usuario");
      }
    } else {
      Alert.alert("Error", "Nombre y correo son obligatorios");
    }
  };

  const handleEliminarUsuario = async (id) => {
    try {
      Alert.alert(
        "Confirmar eliminación",
        "¿Estás seguro de que deseas eliminar este usuario? Esto también eliminará la relación con sus dispositivos.",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Eliminar", 
            onPress: async () => {
              await eliminarUsuario(db, id);
              await recargarUsuarios();
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      Alert.alert("Error", "No se pudo eliminar el usuario");
    }
  };

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.title}>Gestión de Usuarios</Text>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Buscar usuarios..."
                  placeholderTextColor="#888"
                />
              </View>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Agregar Usuario</Text>
              <TextInput
                style={styles.entrada}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.entrada}
                value={correo}
                onChangeText={setCorreo}
                placeholder="Correo electrónico"
                placeholderTextColor="#888"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.entrada}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Teléfono (opcional)"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAgregarUsuario}
              >
                <Text style={styles.addButtonText}>Agregar Usuario</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.areaLista} contentContainerStyle={styles.scrollContent}>
              <Text style={styles.tituloSeccion}>Lista de Usuarios</Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6D28D9" />
                  <Text style={styles.loadingText}>Cargando usuarios...</Text>
                </View>
              ) : usuarios.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people" size={50} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyListText}>No hay usuarios registrados</Text>
                  <Text style={styles.emptySubText}>Agrega un usuario para comenzar</Text>
                </View>
              ) : (
                usuarios.map((usuario) => (
                  <View key={usuario.id} style={styles.itemContainer}>
                    <View style={styles.userIcon}>
                      <Ionicons name="person-circle" size={30} color="#6D28D9" />
                    </View>
                    <View style={styles.infoContainer}>
                      <Text style={styles.nombreText}>{usuario.nombre}</Text>
                      <Text style={styles.correoText}>{usuario.correo}</Text>
                      {usuario.telefono && (
                        <Text style={styles.telefonoText}>
                          <Ionicons name="call-outline" size={12} /> {usuario.telefono}
                        </Text>
                      )}
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditarUsuario(usuario)}
                      >
                        <Ionicons name="create-outline" size={20} color="#0891B2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleEliminarUsuario(usuario.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#E11D48" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            {/* Modal para editar usuario */}
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
                    <Text style={styles.modalTitle}>Editar Usuario</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        setModalVisible(false);
                        setNombre('');
                        setCorreo('');
                        setTelefono('');
                        setUsuarioEditando(null);
                      }}
                    >
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalForm}>
                    <Text style={styles.inputLabel}>Nombre</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={nombre}
                      onChangeText={setNombre}
                      placeholder="Nombre completo"
                    />
                    
                    <Text style={styles.inputLabel}>Correo electrónico</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={correo}
                      onChangeText={setCorreo}
                      placeholder="ejemplo@correo.com"
                      keyboardType="email-address"
                    />
                    
                    <Text style={styles.inputLabel}>Teléfono (opcional)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={telefono}
                      onChangeText={setTelefono}
                      placeholder="Número de teléfono"
                      keyboardType="phone-pad"
                    />
                  </View>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.buttonCancel]}
                      onPress={() => {
                        setModalVisible(!modalVisible);
                        setNombre('');
                        setCorreo('');
                        setTelefono('');
                        setUsuarioEditando(null);
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