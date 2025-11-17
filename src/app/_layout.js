import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts, Merriweather_700Bold } from '@expo-google-fonts/merriweather'; 
import { Lato_400Regular } from '@expo-google-fonts/lato';
import { ActivityIndicator } from "react-native"; 

export default function App() {
  
  let [fontsLoaded] = useFonts({
    Merriweather_700Bold, 
    Lato_400Regular,    
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#c4271eff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{ contentStyle: { backgroundColor: "#fff" } }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        
        <Stack.Screen 
            name="details" 
            options={{ 
                headerShown: false, 
                headerTitle: "",
                header: () => null,
            }} 
        />

        <Stack.Screen 
            name="favorites" 
            options={{ 
                headerShown: false, 
                headerTitle: "Favorites", 
            }} 
        />
        
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}