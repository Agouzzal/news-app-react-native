import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity,
    StyleSheet, 
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView, 
    Image, 
    Alert, 
} from 'react-native'; 
import { Platform } from 'react-native'; 
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 

import { auth, db, storage } from '../../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons'; 
import EvilIcons from '@expo/vector-icons/EvilIcons'; 

const uploadImageToFirebase = async (uri, uid) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile_images/${uid}/${Date.now()}_profile.jpg`);

    await uploadBytesResumable(storageRef, blob);
    return getDownloadURL(storageRef);
};


export default function RegisterScreen() {
    const [pseudonym, setPseudonym] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); 
    const router = useRouter();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "We need permission to access your photos."
            );
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };


    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!email || !password || !pseudonym || !imageUri) {
            setError("Please fill in all fields and select a profile photo."); 
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, email, password
            );
            const user = userCredential.user;
            
            const downloadURL = await uploadImageToFirebase(imageUri, user.uid);
            
            const localUri = FileSystem.documentDirectory + `profile_${user.uid}.jpg`;
            await FileSystem.copyAsync({ from: imageUri, to: localUri });
            
            await setDoc(doc(db, 'users', user.uid), {
                pseudonym: pseudonym, 
                email: email,
                profilePictureUrl: downloadURL,
                localProfilePicture: localUri, 
            });

            await AsyncStorage.setItem('@user_profile_picture', localUri);
            
            Alert.alert("Success", "Account created! You can now log in.");
            router.replace('/auth/login'); 

        } catch (e) {
            console.error('Registration error:', e);
            if (e.code === 'auth/email-already-in-use') {
                setError("This email is already in use.");
            } else if (e.code === 'auth/weak-password') {
                setError("Password is too weak (minimum 6 characters).");
            } else {
                setError("Registration failed. " + e.message);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <EvilIcons name="close" size={35} color="#AEAEB2" /> 
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Personalize your profile to become an informer.</Text>
                </View>

                <View style={styles.formContainer}>
                    
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity 
                        style={styles.profilePictureContainer}
                        onPress={pickImage} 
                    >
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.profileImage} />
                        ) : (
                            <Ionicons name="camera-outline" size={40} color="#AEAEB2" />
                        )}
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Pseudonym" 
                        placeholderTextColor="#8E8E93"
                        autoCapitalize="words"
                        value={pseudonym} 
                        onChangeText={setPseudonym} 
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#8E8E93"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#8E8E93"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#8E8E93"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleRegister} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000000" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </TouchableOpacity>

                </View>
                
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                    <Text style={styles.linkText}>
                        Already have an account? <Text style={styles.linkHighlight}>Log in</Text>
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    
    backButton: {
        position: 'absolute',
        top: 60, 
        left: 20,
        zIndex: 10,
        padding: 5, 
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
        marginTop: 50,
    },
    title: {
        fontFamily: 'Merriweather_700Bold',
        fontSize: 34,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'Lato_400Regular',
        fontSize: 16,
        color: '#8E8E93',
    },

    formContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1C1C1E', 
        borderRadius: 16,
        padding: 20,
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginBottom: 20,
    },

    profilePictureContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#000000', 
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#2C2C2E', 
        overflow: 'hidden', 
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    
    input: {
        fontFamily: 'Lato_400Regular',
        height: 50,
        backgroundColor: '#000000', 
        borderRadius: 10,
        paddingHorizontal: 15,
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2C2C2E', 
    },
    
    button: {
        height: 50,
        backgroundColor: '#c4271eff',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        fontFamily: 'Merriweather_700Bold',
        fontSize: 18,
        color: '#000000', 
    },
    
    errorText: {
        fontFamily: 'Lato_400Regular',
        color: '#FF453A',
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 14,
    },
    linkText: {
        fontFamily: 'Lato_400Regular',
        fontSize: 15,
        color: '#AEAEB2',
        alignSelf: 'center',
        marginTop: 10,
    },
    linkHighlight: {
        color: '#c4271eff',
        fontWeight: 'bold',
    }
});