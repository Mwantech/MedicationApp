import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MedicationListView = () => {
  const [medications, setMedications] = useState([]);
  const [filter, setFilter] = useState('ongoing');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDosage, setEditedDosage] = useState('');
  const [editedTime, setEditedTime] = useState('');
  const [editedInstructions, setEditedInstructions] = useState('');

  useEffect(() => {
    loadMedications();
  }, []);

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Medication name is required');
      return;
    }

    try {
      const updatedMedications = medications.map(med =>
        med.id === selectedMedication.id
          ? {
              ...med,
              name: editedName.trim(),
              dosage: editedDosage.trim(),
              time: editedTime.trim(),
              instructions: editedInstructions.trim(),
            }
          : med
      );

      await saveMedications(updatedMedications);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication changes');
    }
  };

  const loadMedications = async () => {
    try {
      const medicationsString = await AsyncStorage.getItem('medications');
      if (medicationsString) {
        const medicationsData = JSON.parse(medicationsString);
        setMedications(medicationsData);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    }
  };

  const saveMedications = async (updatedMedications) => {
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      setMedications(updatedMedications);
    } catch (error) {
      console.error('Error saving medications:', error);
      Alert.alert('Error', 'Failed to save medications');
    }
  };

  const handleStatusChange = async (medicationId, newStatus) => {
    try {
      const updatedMedications = medications.map(med => 
        med.id === medicationId ? { ...med, status: newStatus } : med
      );
      await saveMedications(updatedMedications);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update medication status');
    }
  };

  const handleDelete = async (medicationId) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMedications = medications.filter(med => med.id !== medicationId);
              await saveMedications(updatedMedications);
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (medication) => {
    setSelectedMedication(medication);
    setEditedName(medication.name);
    setEditedDosage(medication.dosage || '');
    setEditedTime(medication.time);
    setEditedInstructions(medication.instructions || '');
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return ['#34D399', '#10B981'];
      case 'paused': return ['#F59E0B', '#D97706'];
      default: return ['#60A5FA', '#3B82F6'];
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return 'checkmark-circle';
      case 'paused': return 'pause-circle';
      default: return 'time';
    }
  };

  const filteredMedications = medications.filter(med => {
    if (!med.status) return filter === 'ongoing';
    return med.status === filter;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Medications</Text>
        <Text style={styles.headerSubtitle}>{filteredMedications.length} medications</Text>
      </LinearGradient>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {['ongoing', 'completed', 'paused'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterPill,
              filter === filterType && styles.activeFilterPill
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Ionicons
              name={filter === filterType ? 'radio-button-on' : 'radio-button-off'}
              size={16}
              color={filter === filterType ? '#4F46E5' : '#6B7280'}
              style={styles.filterIcon}
            />
            <Text style={[
              styles.filterText,
              filter === filterType && styles.activeFilterText
            ]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Medications List */}
      <ScrollView style={styles.medicationList}>
        {filteredMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical" size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateText}>No {filter} medications</Text>
            <Text style={styles.emptyStateSubtext}>
              Medications you add will appear here
            </Text>
          </View>
        ) : (
          filteredMedications.map(medication => (
            <View key={medication.id} style={styles.medicationCard}>
              <LinearGradient
                colors={getStatusColor(medication.status)}
                style={styles.statusIndicator}
              >
                <Ionicons
                  name={getStatusIcon(medication.status)}
                  size={20}
                  color="white"
                />
              </LinearGradient>
              
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <View style={styles.medicationMetaContainer}>
                  <View style={styles.medicationMeta}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.medicationMetaText}>{medication.time}</Text>
                  </View>
                  {medication.dosage && (
                    <View style={styles.medicationMeta}>
                      <Ionicons name="flask-outline" size={14} color="#6B7280" />
                      <Text style={styles.medicationMetaText}>{medication.dosage}</Text>
                    </View>
                  )}
                </View>
                {medication.instructions && (
                  <Text style={styles.medicationInstructions}>
                    {medication.instructions}
                  </Text>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(medication)}
                >
                  <Ionicons name="pencil" size={18} color="#4F46E5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(medication.id)}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Medication</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowEditModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medication Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter medication name"
                value={editedName}
                onChangeText={setEditedName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dosage</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter dosage"
                value={editedDosage}
                onChangeText={setEditedDosage}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter time"
                value={editedTime}
                onChangeText={setEditedTime}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter instructions"
                value={editedInstructions}
                onChangeText={setEditedInstructions}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterPill: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#4F46E5',
  },
  medicationList: {
    padding: 20,
  },
  medicationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicationMetaContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  medicationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  medicationMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  medicationInstructions: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default MedicationListView;