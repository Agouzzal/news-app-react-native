
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [localImageUri, setLocalImageUri] = useState(null); 
  const [creationDate, setCreationDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const cachedImage = await AsyncStorage.getItem('@user_profile_picture');
        if (cachedImage) {
          setLocalImageUri(cachedImage);
        }

    
        const user = auth.currentUser;
        if (user) {
            if (user.metadata.creationTime) {
            const date = new Date(user.metadata.creationTime);
            setCreationDate(date.toLocaleDateString()); 
          }
          
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      await AsyncStorage.clear(); 
      router.replace('/auth/login'); 
    } catch (error) {
      Alert.alert("Erreur", "Problème lors de la déconnexion.");
    }
  };

  if (loading) {
    return <View style={styles.container}><Text style={styles.text}>Chargement...</Text></View>;
  }

  if (!userData) {
    return <View style={styles.container}><Text style={styles.text}>Utilisateur non trouvé.</Text></View>;
  }

    const displayImageUri = localImageUri || userData.profilePictureUrl;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      {displayImageUri && (
        <Image source={{ uri: displayImageUri }} style={styles.profileImage} />
      )}

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>{userData.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>First Name:</Text>
        <Text style={styles.text}>{userData.firstName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Last Name:</Text>
        <Text style={styles.text}>{userData.lastName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Created At:</Text>
        <Text style={styles.text}>{creationDate}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2C2C2E',
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  label: {
    fontSize: 16,
    color: '#8E8E93', 
  },
  text: {
    fontSize: 16,
    color: '#FFF',
  },
  logoutButton: {
    backgroundColor: '#c4271eff', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});