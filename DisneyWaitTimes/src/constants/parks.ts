import { Park } from '../types';

// Disney World Orlando Parks
export const DISNEY_WORLD_PARKS: Park[] = [
  {
    id: 'wdw-magic-kingdom',
    name: 'Magic Kingdom',
    location: 'Walt Disney World, Orlando, FL',
    timezone: 'America/New_York',
    isOpen: true
  },
  {
    id: 'wdw-epcot',
    name: 'EPCOT',
    location: 'Walt Disney World, Orlando, FL',
    timezone: 'America/New_York',
    isOpen: true
  },
  {
    id: 'wdw-hollywood-studios',
    name: "Disney's Hollywood Studios",
    location: 'Walt Disney World, Orlando, FL',
    timezone: 'America/New_York',
    isOpen: true
  },
  {
    id: 'wdw-animal-kingdom',
    name: "Disney's Animal Kingdom",
    location: 'Walt Disney World, Orlando, FL',
    timezone: 'America/New_York',
    isOpen: true
  }
];

// Future scalability - placeholder for other Disney parks
export const DISNEYLAND_PARKS: Park[] = [
  {
    id: 'dl-disneyland',
    name: 'Disneyland Park',
    location: 'Disneyland, Anaheim, CA',
    timezone: 'America/Los_Angeles',
    isOpen: true
  },
  {
    id: 'dl-california-adventure',
    name: 'Disney California Adventure',
    location: 'Disneyland, Anaheim, CA',
    timezone: 'America/Los_Angeles',
    isOpen: true
  }
];

export const PARKS_BY_LOCATION = {
  'walt-disney-world': DISNEY_WORLD_PARKS,
  'disneyland': DISNEYLAND_PARKS
} as const;

export const DEFAULT_LOCATION = 'walt-disney-world';