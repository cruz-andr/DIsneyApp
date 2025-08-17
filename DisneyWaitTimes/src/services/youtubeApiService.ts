import AsyncStorage from '@react-native-async-storage/async-storage';
import { JeopardyEpisode } from '../types';

// YouTube API key from Google Cloud Console
const YOUTUBE_API_KEY = 'AIzaSyCE3dRfnF4oBYKq8Lo5wM34MgtkfsDFLKE';

// Inside The Magic channel ID 
const CHANNEL_ID = 'UC2Wq6RPjQW0I2JJxaYZRNBQ'; // Inside The Magic channel
const SEARCH_QUERY = 'jeopardy'; // Simplified search term

const STORAGE_KEY = 'jeopardy_episodes';
const LAST_CHECK_KEY = 'last_episode_check';

export class YouTubeApiService {
  /**
   * Check for new Disney Jeopardy episodes
   */
  static async checkForNewEpisodes(): Promise<JeopardyEpisode[]> {
    try {
      // Check if we've already checked today
      const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
      const today = new Date().toDateString();
      
      if (lastCheck === today && !__DEV__) {
        // Already checked today, return cached episodes
        return await this.getCachedEpisodes();
      }

      // Search for Disney Jeopardy videos (without channel restriction for now)
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=Disney%20Jeopardy%20Inside%20the%20Magic&` +
        `type=video&` +
        `order=relevance&` +
        `maxResults=20&` +
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        console.error('YouTube API error:', response.status, response.statusText);
        throw new Error('Failed to fetch YouTube videos');
      }

      const data = await response.json();
      console.log('YouTube API Response:', data);
      console.log('Total results:', data.items?.length || 0);
      
      const episodes: JeopardyEpisode[] = [];

      if (!data.items || data.items.length === 0) {
        console.log('No videos found from YouTube API');
        return await this.getCachedEpisodes();
      }

      for (const item of data.items) {
        const snippet = item.snippet;
        const videoId = item.id.videoId;
        
        // Check if it's a Disney Jeopardy episode
        // Log for debugging
        console.log('Video found:', snippet.title, 'Channel:', snippet.channelTitle, 'Channel ID:', snippet.channelId);
        
        // Accept any Disney Jeopardy video for now to find the right channel
        if (snippet.title.toLowerCase().includes('jeopardy') || 
            snippet.title.toLowerCase().includes('disney')) {
          const episodeNumber = this.extractEpisodeNumber(snippet.title);
          
          episodes.push({
            id: videoId,
            videoId: videoId,
            episodeNumber: episodeNumber,
            title: snippet.title,
            description: snippet.description,
            publishedAt: new Date(snippet.publishedAt),
            thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
            duration: await this.getVideoDuration(videoId),
            categories: this.extractCategories(snippet.description),
            isNew: this.isNewEpisode(snippet.publishedAt),
            timeMapped: await this.hasTimeMapping(videoId),
          });
        }
      }

      // Cache the episodes
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
      await AsyncStorage.setItem(LAST_CHECK_KEY, today);

      return episodes;
    } catch (error) {
      console.error('Error fetching YouTube episodes:', error);
      // Return cached episodes as fallback
      return await this.getCachedEpisodes();
    }
  }

  /**
   * Get video duration from YouTube API
   */
  private static async getVideoDuration(videoId: string): Promise<string> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=contentDetails&` +
        `id=${videoId}&` +
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        return 'Unknown';
      }

      const data = await response.json();
      const duration = data.items[0]?.contentDetails?.duration || 'PT30M';
      
      // Convert ISO 8601 duration to readable format
      return this.formatDuration(duration);
    } catch (error) {
      console.error('Error fetching video duration:', error);
      return 'Unknown';
    }
  }

  /**
   * Format ISO 8601 duration to readable format
   */
  private static formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'Unknown';

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Extract episode number from title
   */
  private static extractEpisodeNumber(title: string): number {
    const match = title.match(/(?:Episode|Ep|#)\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Extract categories from description
   */
  private static extractCategories(description: string): string[] {
    // Look for category mentions in the description
    const categories: string[] = [];
    const categoryPattern = /Categories?:?\s*([^.\n]+)/i;
    const match = description.match(categoryPattern);
    
    if (match) {
      // Split by common delimiters
      const cats = match[1].split(/[,&•]/);
      cats.forEach(cat => {
        const cleaned = cat.trim();
        if (cleaned) categories.push(cleaned);
      });
    }

    // If no categories found, return default
    if (categories.length === 0) {
      return ['Disney Movies', 'Theme Parks', 'Characters', 'Music', 'History'];
    }

    return categories.slice(0, 6); // Jeopardy has 6 categories
  }

  /**
   * Check if episode is new (within last 7 days)
   */
  private static isNewEpisode(publishedAt: string): boolean {
    const publishDate = new Date(publishedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return publishDate > sevenDaysAgo;
  }

  /**
   * Check if we have time mapping for this episode
   */
  private static async hasTimeMapping(videoId: string): Promise<boolean> {
    try {
      const mappingKey = `time_map_${videoId}`;
      const mapping = await AsyncStorage.getItem(mappingKey);
      return mapping !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get cached episodes
   */
  private static async getCachedEpisodes(): Promise<JeopardyEpisode[]> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error getting cached episodes:', error);
    }
    
    // Return sample episodes if no cache
    return this.getSampleEpisodes();
  }

  /**
   * Get sample episodes for development
   */
  private static getSampleEpisodes(): JeopardyEpisode[] {
    return [
      {
        id: 'sample1',
        videoId: 'dQw4w9WgXcQ', // Sample video ID (you'll replace with actual)
        episodeNumber: 75,
        title: 'Disney Jeopardy Episode 75 - Disney 100 Special',
        description: 'Test your Disney knowledge with categories including Pixar Films, Disney Princesses, Theme Park Attractions, Villain Songs, and more!',
        publishedAt: new Date(),
        thumbnailUrl: 'https://via.placeholder.com/480x360',
        duration: '32m 15s',
        categories: ['Pixar Films', 'Disney Princesses', 'Theme Parks', 'Villain Songs', 'Animation History', 'Disney Music'],
        isNew: true,
        timeMapped: true,
      },
      {
        id: 'sample2',
        videoId: 'sample_video_2',
        episodeNumber: 74,
        title: 'Disney Jeopardy Episode 74 - Holiday Magic',
        description: 'Holiday-themed Disney trivia featuring Christmas movies, holiday park events, and festive Disney moments!',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        thumbnailUrl: 'https://via.placeholder.com/480x360',
        duration: '30m 45s',
        categories: ['Holiday Films', 'Park Events', 'Character Costumes', 'Music & Songs', 'Disney History', 'Animated Shorts'],
        isNew: false,
        timeMapped: true,
      },
    ];
  }

  /**
   * Search for Disney Jeopardy videos directly from Inside The Magic
   */
  static async searchDisneyJeopardy(): Promise<JeopardyEpisode[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `channelId=${CHANNEL_ID}&` +
        `q=${encodeURIComponent(SEARCH_QUERY)}&` +
        `type=video&` +
        `order=date&` +
        `maxResults=20&` +
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const episodes: JeopardyEpisode[] = [];

      for (const item of data.items) {
        const snippet = item.snippet;
        const videoId = item.id.videoId;
        const episodeNumber = this.extractEpisodeNumber(snippet.title);

        episodes.push({
          id: videoId,
          videoId: videoId,
          episodeNumber: episodeNumber,
          title: snippet.title,
          description: snippet.description,
          publishedAt: new Date(snippet.publishedAt),
          thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
          duration: await this.getVideoDuration(videoId),
          categories: this.extractCategories(snippet.description),
          isNew: this.isNewEpisode(snippet.publishedAt),
          timeMapped: await this.hasTimeMapping(videoId),
        });
      }

      return episodes;
    } catch (error) {
      console.error('Error searching for Disney Jeopardy:', error);
      return this.getSampleEpisodes();
    }
  }
}