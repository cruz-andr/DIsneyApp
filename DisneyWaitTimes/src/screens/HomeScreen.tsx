import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeStackParamList = {
  HomeMain: undefined;
  Alerts: undefined;
  JeopardyLobby: undefined;
};

type NavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const parks = [
    { id: 'mk', name: 'Magic Kingdom', avgWait: '35 min', icon: '🏰' },
    { id: 'ep', name: 'EPCOT', avgWait: '28 min', icon: '🌍' },
    { id: 'hs', name: 'Hollywood Studios', avgWait: '42 min', icon: '🎬' },
    { id: 'ak', name: 'Animal Kingdom', avgWait: '30 min', icon: '🦁' },
  ];

  const quickActions = [
    { id: 'favorites', name: 'My Favorites', icon: '⭐', screen: 'Favorites' },
    { id: 'alerts', name: 'Wait Alerts', icon: '🔔', screen: 'Alerts' },
    { id: 'map', name: 'Park Maps', icon: '🗺️', screen: 'Maps' },
    { id: 'schedule', name: 'Show Times', icon: '📅', screen: null },
  ];

  const handleQuickAction = (action: any) => {
    console.log('[DEBUG] HomeScreen: Quick action pressed:', action.name);
    
    if (action.screen === 'Alerts') {
      navigation.navigate('Alerts');
    } else if (action.screen === 'Favorites') {
      // Navigate to Favorites tab
      navigation.getParent()?.navigate('Favorites' as any);
    } else if (action.screen === 'Maps') {
      // Navigate to Maps tab
      navigation.getParent()?.navigate('Maps' as any);
    } else {
      console.log(`[DEBUG] Action ${action.id} not yet implemented`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.titleText}>Disney Wait Times</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>

        <TouchableOpacity 
          style={styles.jeopardySection}
          onPress={() => navigation.navigate('JeopardyLobby')}
        >
          <View style={styles.jeopardyCard}>
            <View style={styles.jeopardyContent}>
              <Text style={styles.jeopardyEmoji}>🎯</Text>
              <View style={styles.jeopardyTextContainer}>
                <Text style={styles.jeopardyTitle}>Disney Jeopardy</Text>
                <Text style={styles.jeopardySubtitle}>New episodes every Friday!</Text>
              </View>
            </View>
            <View style={styles.jeopardyBadge}>
              <Text style={styles.newEpisodeText}>NEW</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Park Overview</Text>
          <View style={styles.parksGrid}>
            {parks.map((park) => (
              <TouchableOpacity key={park.id} style={styles.parkCard}>
                <Text style={styles.parkIcon}>{park.icon}</Text>
                <Text style={styles.parkName}>{park.name}</Text>
                <Text style={styles.avgWaitLabel}>Avg Wait</Text>
                <Text style={styles.avgWaitTime}>{park.avgWait}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.actionCard}
                onPress={() => handleQuickAction(action)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionName}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Best Time to Visit</Text>
              <Text style={styles.tipText}>
                Wait times are typically lowest between 11 AM - 1 PM when guests are having lunch.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Rides Tracked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  parksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  parkCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  parkIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  parkName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  avgWaitLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  avgWaitTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '23%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  jeopardySection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  jeopardyCard: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  jeopardyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jeopardyEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  jeopardyTextContainer: {
    flex: 1,
  },
  jeopardyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  jeopardySubtitle: {
    fontSize: 14,
    color: '#E0D5F7',
  },
  jeopardyBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  newEpisodeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});