import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Attraction } from '../types';

interface WaitTimeAlertModalProps {
  visible: boolean;
  onClose: () => void;
  attraction: Attraction | null;
  onCreateAlert: (attractionId: string, targetWaitTime: number) => Promise<void>;
  existingAlert?: { targetWaitTime: number } | null;
  onRemoveAlert?: (attractionId: string) => Promise<void>;
}

export const WaitTimeAlertModal: React.FC<WaitTimeAlertModalProps> = ({
  visible,
  onClose,
  attraction,
  onCreateAlert,
  existingAlert,
  onRemoveAlert
}) => {
  const [targetWaitTime, setTargetWaitTime] = useState(
    existingAlert?.targetWaitTime?.toString() || '30'
  );
  const [loading, setLoading] = useState(false);

  const handleCreateAlert = async () => {
    if (!attraction) return;
    
    const waitTime = parseInt(targetWaitTime);
    if (isNaN(waitTime) || waitTime < 0 || waitTime > 240) {
      Alert.alert('Invalid Wait Time', 'Please enter a valid wait time between 0 and 240 minutes.');
      return;
    }

    setLoading(true);
    try {
      await onCreateAlert(attraction.id, waitTime);
      Alert.alert(
        'Alert Created',
        `You'll be notified when ${attraction.name} has a wait time of ${waitTime} minutes or less.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create alert. Please try again.');
    }
    setLoading(false);
  };

  const handleRemoveAlert = async () => {
    if (!attraction || !onRemoveAlert) return;

    Alert.alert(
      'Remove Alert',
      'Are you sure you want to remove this wait time alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onRemoveAlert(attraction.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove alert. Please try again.');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const quickTimeButtons = [15, 30, 45, 60];

  if (!attraction) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Wait Time Alert</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.attractionInfo}>
            <Text style={styles.attractionName}>{attraction.name}</Text>
            <Text style={styles.attractionDetails}>
              {attraction.type.replace('_', ' ')} • {attraction.category}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Notify me when the wait time is:
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={targetWaitTime}
              onChangeText={setTargetWaitTime}
              keyboardType="numeric"
              maxLength={3}
              placeholder="30"
            />
            <Text style={styles.inputSuffix}>minutes or less</Text>
          </View>

          <View style={styles.quickButtons}>
            {quickTimeButtons.map(time => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.quickButton,
                  targetWaitTime === time.toString() && styles.quickButtonSelected
                ]}
                onPress={() => setTargetWaitTime(time.toString())}
              >
                <Text style={[
                  styles.quickButtonText,
                  targetWaitTime === time.toString() && styles.quickButtonTextSelected
                ]}>{time} min</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📱 How alerts work</Text>
            <Text style={styles.infoText}>
              • We'll check wait times every few minutes{'\n'}
              • You'll get a notification when your target is reached{'\n'}
              • Alerts pause for 30 minutes after triggering to avoid spam{'\n'}
              • Works best when the app is running in the background
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {existingAlert && onRemoveAlert && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveAlert}
              disabled={loading}
            >
              <Text style={styles.removeButtonText}>Remove Existing Alert</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateAlert}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {existingAlert ? 'Update Alert' : 'Create Alert'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  attractionInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  attractionName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  attractionDetails: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    width: 80,
    marginRight: 12,
  },
  inputSuffix: {
    fontSize: 16,
    color: '#666666',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickButtonSelected: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  quickButtonTextSelected: {
    color: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  removeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    textAlign: 'center',
  },
  createButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0066CC',
  },
  createButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});