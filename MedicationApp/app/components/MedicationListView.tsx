import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const MedicationListView = () => {
  const [medications, setMedications] = useState([]);
  const [filter, setFilter] = useState('ongoing'); // ongoing, completed, paused
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDosage, setEditedDosage] = useState('');
  const [editedTime, setEditedTime] = useState('');
  const [editedInstructions, setEditedInstructions] = useState('');

  useEffect(() => {
    loadMedications();
  }, []);

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
    const updatedMedications = medications.map(med => 
      med.id === medicationId ? { ...med, status: newStatus } : med
    );
    await saveMedications(updatedMedications);
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
            const updatedMedications = medications.filter(med => med.id !== medicationId);
            await saveMedications(updatedMedications);
          }
        }
      ]
    );
  };

  const handleEdit = (medication) => {
    setSelectedMedication(medication);
    setEditedName(medication.name);
    setEditedDosage(medication.dosage);
    setEditedTime(medication.time);
    setEditedInstructions(medication.instructions);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Medication name is required');
      return;
    }

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
  };

  const filteredMedications = medications.filter(med => {
    if (!med.status) return filter === 'ongoing';
    return med.status === filter;
  });

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ongoing' && styles.activeFilter]}
          onPress={() => setFilter('ongoing')}
        >
          <Text style={styles.filterText}>Ongoing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={styles.filterText}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'paused' && styles.activeFilter]}
          onPress={() => setFilter('paused')}
        >
          <Text style={styles.filterText}>Paused</Text>
        </TouchableOpacity>
      </View>

      {/* Medications List */}
      <ScrollView style={styles.medicationList}>
        {filteredMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No {filter} medications</Text>
          </View>
        ) : (
          filteredMedications.map(medication => (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDetails}>
                  {medication.dosage} • {medication.time}
                </Text>
                {medication.instructions && (
                  <Text style={styles.medicationInstructions}>
                    {medication.instructions}
                  </Text>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(medication)}
                >
                  <Ionicons name="pencil" size={20} color="#6C63FF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(medication.id)}
                >
                  <Ionicons name="trash" size={20} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleStatusChange(
                    medication.id,
                    medication.status === 'paused' ? 'ongoing' : 'paused'
                  )}
                >
                  <Ionicons
                    name={medication.status === 'paused' ? 'play' : 'pause'}
                    size={20}
                    color="#4A90E2"
                  />
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
            <Text style={styles.modalTitle}>Edit Medication</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Medication Name"
              value={editedName}
              onChangeText={setEditedName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Dosage"
              value={editedDosage}
              onChangeText={setEditedDosage}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Time"
              value={editedTime}
              onChangeText={setEditedTime}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Instructions"
              value={editedInstructions}
              onChangeText={setEditedInstructions}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.buttonText}>Save</Text>
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
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeFilter: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    color: '#333',
    fontWeight: '500',
  },
  medicationList: {
    flex: 1,
    padding: 15,
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  medicationInstructions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MedicationListView;