import React from "react";
import {
    Text,
    Button,
    Center,
    Image,
    Box,
    VStack,
    Heading,
    HStack,
    Icon,
    Pressable,
} from "native-base";
import { Contenedor } from "../../components/contenedor/Contenedor";
import { ImageBackground, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const image = require('../../../assets/godzilla.jpg');

export const Home = ({ navigation }) => {
    const navigateToScreen = (screen) => {
        navigation.navigate(screen);
    };

    const FeatureCard = ({ title, icon, description, route, color }) => (
        <Pressable onPress={() => navigateToScreen(route)}>
            <Box 
                bg="white" 
                rounded="2xl" 
                shadow={4} 
                p="5" 
                mb="5"
                borderLeftWidth={4}
                borderLeftColor={color}
                overflow="hidden"
            >
                <HStack space={4} alignItems="center">
                    <Center 
                        bg={`${color}:alpha.20`} 
                        p="3" 
                        rounded="full"
                    >
                        <Icon as={Ionicons} name={icon} size={6} color={color} />
                    </Center>
                    <VStack flex={1}>
                        <Heading size="md" color="coolGray.800">
                            {title}
                        </Heading>
                        <Text color="coolGray.600" mt="1" fontSize="sm">
                            {description}
                        </Text>
                    </VStack>
                    <Icon as={Ionicons} name="chevron-forward" color="coolGray.400" />
                </HStack>
            </Box>
        </Pressable>
    );

    return (
        <Contenedor>
            <Box flex={1} bg="coolGray.50">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Box position="relative">
                        <ImageBackground 
                            source={image} 
                            style={{
                                height: 200,
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Box 
                                bg="rgba(0,0,0,0.6)" 
                                p="5"
                            >
                                <Heading color="white" size="xl">
                                    Sistema de Gestión
                                </Heading>
                                <Text color="white" mt="1">
                                    Usuarios y Dispositivos
                                </Text>
                            </Box>
                        </ImageBackground>
                        
                        <Center
                            position="absolute"
                            right="5"
                            top="150"
                            bg="white"
                            p="3"
                            rounded="full"
                            shadow={6}
                        >
                            <Image
                                size="lg"
                                borderRadius="full"
                                source={{
                                    uri: "https://scontent.fuio1-2.fna.fbcdn.net/v/t1.6435-9/122530667_3477287822359636_71160744967419287_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGXtwtsa1wDm0lKOhQwpOO6pOUBgHtspQSk5QGAe2ylBEh-t9p6Mjii8GWL6T3HRkdtUYURXycdJXo7EvQkEeAx&_nc_ohc=ZGqowHKNBCcQ7kNvgFVRfWA&_nc_oc=AdiFiWYTOyvayenyxtcwGW-jG5rH5kdrIFtIFL9Jr_D3EwEkUtArbE21k8J7VOJRs3o&_nc_zt=23&_nc_ht=scontent.fuio1-2.fna&_nc_gid=AvkH5MHXx-wjTUmrASORaBs&oh=00_AYGiuq3IQQIK4GxfUH4DZWVkm2m8L6ArdYw2NiOWh0GvmQ&oe=67F87F0D"
                                }}
                                alt="Perfil"
                            />
                        </Center>
                    </Box>

                    <VStack space={3} p="5" mt="10">
                        <Box bg="white" p="5" rounded="xl" shadow={2} mb="4">
                            <VStack space={1}>
                                <Heading size="md" color="coolGray.800">
                                    Bienvenido al Sistema
                                </Heading>
                                <Text color="coolGray.600">
                                    Gestiona usuarios y sus dispositivos de manera eficiente
                                </Text>
                                <HStack space={2} mt="4">
                                    <Box bg="violet.100" px="3" py="1" rounded="full">
                                        <Text color="violet.800" fontSize="xs" fontWeight="bold">v1.0</Text>
                                    </Box>
                                    <Box bg="green.100" px="3" py="1" rounded="full">
                                        <Text color="green.800" fontSize="xs" fontWeight="bold">SQLite</Text>
                                    </Box>
                                </HStack>
                            </VStack>
                        </Box>

                        <Heading size="md" color="coolGray.700" mt="2" mb="2">
                            Acceso Rápido
                        </Heading>

                        <FeatureCard
                            title="Gestión de Usuarios"
                            icon="people"
                            description="Administra los usuarios del sistema"
                            route="Usuarios"
                            color="violet.600"
                        />
                        
                        <FeatureCard
                            title="Gestión de Dispositivos"
                            icon="hardware-chip"
                            description="Administra los dispositivos asignados"
                            route="Dispositivos"
                            color="emerald.600"
                        />
                        
                        <Box p="5" bg="blueGray.50" rounded="xl" mt="3">
                            <HStack justifyContent="space-between" alignItems="center">
                                <VStack>
                                    <Text color="coolGray.800" fontWeight="medium">
                                        Desarrollador
                                    </Text>
                                    <Text color="coolGray.500" fontSize="sm">
                                        Made with ❤️ by Alexander Guerrero
                                    </Text>
                                </VStack>
                                <Button
                                    variant="subtle"
                                    colorScheme="violet"
                                    leftIcon={<Icon as={Ionicons} name="information-circle-outline" size="sm" />}
                                >
                                    Acerca de
                                </Button>
                            </HStack>
                        </Box>
                    </VStack>
                </ScrollView>
            </Box>
        </Contenedor>
    );
};