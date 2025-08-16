export interface Park {
  id: string;
  name: string;
  location: string;
  timezone: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface Attraction {
  id: string;
  name: string;
  parkId: string;
  type: AttractionType;
  category: AttractionCategory;
  minimumHeight?: number;
  hasLightningLane: boolean;
  hasVirtualQueue: boolean;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface WaitTime {
  attractionId: string;
  waitTime: number; // in minutes, -1 for closed
  status: AttractionStatus;
  lastUpdated: Date;
  isEstimate: boolean;
  lightningLaneAvailable?: boolean;
  virtualQueueStatus?: VirtualQueueStatus;
}

export enum AttractionType {
  RIDE = 'ride',
  SHOW = 'show',
  MEET_GREET = 'meet_greet',
  RESTAURANT = 'restaurant',
  SHOP = 'shop'
}

export enum AttractionCategory {
  THRILL = 'thrill',
  FAMILY = 'family',
  KIDS = 'kids',
  WATER = 'water',
  DARK = 'dark',
  OUTDOOR = 'outdoor'
}

export enum AttractionStatus {
  OPERATING = 'operating',
  CLOSED = 'closed',
  DOWN = 'down',
  REFURBISHMENT = 'refurbishment'
}

export enum VirtualQueueStatus {
  AVAILABLE = 'available',
  FULL = 'full',
  PAUSED = 'paused',
  NOT_AVAILABLE = 'not_available'
}

export interface WaitTimeAlert {
  id: string;
  attractionId: string;
  attractionName: string;
  parkName: string;
  targetWaitTime: number;
  alertType: 'below' | 'above';
  isActive: boolean;
  isEnabled?: boolean;
  createdAt: string;
  triggeredAt?: Date;
}

export interface UserPreferences {
  favoriteAttractions: string[];
  notifications: {
    enabled: boolean;
    waitTimeAlerts: boolean;
    parkHours: boolean;
    attractionStatus: boolean;
  };
  filters: {
    showClosedAttractions: boolean;
    attractionTypes: AttractionType[];
    minimumWaitTime: number;
    maximumWaitTime: number;
  };
}

// API Response types
export interface WaitTimesResponse {
  park: Park;
  attractions: Attraction[];
  waitTimes: WaitTime[];
  lastUpdated: Date;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Swipe Discovery types
export interface SwipeableItem {
  id: string;
  type: 'attraction' | 'show' | 'restaurant' | 'experience';
  name: string;
  description: string;
  imageUrl?: string;
  parkName: string;
  parkId: string;
  categories: string[];
  tags: string[];
  averageRating?: number;
  currentWaitTime?: number;
  intensity?: 'gentle' | 'moderate' | 'intense';
  duration?: string;
  heightRequirement?: number;
  features?: string[];
}

export interface UserSwipePreference {
  itemId: string;
  itemName: string;
  liked: boolean;
  timestamp: Date;
  categories: string[];
  parkId: string;
}

export interface RecommendationProfile {
  preferredCategories: Record<string, number>;
  dislikedCategories: Record<string, number>;
  preferredParks: Record<string, number>;
  swipeHistory: UserSwipePreference[];
  totalSwipes: number;
  lastUpdated: Date;
}