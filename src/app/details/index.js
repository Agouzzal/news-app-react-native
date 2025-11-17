import { 
    View, 
    Text, 
    ScrollView, 
    Image, 
    StyleSheet, 
    Pressable, 
    Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; 
import Ionicons from '@expo/vector-icons/Ionicons'; 

// Récupérer la hauteur de l'écran pour une image d'en-tête percutante
const { height: screenHeight } = Dimensions.get('window');

export default function Details() {
  
    const params = useLocalSearchParams();
    const router = useRouter(); 

    const imageUrl = params.articleImage;
    const title = params.articleTitle ?? 'Titre non disponible';
    const date = params.articleDate ?? ''; 
    const body = params.articleBody ?? 'Contenu non disponible';

    const formattedDate = date ? 
        new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'Date inconnue';

    return (
        <View style={styles.container}>
            
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back-circle-sharp" size={45} color="#FFF" />
            </Pressable>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {imageUrl ? (
                    <Image 
                        style={styles.image} 
                        source={{ uri: imageUrl }} 
                        resizeMode="cover"
                    />
                ) : <View style={styles.imagePlaceholder} />} 

                <View style={styles.contentArea}>
                    
                    <Text style={styles.title}>{title}</Text>
                    
                    {!!date && (
                        <Text style={styles.date}>{formattedDate}</Text>
                    )}

                    <View style={styles.separator} />

                    {!!body && (
                        <View>
                             <Text style={styles.body}>{body}</Text>
                             <Text style={styles.body}>{body}</Text>
                             <Text style={styles.body}>{body}</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', 
    },

    scrollContent: {
        flexGrow: 1,
    },
    
    image: {
        width: '100%',
        height: screenHeight * 0.40, 
        backgroundColor: '#1C1C1E', 
    },
    imagePlaceholder: {
        width: '100%',
        height: screenHeight * 0.20, 
        backgroundColor: '#1C1C1E', 
        justifyContent: 'center',
        alignItems: 'center',
    },

    backButton: {
        position: 'absolute',
        top: 40, 
        left: 10,
        zIndex: 10, 
        textShadowColor: 'rgba(255, 103, 103, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
    },

    contentArea: {
        marginTop: -30, 
        paddingHorizontal: 20,
        backgroundColor: '#000000', 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30,
        paddingTop: 30,
        paddingBottom: 50, 
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
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#1C1C1E', 
        marginVertical: 20,
    },
    body: {
        fontFamily: 'Lato_400Regular',
        fontSize: 17, 
        color: '#DEDEDE', 
        lineHeight: 28, 
        marginBottom: 25,
    },
});