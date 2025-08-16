import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Home: undefined;
  'Wait Times': undefined;
  Favorites: undefined;
  Maps: undefined;
  More: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Home'>;
export type WaitTimesScreenProps = BottomTabScreenProps<RootTabParamList, 'Wait Times'>;
export type FavoritesScreenProps = BottomTabScreenProps<RootTabParamList, 'Favorites'>;
export type MapsScreenProps = BottomTabScreenProps<RootTabParamList, 'Maps'>;
export type MoreScreenProps = BottomTabScreenProps<RootTabParamList, 'More'>;