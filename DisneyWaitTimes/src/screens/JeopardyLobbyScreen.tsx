import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { YouTubeApiService } from '../services/youtubeApiService';
import { JeopardyEpisode } from '../types';

type JeopardyStackParamList = {
  JeopardyLobby: undefined;
  JeopardyVideo: { episode: JeopardyEpisode };
};

type NavigationProp = StackNavigationProp<JeopardyStackParamList, 'JeopardyLobby'>;

export default function JeopardyLobbyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [episodes, setEpisodes] = useState<JeopardyEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'watch-along' | 'quick-play' | 'practice'>('watch-along');

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      setLoading(true);
      const fetchedEpisodes = await YouTubeApiService.checkForNewEpisodes();
      setEpisodes(fetchedEpisodes);
    } catch (error) {
      console.error('Error loading episodes:', error);
      Alert.alert('Error', 'Failed to load episodes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEpisodes();
    setRefreshing(false);
  };

  const handleEpisodePress = (episode: JeopardyEpisode) => {
    navigation.navigate('JeopardyVideo', { episode });
  };

  const renderGameMode = (mode: typeof selectedMode, title: string, description: string, icon: string) => (
    <TouchableOpacity
      style={[styles.modeCard, selectedMode === mode && styles.selectedMode]}
      onPress={() => setSelectedMode(mode)}
    >
      <Text style={styles.modeIcon}>{icon}</Text>
      <View style={styles.modeContent}>
        <Text style={styles.modeTitle}>{title}</Text>
        <Text style={styles.modeDescription}>{description}</Text>
      </View>
      {selectedMode === mode && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  const renderEpisode = (episode: JeopardyEpisode) => (
    <TouchableOpacity
      key={episode.id}
      style={styles.episodeCard}
      onPress={() => handleEpisodePress(episode)}
    >
      <View style={styles.episodeImageContainer}>
        <Image
          source={{ uri: episode.thumbnailUrl }}
          style={styles.episodeThumbnail}
          defaultSource={require('../../assets/icon.png')}
        />
        {episode.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{episode.duration}</Text>
        </View>
      </View>
      
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {episode.title}
        </Text>
        <Text style={styles.episodeNumber}>Episode #{episode.episodeNumber}</Text>
        
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {episode.categories.slice(0, 3).map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.episodeFooter}>
          <Text style={styles.publishDate}>
            {new Date(episode.publishedAt).toLocaleDateString()}
          </Text>
          {episode.timeMapped && (
            <View style={styles.timeMappedBadge}>
              <Ionicons name="time" size={12} color="#4CAF50" />
              <Text style={styles.timeMappedText}>Interactive</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Loading Disney Jeopardy episodes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Disney Jeopardy</Text>
          <Text style={styles.headerSubtitle}>
            Test your Disney knowledge with weekly trivia episodes!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Mode</Text>
          <View style={styles.modesContainer}>
            {renderGameMode(
              'watch-along',
              'Watch Along',
              'Play with the full video experience',
              '📺'
            )}
            {renderGameMode(
              'quick-play',
              'Quick Play',
              'Jump straight to questions',
              '⚡'
            )}
            {renderGameMode(
              'practice',
              'Practice',
              'Random questions from all episodes',
              '🎯'
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#1E88E5" />
            </TouchableOpacity>
          </View>
          
          {episodes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No episodes available</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.episodesGrid}>
              {episodes.map(renderEpisode)}
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#1E88E5" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>New Episodes Every Friday!</Text>
              <Text style={styles.infoText}>
                Disney Jeopardy releases new episodes every Friday at 8 PM EST.
                Enable notifications to never miss a new episode!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  modesContainer: {
    gap: 10,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedMode: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  modeIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
  },
  episodesGrid: {
    gap: 15,
  },
  episodeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  episodeImageContainer: {
    position: 'relative',
    height: 180,
  },
  episodeThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  episodeInfo: {
    padding: 15,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  episodeNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#1E88E5',
  },
  episodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publishDate: {
    fontSize: 12,
    color: '#999',
  },
  timeMappedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeMappedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});