import { View, Text, StyleSheet, Image, ScrollView, Dimensions, Pressable, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react'; 
import { auth, db } from '../../../firebaseConfig'; 

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore'; 

const { height: screenHeight } = Dimensions.get('window');

const getFavoritesRef = (uid) => doc(db, 'userFavorites', uid);

export default function ArticleDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFav, setLoadingFav] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true); 

    const { articleImage, articleTitle, articleBody, articleDate } = params;
    const articleUri = params.articleUri || articleTitle; 
    
    const formattedDate = new Date(articleDate).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            setLoadingPage(true); 
            const user = auth.currentUser;
            if (!user || !articleUri) {
                setLoadingPage(false);
                return;
            }

            try {
                const docRef = getFavoritesRef(user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().articles && docSnap.data().articles.includes(articleUri)) {
                    setIsFavorite(true);
                } else {
                    setIsFavorite(false);
                }
            } catch (e) {
                console.error("Error checking favorite status:", e);
                setIsFavorite(false); 
            } finally {
                setLoadingPage(false); 
            }
        };
        checkFavoriteStatus();
    }, [articleUri]); 

    const toggleFavorite = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Connexion requise", "Veuillez vous connecter pour ajouter des favoris.");
            return;
        }

        setLoadingFav(true);
        const docRef = getFavoritesRef(user.uid);
        const newFavoriteStatus = !isFavorite;

        const articleMetadata = { 
            uri: articleUri, 
            title: articleTitle, 
            date: articleDate, 
            image: articleImage,
            body: articleBody, 
        };

        try {
            const docSnap = await getDoc(docRef);

            if (newFavoriteStatus) {
                if (docSnap.exists()) {
                    await updateDoc(docRef, {
                        articles: arrayUnion(articleUri),
                        metadata: arrayUnion(articleMetadata)
                    });
                } else {
                    await setDoc(docRef, { 
                        articles: [articleUri],
                        metadata: [articleMetadata],
                        userId: user.uid
                    });
                }
            } else {
                if (docSnap.exists()) {
                    const currentData = docSnap.data();
                    const newMetadata = currentData.metadata.filter(item => item.uri !== articleUri);
                    
                    await updateDoc(docRef, {
                        articles: arrayRemove(articleUri),
                        metadata: newMetadata 
                    });
                }
            }
            
            setIsFavorite(newFavoriteStatus); 

        } catch (e) {
            Alert.alert("Erreur", "Impossible de sauvegarder le favori. Réessayez.");
            console.error("Firestore error:", e);
            setIsFavorite(!newFavoriteStatus); 
        } finally {
            setLoadingFav(false);
        }
    };

    if (loadingPage) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#c4271eff" />
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-circle-sharp" size={40} color="#FFF" /> 
                </TouchableOpacity>
                
                <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton} disabled={loadingFav}>
                    {loadingFav ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Ionicons 
                            name={isFavorite ? "star" : "star-outline"} 
                            size={28} 
                            color={isFavorite ? "#FFC300" : "#FFF"} 
                        />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {articleImage && (
                    <Image
                        source={{ uri: articleImage }}
                        style={styles.headerImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.contentArea}>
                    
                    <Text style={styles.title}>{articleTitle}</Text>
                    <Text style={styles.date}>{formattedDate}</Text>
                    <View style={styles.separator} />
                    
                    <Text style={styles.bodyText}>{articleBody}</Text>
                    
                    <View style={{ height: 50 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    topBar: {
        position: 'absolute',
        top: 50, 
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        zIndex: 10,
    },
    backButton: {
        padding: 0, 
        backgroundColor: 'transparent', 
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 25,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerImage: {
        width: '100%',
        height: screenHeight * 0.40, 
        backgroundColor: '#1C1C1E', 
    },
    contentArea: {
        marginTop: -30, 
        paddingHorizontal: 20,
        backgroundColor: '#000000', 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30,
        paddingTop: 30,
    },
    title: {
        fontFamily: 'Merriweather_700Bold',
        fontSize: 32,
        color: '#FFFFFF',
        lineHeight: 40,
        marginBottom: 16,
    },
    date: {
        fontFamily: 'Lato_400Regular',
        fontSize: 14,
        color: '#c4271eff',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#1C1C1E',
        marginVertical: 20,
    },
    bodyText: {
        fontFamily: 'Lato_400Regular',
        fontSize: 17,
        color: '#DEDEDE',
        lineHeight: 28,
        marginBottom: 25,
    },
});