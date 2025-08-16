import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Attraction, WaitTime, AttractionStatus } from '../types';

interface WaitTimeCardProps {
  attraction: Attraction;
  waitTime: WaitTime;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onCreateAlert?: () => void;
  hasAlert?: boolean;
}

export const WaitTimeCard: React.FC<WaitTimeCardProps> = ({
  attraction,
  waitTime,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  onCreateAlert,
  hasAlert = false
}) => {
  const getWaitTimeText = () => {
    if (waitTime.status !== AttractionStatus.OPERATING) {
      return getStatusText();
    }
    if (waitTime.waitTime === 0) return 'Walk On';
    if (waitTime.waitTime === -1) return 'Closed';
    return `${waitTime.waitTime} min`;
  };

  const getStatusText = () => {
    switch (waitTime.status) {
      case AttractionStatus.CLOSED:
        return 'Closed';
      case AttractionStatus.DOWN:
        return 'Temporarily Down';
      case AttractionStatus.REFURBISHMENT:
        return 'Refurbishment';
      default:
        return 'Unknown';
    }
  };

  const getWaitTimeColor = () => {
    if (waitTime.status !== AttractionStatus.OPERATING) {
      return '#666666';
    }
    if (waitTime.waitTime <= 15) return '#4CAF50'; // Green
    if (waitTime.waitTime <= 45) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getCategoryColor = () => {
    switch (attraction.category) {
      case 'thrill': return '#E91E63';
      case 'family': return '#2196F3';
      case 'kids': return '#4CAF50';
      case 'water': return '#00BCD4';
      default: return '#9C27B0';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.attractionName}>{attraction.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
            <Text style={styles.categoryText}>{attraction.category.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={onCreateAlert}
            style={styles.alertButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.alertIcon, { color: hasAlert ? '#FF6B35' : '#CCCCCC' }]}>
              🔔
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggleFavorite}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.favoriteIcon, { color: isFavorite ? '#FFD700' : '#CCCCCC' }]}>
              ★
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.waitTimeContainer}>
        <Text style={[styles.waitTime, { color: getWaitTimeColor() }]}>
          {getWaitTimeText()}
        </Text>
        {waitTime.status === AttractionStatus.OPERATING && waitTime.isEstimate && (
          <Text style={styles.estimate}>Est.</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          Updated: {waitTime.lastUpdated.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
          })}
        </Text>
        <View style={styles.features}>
          {attraction.hasLightningLane && (
            <View style={styles.featureBadge}>
              <Text style={styles.featureText}>LL</Text>
            </View>
          )}
          {attraction.hasVirtualQueue && (
            <View style={styles.featureBadge}>
              <Text style={styles.featureText}>VQ</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  attractionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  alertButton: {
    padding: 4,
  },
  alertIcon: {
    fontSize: 20,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  waitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  waitTime: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 4,
  },
  estimate: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666666',
  },
  features: {
    flexDirection: 'row',
    gap: 4,
  },
  featureBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#1976D2',
  },
});