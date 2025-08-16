import { WaitTimesResponse, WaitTime, Attraction, ApiError } from '../types';

class WaitTimesService {
  private baseUrl = 'https://api.themeparks.wiki/v1';
  
  // ThemeParks.wiki API entity IDs for Disney World parks
  private parkEntityIds = {
    'wdw-magic-kingdom': '75ea578a-adc8-4116-a54d-dccb60765ef9',
    'wdw-epcot': '47f90d2c-e191-4239-a466-5892ef59a88b', 
    'wdw-hollywood-studios': '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
    'wdw-animal-kingdom': '1c84a229-8862-4648-9c71-378ddd2c7693'
  };

  async getWaitTimes(parkId: string): Promise<WaitTimesResponse> {
    console.log(`[DEBUG] waitTimesService: Fetching wait times for park: ${parkId}`);
    try {
      const entityId = this.parkEntityIds[parkId as keyof typeof this.parkEntityIds];
      if (!entityId) {
        throw new Error(`Unknown park ID: ${parkId}`);
      }

      // Fetch wait times
      console.log(`[DEBUG] waitTimesService: API URL: ${this.baseUrl}/entity/${entityId}/live`);
      const waitTimesResponse = await fetch(`${this.baseUrl}/entity/${entityId}/live`);
      
      if (!waitTimesResponse.ok) {
        const errorText = await waitTimesResponse.text();
        console.error(`[DEBUG] waitTimesService: API Error for ${parkId}:`, {
          status: waitTimesResponse.status,
          statusText: waitTimesResponse.statusText,
          body: errorText
        });
        throw new Error(`API Error (${waitTimesResponse.status}): ${waitTimesResponse.statusText}`);
      }
      
      const waitTimesData = await waitTimesResponse.json();
      console.log(`[DEBUG] waitTimesService: Response status for ${parkId}: ${waitTimesResponse.status}`);
      console.log(`[DEBUG] waitTimesService: Data structure for ${parkId}:`, {
        hasLiveData: !!waitTimesData.liveData,
        liveDataLength: waitTimesData.liveData?.length || 0
      });

      // Fetch park schedule
      const scheduleResponse = await fetch(`${this.baseUrl}/entity/${entityId}/schedule`);
      const scheduleData = await scheduleResponse.json();

      return this.transformApiResponse(parkId, waitTimesData, scheduleData);
    } catch (error: any) {
      console.error(`[DEBUG] waitTimesService: Error fetching ${parkId}:`, {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getAllWaitTimes(): Promise<WaitTimesResponse[]> {
    const parkIds = Object.keys(this.parkEntityIds);
    const promises = parkIds.map(parkId => this.getWaitTimes(parkId));
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching all wait times:', error);
      throw error;
    }
  }

  private transformApiResponse(parkId: string, waitTimesData: any, scheduleData: any): WaitTimesResponse {
    const park = this.transformPark(parkId, scheduleData);
    const attractions: Attraction[] = [];
    const waitTimes: WaitTime[] = [];

    // Validate API response structure
    if (!waitTimesData) {
      console.warn(`[DEBUG] waitTimesService: No data received for ${parkId}`);
      return { park, attractions, waitTimes, lastUpdated: new Date() };
    }

    // Check if liveData exists and is an array
    if (!waitTimesData.liveData || !Array.isArray(waitTimesData.liveData)) {
      console.warn(`[DEBUG] waitTimesService: No liveData array for ${parkId}, structure:`, {
        keys: Object.keys(waitTimesData),
        type: typeof waitTimesData.liveData
      });
      return { park, attractions, waitTimes, lastUpdated: new Date() };
    }

    waitTimesData.liveData.forEach((item: any) => {
      try {
        if (item.entityType === 'ATTRACTION') {
          // Validate required fields
          if (!item.id || !item.name) {
            console.warn(`[DEBUG] waitTimesService: Skipping invalid attraction:`, item);
            return;
          }

          // Transform attraction
          attractions.push({
            id: item.id,
            name: item.name,
            parkId: parkId,
            type: this.getAttractionType(item.attractionType),
            category: this.getAttractionCategory(item.tags || []),
            hasLightningLane: item.singleRider || false,
            hasVirtualQueue: item.virtualQueue || false,
            location: item.location ? {
              latitude: item.location.latitude,
              longitude: item.location.longitude
            } : undefined
          });

          // Transform wait time
          waitTimes.push({
            attractionId: item.id,
            waitTime: item.queue?.STANDBY?.waitTime || -1,
            status: this.getAttractionStatus(item.status),
            lastUpdated: new Date(item.lastUpdated || Date.now()),
            isEstimate: true,
            lightningLaneAvailable: item.queue?.LIGHTNING_LANE?.available || false
          });
        }
      } catch (err) {
        console.error(`[DEBUG] waitTimesService: Error processing attraction:`, err, item);
      }
    });

    console.log(`[DEBUG] waitTimesService: Processed ${parkId}:`, {
      attractionsCount: attractions.length,
      waitTimesCount: waitTimes.length
    });

    return {
      park,
      attractions,
      waitTimes,
      lastUpdated: new Date()
    };
  }

  private transformPark(parkId: string, scheduleData: any): any {
    const today = scheduleData?.schedule?.find((day: any) => {
      const dayDate = new Date(day.date);
      const today = new Date();
      return dayDate.toDateString() === today.toDateString();
    });

    return {
      id: parkId,
      name: this.getParkName(parkId),
      location: 'Walt Disney World, Orlando, FL',
      timezone: 'America/New_York',
      isOpen: today?.type === 'OPERATING',
      openTime: today?.openingTime,
      closeTime: today?.closingTime
    };
  }

  private getParkName(parkId: string): string {
    const names: Record<string, string> = {
      'wdw-magic-kingdom': 'Magic Kingdom',
      'wdw-epcot': 'EPCOT',
      'wdw-hollywood-studios': "Disney's Hollywood Studios",
      'wdw-animal-kingdom': "Disney's Animal Kingdom"
    };
    return names[parkId] || parkId;
  }

  private getAttractionType(apiType: string): any {
    // Map API attraction types to our enum
    const typeMap: Record<string, string> = {
      'RIDE': 'ride',
      'SHOW': 'show',
      'MEET_GREET': 'meet_greet',
      'RESTAURANT': 'restaurant',
      'SHOP': 'shop'
    };
    return typeMap[apiType] || 'ride';
  }

  private getAttractionCategory(tags: string[]): any {
    // Determine category based on tags
    if (tags.includes('thrill')) return 'thrill';
    if (tags.includes('family')) return 'family';
    if (tags.includes('kids')) return 'kids';
    if (tags.includes('water')) return 'water';
    return 'family'; // default
  }

  private getAttractionStatus(apiStatus: string): any {
    const statusMap: Record<string, string> = {
      'OPERATING': 'operating',
      'CLOSED': 'closed',
      'DOWN': 'down',
      'REFURBISHMENT': 'refurbishment'
    };
    return statusMap[apiStatus] || 'closed';
  }
}

export const waitTimesService = new WaitTimesService();