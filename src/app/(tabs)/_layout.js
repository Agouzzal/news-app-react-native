import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';

export default function TabLayout() {
  const accentColor = '#c4271eff';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#000000', 
          borderTopColor: '#1C1C1E',
          height: 90,
          paddingBottom: 20,
        },
        headerShown: false, 
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" color={color} size={28} />,
        }}
      />
      
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarButton: () => null, 
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" color={color} size={28} />,
        }}
      />

    </Tabs>
  );
}