import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { WaitTimeAlert } from '../types';

export const AlertsScreen = () => {
  const [alerts, setAlerts] = useState<WaitTimeAlert[]>([]);

  useEffect(() => {
    console.log('[DEBUG] AlertsScreen: Loading saved alerts');
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    // Mock data for now - in production, load from AsyncStorage
    const mockAlerts: WaitTimeAlert[] = [
      {
        id: '1',
        attractionId: 'space-mountain',
        attractionName: 'Space Mountain',
        parkName: 'Magic Kingdom',
        targetWaitTime: 30,
        alertType: 'below',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        attractionId: 'avatar-flight',
        attractionName: 'Avatar Flight of Passage',
        parkName: 'Animal Kingdom',
        targetWaitTime: 60,
        alertType: 'below',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        attractionId: 'seven-dwarfs',
        attractionName: 'Seven Dwarfs Mine Train',
        parkName: 'Magic Kingdom',
        targetWaitTime: 45,
        alertType: 'below',
        isActive: false,
        createdAt: new Date().toISOString(),
      },
    ];
    setAlerts(mockAlerts);
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
          },
        },
      ]
    );
  };

  const renderAlert = ({ item }: { item: WaitTimeAlert }) => (
    <View style={[styles.alertCard, !item.isActive && styles.inactiveCard]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.attractionName}>{item.attractionName}</Text>
          <Text style={styles.parkName}>{item.parkName}</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, item.isActive && styles.activeToggle]}
          onPress={() => toggleAlert(item.id)}
        >
          <Text style={styles.toggleText}>{item.isActive ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.alertDetails}>
        <Text style={styles.alertCondition}>
          Alert when wait time is {item.alertType} {item.targetWaitTime} minutes
        </Text>
        <Text style={styles.createdDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.alertActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => console.log('Edit alert:', item.id)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteAlert(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No Wait Alerts</Text>
      <Text style={styles.emptyText}>
        Add alerts from the Wait Times screen to get notified when your favorite rides have shorter wait times.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wait Time Alerts</Text>
        <Text style={styles.headerSubtitle}>
          {alerts.filter(a => a.isActive).length} active alerts
        </Text>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContent: {
    padding: 15,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertInfo: {
    flex: 1,
  },
  attractionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  parkName: {
    fontSize: 14,
    color: '#666',
  },
  toggleButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  alertDetails: {
    marginBottom: 15,
  },
  alertCondition: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  editButtonText: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});