import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AttractionType, AttractionCategory } from '../types';

interface FilterOptions {
  showClosedAttractions: boolean;
  attractionTypes: AttractionType[];
  attractionCategories: AttractionCategory[];
  maxWaitTime: number | null;
  onlyFavorites: boolean;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange
}) => {
  const attractionTypes = Object.values(AttractionType);
  const attractionCategories = Object.values(AttractionCategory);
  const waitTimeOptions = [15, 30, 45, 60, 90];

  const toggleAttractionType = (type: AttractionType) => {
    const newTypes = filters.attractionTypes.includes(type)
      ? filters.attractionTypes.filter(t => t !== type)
      : [...filters.attractionTypes, type];
    
    onFiltersChange({ ...filters, attractionTypes: newTypes });
  };

  const toggleAttractionCategory = (category: AttractionCategory) => {
    const newCategories = filters.attractionCategories.includes(category)
      ? filters.attractionCategories.filter(c => c !== category)
      : [...filters.attractionCategories, category];
    
    onFiltersChange({ ...filters, attractionCategories: newCategories });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      showClosedAttractions: true,
      attractionTypes: attractionTypes,
      attractionCategories: attractionCategories,
      maxWaitTime: null,
      onlyFavorites: false,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneButton}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Show closed attractions</Text>
              <Switch
                value={filters.showClosedAttractions}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, showClosedAttractions: value })
                }
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Only favorites</Text>
              <Switch
                value={filters.onlyFavorites}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, onlyFavorites: value })
                }
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Wait Time</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  filters.maxWaitTime === null && styles.chipSelected
                ]}
                onPress={() => onFiltersChange({ ...filters, maxWaitTime: null })}
              >
                <Text style={[
                  styles.chipText,
                  filters.maxWaitTime === null && styles.chipTextSelected
                ]}>Any</Text>
              </TouchableOpacity>
              
              {waitTimeOptions.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.chip,
                    filters.maxWaitTime === time && styles.chipSelected
                  ]}
                  onPress={() => onFiltersChange({ ...filters, maxWaitTime: time })}
                >
                  <Text style={[
                    styles.chipText,
                    filters.maxWaitTime === time && styles.chipTextSelected
                  ]}>{time} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attraction Types</Text>
            <View style={styles.chipContainer}>
              {attractionTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    filters.attractionTypes.includes(type) && styles.chipSelected
                  ]}
                  onPress={() => toggleAttractionType(type)}
                >
                  <Text style={[
                    styles.chipText,
                    filters.attractionTypes.includes(type) && styles.chipTextSelected
                  ]}>{type.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.chipContainer}>
              {attractionCategories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    filters.attractionCategories.includes(category) && styles.chipSelected
                  ]}
                  onPress={() => toggleAttractionCategory(category)}
                >
                  <Text style={[
                    styles.chipText,
                    filters.attractionCategories.includes(category) && styles.chipTextSelected
                  ]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
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
  clearButton: {
    fontSize: 16,
    color: '#666666',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 16,
    color: '#333333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  chipText: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});