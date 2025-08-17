import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { WaitTimeCard } from '../components/WaitTimeCard';
import { SearchBar } from '../components/SearchBar';
import { FilterSheet } from '../components/FilterSheet';
import { WaitTimeAlertModal } from '../components/WaitTimeAlertModal';
import { waitTimesService } from '../services/waitTimesService';
import { notificationService } from '../services/notificationService';
import { WaitTimesResponse, Attraction, WaitTime, AttractionType, AttractionCategory, AttractionStatus } from '../types';

interface FilterOptions {
  showClosedAttractions: boolean;
  attractionTypes: AttractionType[];
  attractionCategories: AttractionCategory[];
  maxWaitTime: number | null;
  onlyFavorites: boolean;
}

export const WaitTimesScreen: React.FC = () => {
  const [waitTimesData, setWaitTimesData] = useState<WaitTimesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    showClosedAttractions: true,
    attractionTypes: Object.values(AttractionType),
    attractionCategories: Object.values(AttractionCategory),
    maxWaitTime: null,
    onlyFavorites: false,
  });

  const fetchWaitTimes = useCallback(async () => {
    console.log('[DEBUG] WaitTimesScreen: Starting to fetch wait times...');
    try {
      const data = await waitTimesService.getAllWaitTimes();
      console.log('[DEBUG] WaitTimesScreen: Fetched data successfully:', {
        parksCount: data.length,
        parks: data.map(d => d.park.name),
        totalAttractions: data.reduce((sum, d) => sum + d.attractions.length, 0),
        totalWaitTimes: data.reduce((sum, d) => sum + d.waitTimes.length, 0)
      });
      setWaitTimesData(data);
    } catch (error: any) {
      console.error('[DEBUG] WaitTimesScreen: Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
        status: error?.status,
        fullError: JSON.stringify(error, null, 2)
      });
      Alert.alert(
        'Error',
        `Failed to fetch wait times: ${error?.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWaitTimes();
    setRefreshing(false);
  }, [fetchWaitTimes]);

  useEffect(() => {
    console.log('[DEBUG] WaitTimesScreen: Component mounted, initializing...');
    const loadData = async () => {
      // Initialize notifications
      console.log('[DEBUG] WaitTimesScreen: Initializing notifications...');
      await notificationService.initialize();
      
      console.log('[DEBUG] WaitTimesScreen: Loading initial data...');
      await fetchWaitTimes();
      setLoading(false);
      console.log('[DEBUG] WaitTimesScreen: Initial load complete');
    };
    loadData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(async () => {
      console.log('[DEBUG] WaitTimesScreen: Auto-refresh triggered');
      await fetchWaitTimes();
    }, 5 * 60 * 1000);
    
    return () => {
      console.log('[DEBUG] WaitTimesScreen: Cleaning up interval');
      clearInterval(interval);
    };
  }, []); // Remove dependencies to prevent re-mounting

  // Separate effect for checking wait time alerts
  useEffect(() => {
    if (waitTimesData.length > 0) {
      const allWaitTimes: WaitTime[] = [];
      const attractionNames = new Map<string, string>();
      
      waitTimesData.forEach(parkData => {
        allWaitTimes.push(...parkData.waitTimes);
        parkData.attractions.forEach(attraction => {
          attractionNames.set(attraction.id, attraction.name);
        });
      });
      
      notificationService.checkWaitTimeAlerts(allWaitTimes, attractionNames);
    }
  }, [waitTimesData]);

  const toggleFavorite = useCallback((attractionId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(attractionId)) {
        newFavorites.delete(attractionId);
      } else {
        newFavorites.add(attractionId);
      }
      return newFavorites;
    });
  }, []);

  const handleCreateAlert = useCallback((attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setShowAlertModal(true);
  }, []);

  const createWaitTimeAlert = useCallback(async (attractionId: string, targetWaitTime: number) => {
    const attraction = selectedAttraction;
    if (!attraction) return;
    
    await notificationService.createWaitTimeAlert(
      attraction.name, 
      targetWaitTime, 
      attractionId
    );
  }, [selectedAttraction]);

  const removeWaitTimeAlert = useCallback(async (attractionId: string) => {
    const existingAlert = notificationService.getAlertForAttraction(attractionId);
    if (existingAlert) {
      await notificationService.removeWaitTimeAlert(existingAlert.id);
    }
  }, []);

  const getExistingAlert = useCallback((attractionId: string) => {
    return notificationService.getAlertForAttraction(attractionId);
  }, []);

  const getFilteredAttractions = (): Array<{ attraction: Attraction; waitTime: WaitTime; parkName: string }> => {
    let allData: Array<{ attraction: Attraction; waitTime: WaitTime; parkName: string }> = [];
    
    waitTimesData.forEach(parkData => {
      parkData.attractions.forEach(attraction => {
        const waitTime = parkData.waitTimes.find(wt => wt.attractionId === attraction.id);
        if (waitTime) {
          allData.push({
            attraction,
            waitTime,
            parkName: parkData.park.name
          });
        }
      });
    });

    // Apply filters
    allData = allData.filter(item => {
      // Search filter
      if (searchQuery) {
        const matchesSearch = item.attraction.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
      }

      // Closed attractions filter
      if (!filters.showClosedAttractions && item.waitTime.status !== AttractionStatus.OPERATING) {
        return false;
      }

      // Attraction type filter
      if (!filters.attractionTypes.includes(item.attraction.type)) {
        return false;
      }

      // Attraction category filter
      if (!filters.attractionCategories.includes(item.attraction.category)) {
        return false;
      }

      // Max wait time filter
      if (filters.maxWaitTime !== null && 
          item.waitTime.waitTime > filters.maxWaitTime && 
          item.waitTime.waitTime !== -1) {
        return false;
      }

      // Favorites only filter
      if (filters.onlyFavorites && !favorites.has(item.attraction.id)) {
        return false;
      }

      return true;
    });

    // Sort by wait time (favorites first, then by wait time)
    return allData.sort((a, b) => {
      const aIsFavorite = favorites.has(a.attraction.id);
      const bIsFavorite = favorites.has(b.attraction.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // If both are favorites or both are not favorites, sort by wait time
      if (a.waitTime.waitTime === -1 && b.waitTime.waitTime !== -1) return 1;
      if (a.waitTime.waitTime !== -1 && b.waitTime.waitTime === -1) return -1;
      
      return a.waitTime.waitTime - b.waitTime.waitTime;
    });
  };

  const renderItem = ({ item }: { item: { attraction: Attraction; waitTime: WaitTime; parkName: string } }) => (
    <View>
      <WaitTimeCard
        attraction={item.attraction}
        waitTime={item.waitTime}
        isFavorite={favorites.has(item.attraction.id)}
        onToggleFavorite={() => toggleFavorite(item.attraction.id)}
        onCreateAlert={() => handleCreateAlert(item.attraction)}
        hasAlert={!!getExistingAlert(item.attraction.id)}
      />
      <Text style={styles.parkLabel}>{item.parkName}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading wait times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredAttractions = getFilteredAttractions();
  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (typeof value === 'boolean') return count + (value ? 0 : 1);
    if (Array.isArray(value)) return count + (value.length < Object.values(AttractionType).length ? 1 : 0);
    if (value !== null) return count + 1;
    return count;
  }, 0) + (searchQuery ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Disney Wait Times</Text>
          <Text style={styles.subtitle}>Walt Disney World Orlando</Text>
        </View>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />
      
      <FlatList
        data={filteredAttractions}
        renderItem={renderItem}
        keyExtractor={item => item.attraction.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066CC']}
            tintColor="#0066CC"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No attractions found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pull to refresh • Auto-updates every 5 minutes
        </Text>
        <Text style={styles.footerText}>
          ★ Tap to favorite • LL = Lightning Lane • VQ = Virtual Queue
        </Text>
      </View>

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <WaitTimeAlertModal
        visible={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setSelectedAttraction(null);
        }}
        attraction={selectedAttraction}
        onCreateAlert={createWaitTimeAlert}
        existingAlert={selectedAttraction ? getExistingAlert(selectedAttraction.id) : null}
        onRemoveAlert={removeWaitTimeAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 2,
  },
  filterButton: {
    position: 'relative',
    padding: 8,
  },
  filterIcon: {
    fontSize: 24,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    paddingVertical: 8,
  },
  parkLabel: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginRight: 16,
    marginTop: -8,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});