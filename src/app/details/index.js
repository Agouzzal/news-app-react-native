import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router"; // L'import est crucial !

export default function Details() {
  
  const params = useLocalSearchParams();

  
  const imageUrl = params.articleImage;
  const title = params.articleTitle ?? 'Titre non disponible';
  const date = params.articleDate ?? ''; 
  const body = params.articleBody ?? 'Contenu non disponible';

  return (
    <ScrollView style ={styles.container}>
      
      {imageUrl ? (
        <Image style={styles.image} source={{ uri: imageUrl }} />
      ) : null}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        {!!date && (
          <Text style={styles.date}>{date}</Text>
        )}

        {!!body && (
          <Text style={styles.body}>{body}</Text>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },


  image: {
    width: '100%', 
    height: 250,  
    backgroundColor: '#2C2C2E', 
  },

  
  content: {
    padding: 15,
  },

 
  title: {
    fontSize: 24, 
    fontWeight: "bold",
    color: "#c4271eff", 
    marginBottom: 10,  
  },

  
  date: {
    fontSize: 12,
    color: "#da4747ff", 
    marginBottom: 20, 
  },

  
  body: {
    fontSize: 16,
    color: '#F0F0F0', 
    lineHeight: 24,  
  },
});