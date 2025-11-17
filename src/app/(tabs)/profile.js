import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons'; 

import { auth, db, storage } from '../../../firebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'; 
import { getAuth, signOut } from 'firebase/auth'; 
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; 

const getFavoritesRef = (uid) => doc(db, 'userFavorites', uid);

const uploadImageToFirebase = async (uri, uid) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile_images/${uid}/profile.jpg`);
    await uploadBytesResumable(storageRef, blob);
    return getDownloadURL(storageRef);
};


export default function ProfileScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [localImageUri, setLocalImageUri] = useState(null); 
    const [creationDate, setCreationDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [favoritesCount, setFavoritesCount] = useState(0); 
    const [isUploading, setIsUploading] = useState(false); 

    useEffect(() => {
        const user = getAuth().currentUser; 
        if (!user) {
            setLoading(false);
            return;
        }

        const loadProfileData = async () => {
            try {
                const cachedImage = await AsyncStorage.getItem('@user_profile_picture');
                if (cachedImage) setLocalImageUri(cachedImage);

                if (user.metadata.creationTime) {
                    const date = new Date(user.metadata.creationTime);
                    setCreationDate(date.toLocaleDateString('en-US'));
                }
                
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };

        const favoritesRef = getFavoritesRef(user.uid);
        const unsubscribeFavorites = onSnapshot(favoritesRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().articles) {
                setFavoritesCount(docSnap.data().articles.length);
            } else {
                setFavoritesCount(0);
            }
            setLoading(false); 
        }, (error) => {
            console.error("Error fetching favorites count in real-time:", error);
            setLoading(false);
        });

        loadProfileData();

        return () => unsubscribeFavorites(); 
    }, []);


   const handleChangeProfilePicture = async () => {

        let result = await ImagePicker.launchImageLibraryAsync({
            
            mediaTypes: ImagePicker.MediaTypeOptions.Images,

            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.5, 
        });

        if (result.canceled) {
            return;
        }

        const newImageUri = result.assets[0].uri;
        setIsUploading(true); 

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Utilisateur non trouvé");

            const downloadURL = await uploadImageToFirebase(newImageUri, user.uid);

            const localUri = FileSystem.documentDirectory + `profile_${user.uid}.jpg`;
            await FileSystem.copyAsync({ from: newImageUri, to: localUri });

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                profilePictureUrl: downloadURL,
                localProfilePicture: localUri
            });
            
            await AsyncStorage.setItem('@user_profile_picture', localUri);

            setLocalImageUri(localUri);

        } catch (error) {
            console.error("Erreur lors de la mise à jour de la photo:", error);
            Alert.alert("Erreur", "Impossible de modifier la photo de profil.");
        } finally {
            setIsUploading(false); 
        }
    };
    
    const handleLogout = async () => {
        try {
            await signOut(auth); 
            await AsyncStorage.clear(); 
            router.replace('/auth/login'); 
        } catch (error) {
            Alert.alert("Error", "Problem signing out.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#c4271eff" />
                <Text style={styles.subtitle}>Loading Profile...</Text>
            </View>
        );
    }
    
    if (!userData) {
         return (
            <View style={styles.errorScreen}>
                <Text style={styles.title}>Error</Text>
                <Text style={styles.subtitle}>User data not found. Please log in again.</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/auth/login')}>
                    <Text style={styles.logoutButtonText}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const displayImageUri = localImageUri || userData.profilePictureUrl;

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.header}>
                <Text style={styles.title}>My Profile</Text>
            </View>

            <View style={styles.profileCard}>
                
                <TouchableOpacity onPress={handleChangeProfilePicture} disabled={isUploading}>
                    {displayImageUri ? (
                        <Image source={{ uri: displayImageUri }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <Ionicons name="person" size={60} color="#AEAEB2" />
                        </View>
                    )}
                    
                    {isUploading && (
                        <View style={styles.imageOverlay}>
                            <ActivityIndicator size="large" color="#FFF" />
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.pseudonym}>{userData.pseudonym}</Text> 
            </View>

            <View style={styles.infoContainer}>
                
                <View style={styles.infoRow}>
                    <Text style={styles.label}>eMail :</Text>
                    <Text style={styles.emailText}>{userData.email}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Member Since</Text>
                    <Text style={styles.text}>{creationDate}</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.infoRowLink} 
                    onPress={() => router.push('favorites')} 
                >
                    <Text style={styles.label}>Favorite Articles</Text>
                    <Text style={styles.linkHighlight}>{favoritesCount} saved</Text> 
                </TouchableOpacity>

            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingScreen: { 
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorScreen: { 
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#000000', 
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    
    header: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 30,
    },
    title: {
        fontFamily: 'Merriweather_700Bold', 
        fontSize: 32,
        color: '#FFFFFF',
    },
    subtitle: {
        fontFamily: 'Lato_400Regular',
        color: '#8E8E93',
        marginTop: 10,
    },

    profileCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1C1C1E', 
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000', 
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        borderWidth: 3, 
        borderColor: '#c4271eff',
        resizeMode: 'cover',
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#000000',
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3, 
        borderColor: '#2C2C2E',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    pseudonym: {
        fontFamily: 'Merriweather_700Bold', 
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 5,
    },
    emailText: {
        fontFamily: 'Lato_400Regular',
        fontSize: 17,
        color: '#ffffffff',
    },

    infoContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        marginBottom: 30,
        overflow: 'hidden', 
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#000000', 
    },
    infoRowLink: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#000000', 
        backgroundColor: '#1C1C1E',
    },
    label: {
        fontFamily: 'Lato_400Regular',
        fontSize: 16,
        color: '#AEAEB2',
        fontWeight: 'bold',
    },
    text: {
        fontFamily: 'Lato_400Regular',
        fontSize: 16,
        color: '#FFF',
    },
    linkHighlight: {
        fontFamily: 'Lato_400Regular',
        fontSize: 16,
        color: '#c4271eff',
        fontWeight: 'bold',
    },

    logoutButton: {
        backgroundColor: '#c4271eff', 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        marginTop: 20,
    },
    logoutButtonText: {
        fontFamily: 'Merriweather_700Bold',
        color: '#000000', 
        fontSize: 18,
    },
});