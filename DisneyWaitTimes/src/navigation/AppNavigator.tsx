import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { WaitTimesScreen } from '../screens/WaitTimesScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import JeopardyLobbyScreen from '../screens/JeopardyLobbyScreen';
import JeopardyVideoScreen from '../screens/JeopardyVideoScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const MoreStack = createStackNavigator();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const FavoritesScreen = () => <PlaceholderScreen name="Favorites" />;
const MapsScreen = () => <PlaceholderScreen name="Park Maps" />;

const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen 
      name="Alerts" 
      component={AlertsScreen}
      options={{ 
        title: 'Wait Alerts',
        headerStyle: { backgroundColor: '#4a90e2' },
        headerTintColor: '#fff',
      }}
    />
    <HomeStack.Screen 
      name="JeopardyLobby" 
      component={JeopardyLobbyScreen}
      options={{ 
        title: 'Disney Jeopardy',
        headerStyle: { backgroundColor: '#6B46C1' },
        headerTintColor: '#fff',
      }}
    />
    <HomeStack.Screen 
      name="JeopardyVideo" 
      component={JeopardyVideoScreen}
      options={{ 
        headerShown: false,
      }}
    />
  </HomeStack.Navigator>
);

const MoreStackScreen = () => (
  <MoreStack.Navigator>
    <MoreStack.Screen 
      name="MoreMain" 
      component={MoreScreen}
      options={{ headerShown: false }}
    />
    <MoreStack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ 
        title: 'Notifications',
        headerStyle: { backgroundColor: '#4a90e2' },
        headerTintColor: '#fff',
      }}
    />
  </MoreStack.Navigator>
);

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4a90e2',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: -5,
          },
          headerStyle: {
            backgroundColor: '#4a90e2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🏠</Text>
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Wait Times"
          component={WaitTimesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>⏱️</Text>
            ),
            headerStyle: {
              backgroundColor: '#4a90e2',
            },
            headerTintColor: '#fff',
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>⭐</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Maps"
          component={MapsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🗺️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="More"
          component={MoreStackScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>☰</Text>
            ),
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#999',
  },
});