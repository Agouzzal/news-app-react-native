import React, { useState } from 'react'; 
import {
    View,
    Text,
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    ActivityIndicator, 
    Alert, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform
} from 'react-native';
import { useRouter } from 'expo-router'; 

import { auth } from '../../../firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(''); 
    
    const router = useRouter(); 

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,    
                password    
            );
            
            console.log('User logged in!', userCredential.user.email);
            router.replace('/(tabs)'); 

        } catch (error) {
            console.error("Firebase Login Error:", error);
            setError("Invalid email or password."); 
            Alert.alert('Error', "Invalid email or password."); 
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
                
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Please log in to continue reading.</Text>
                </View>

                <View style={styles.formContainer}>
                    
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#8E8E93"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#8E8E93"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleLogin} 
                        disabled={loading}
                    >
                        {loading ? ( 
                            <ActivityIndicator color="#000000" /> 
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>

                </View>
                
                <TouchableOpacity
                    onPress={() => router.push('/auth/register')} 
                    disabled={loading} 
                >
                    <Text style={styles.linkText}>
                        Don't have an account? <Text style={styles.linkHighlight}>Sign Up</Text>
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
    
    header: {
        marginBottom: 40,
        alignItems: 'center',
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
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        marginBottom: 20,
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
    },
    linkHighlight: {
        color: '#c4271eff',
        fontWeight: 'bold',
    },
});