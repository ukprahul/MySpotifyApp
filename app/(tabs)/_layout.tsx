import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { NowPlayingBar } from '@/components/NowPlayingBar';
import { HapticTab } from '@/components/haptic-tab';
import { SC } from '@/constants/SpotifyTheme';

function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View style={{ backgroundColor: SC.tabBar }}>
      <NowPlayingBar />
      <BottomTabBar {...props} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: SC.green,
        tabBarInactiveTintColor: SC.textMuted,
        tabBarStyle: {
          backgroundColor: SC.tabBar,
          borderTopColor: SC.separator,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
