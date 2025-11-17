// Fichier : app/_layout.js
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{ contentStyle: { backgroundColor: "#fff" } }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="details" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        
      </Stack>
    </SafeAreaView>
  );
}