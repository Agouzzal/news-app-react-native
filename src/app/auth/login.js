import React, { useState } from 'react'; 
import {
  View,
  Text,
  TextInput, 
  Pressable,
  StyleSheet,
  ActivityIndicator, 
  Alert, 
} from 'react-native';
import { useRouter } from 'expo-router'; 

import { auth } from '../../../firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  
  const router = useRouter(); 

  const handleLogin = async () => {
    setLoading(true);
    try {
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,    
        password  
      );
      
      console.log('Utilisateur connecté !', userCredential.user.email);
      router.replace('/(tabs)'); 

    } catch (error) {
      Alert.alert('Erreur', "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authenticate</Text>
      <Text style={styles.subtitle}>Please log in to continue</Text>

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

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? ( 
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonOutline]}
        onPress={() => router.push('/auth/register')} 
        disabled={loading} 
      >
        <Text style={[styles.buttonText, styles.buttonOutlineText]}>
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1C1C1E',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#c4271eff', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#c4271eff',
  },
  buttonOutlineText: {
    color: '#c4271eff',
  },
});