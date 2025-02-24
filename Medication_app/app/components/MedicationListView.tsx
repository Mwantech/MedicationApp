import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MedicationListView = ({ 
  medications = [], 
  onDelete, 
  onEdit,
  onToggleStatus,
  onClose
}) => {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'paused', 'completed'
  
  // Group medications by status for filtering
  const filteredMedications = medications.filter(med => {
    if (filterMode === 'all') return true;
    if (filterMode === 'active') return med.active && !med.completed;
    if (filterMode === 'paused') return !med.active && !med.completed;
    if (filterMode === 'completed') return med.completed;
    return true;
  });

  // Sort medications by time
  const sortedMedications = [...filteredMedications].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0]; // Sort by hour
    }
    return timeA[1] - timeB[1]; // If hours are equal, sort by minutes
  });

  const confirmDelete = (medication) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => onDelete(medication.id),
          style: "destructive"
        }
      ]
    );
  };

  const renderMedicationItem = ({ item }) => {
    const statusColor = item.completed 
      ? '#28a745' // Green for completed
      : item.active 
        ? '#6C63FF' // Purple for active
        : '#6c757d'; // Gray for paused
    
    const statusIcon = item.completed 
      ? 'checkmark-circle'
      : item.active 
        ? 'checkmark-circle-outline'
        : 'pause-circle';

    return (
      <View style={styles.medicationCard}>
        <View style={[styles.medicationIcon, { backgroundColor: `${statusColor}20` }]}>
          <Ionicons name="medical" size={24} color={statusColor} />
        </View>
        <View style={styles.medicationDetails}>
          <Text style={styles.medicationName}>{item.name}</Text>
          <Text style={styles.medicationTime}>{item.time}</Text>
          {item.dosage && (
            <Text style={styles.medicationDosage}>{item.dosage}</Text>
          )}
          {item.instructions && (
            <Text style={styles.medicationInstructions} numberOfLines={2}>
              {item.instructions}
            </Text>
          )}
        </View>
        <View style={styles.medicationActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="pencil" size={20} color="#6C63FF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => item.completed 
              ? onToggleStatus(item, 'completed') 
              : onToggleStatus(item, 'active')
            }
          >
            <Ionicons name={statusIcon} size={20} color={statusColor} />
          </TouchableOpacity>
          
          {!item.completed && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onToggleStatus(item, 'completed')}
            >
              <Ionicons name="checkbox-outline" size={20} color="#28a745" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => confirmDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterMode === 'all' && styles.activeFilter
          ]}
          onPress={() => setFilterMode('all')}
        >
          <Text style={[
            styles.filterText,
            filterMode === 'all' && styles.activeFilterText
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterMode === 'active' && styles.activeFilter
          ]}
          onPress={() => setFilterMode('active')}
        >
          <Text style={[
            styles.filterText,
            filterMode === 'active' && styles.activeFilterText
          ]}>Active</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterMode === 'paused' && styles.activeFilter
          ]}
          onPress={() => setFilterMode('paused')}
        >
          <Text style={[
            styles.filterText,
            filterMode === 'paused' && styles.activeFilterText
          ]}>Paused</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterMode === 'completed' && styles.activeFilter
          ]}
          onPress={() => setFilterMode('completed')}
        >
          <Text style={[
            styles.filterText,
            filterMode === 'completed' && styles.activeFilterText
          ]}>Completed</Text>
        </TouchableOpacity>
      </View>
      
      {sortedMedications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No medications {filterMode !== 'all' ? `in ${filterMode} status` : 'found'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedMedications}
          renderItem={renderMedicationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.medicationList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#F5F5F5',
  },
  activeFilter: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '500',
  },
  medicationList: {
    padding: 15,
  },
  medicationCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medicationIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F0F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  medicationTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  medicationInstructions: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  medicationActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MedicationListView;