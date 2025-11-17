import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import EvilIcons from '@expo/vector-icons/EvilIcons'; 
import { auth, db } from '../../firebaseConfig'; 
import { doc, onSnapshot } from 'firebase/firestore'; 

const getFavoritesRef = (uid) => doc(db, 'userFavorites', uid);

const FavoriteArticleCard = ({ item, router }) => (
    <TouchableOpacity
        style={styles.cardContainer}
        onPress={() =>
            router.push({
                pathname: "/details",
                params: {
                    articleUri: item.uri, 
                    articleImage: item.image,
                    articleTitle: item.title,
                    articleBody: item.body, 
                    articleDate: item.date,
                },
            })
        }
    >
        <Image 
            style={styles.cardImage} 
            source={{ uri: item.image }} 
            resizeMode="cover" 
            onError={(e) => console.log('Image Error:', e.nativeEvent.error)} 
        />
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('fr-FR')}</Text>
        </View>
    </TouchableOpacity>
);

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
        }
        
        setIsLoggedIn(true);
        const docRef = getFavoritesRef(user.uid);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().metadata) {
                setFavorites(docSnap.data().metadata); 
            } else {
                setFavorites([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching favorites:", error);
            Alert.alert("Error", "Could not load favorites list.");
            setLoading(false);
        });

        return () => unsubscribe(); 
    }, []);

    const renderEmpty = () => {
        if (loading) return null;
        if (!isLoggedIn) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="lock-closed-outline" size={60} color="#8E8E93" />
                    <Text style={styles.emptyTextTitle}>Login required</Text>
                    <Text style={styles.emptyTextSubtitle}>Please log in to view your saved articles.</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/auth/login')}>
                        <Text style={styles.loginButtonText}>Go to login</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={60} color="#8E8E93" />
                <Text style={styles.emptyTextTitle}>No favorites yet</Text>
                <Text style={styles.emptyTextSubtitle}>Tap the star icon on any article to save it here.</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#c4271eff" />
                <Text style={styles.subtitle}>Loading favorites…</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back-circle-sharp" size={40} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Your Favorites</Text>
            
            <FlatList
                data={favorites}
                renderItem={({ item }) => <FavoriteArticleCard item={item} router={router} />}
                keyExtractor={(item) => item.uri}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={favorites.length === 0 ? { flexGrow: 1 } : {}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        paddingHorizontal: 16,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20, 
        zIndex: 10,
        padding: 0,
        backgroundColor: 'transparent',
    },
    loadingScreen: { 
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Merriweather_700Bold',
        fontSize: 28,
        color: '#FFFFFF',
        marginTop: 90, 
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Lato_400Regular',
        color: '#8E8E93',
        marginTop: 10,
    },

    cardContainer: {
        backgroundColor: '#1C1C1E', 
        borderRadius: 12,
        marginVertical: 8,
        overflow: "hidden",
        flexDirection: 'row',
        height: 100,
    },
    cardImage: {
        width: 100, 
        height: '100%', 
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        fontFamily: 'Merriweather_700Bold', 
        fontSize: 16,
        color: "#FFF",
        lineHeight: 20,
    },
    cardDate: {
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
        color: "#8E8E93",
        marginTop: 4,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 30,
    },
    emptyTextTitle: {
        fontFamily: 'Merriweather_700Bold',
        fontSize: 20,
        color: '#FFFFFF',
        marginTop: 15,
    },
    emptyTextSubtitle: {
        fontFamily: 'Lato_400Regular',
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 5,
    },
    loginButton: {
        backgroundColor: '#c4271eff',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    loginButtonText: {
        fontFamily: 'Merriweather_700Bold',
        color: '#000000',
        fontSize: 16,
    }
});