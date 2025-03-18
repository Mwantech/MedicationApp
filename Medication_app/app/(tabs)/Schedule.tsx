// In app/(tabs)/ScheduleScreen.js (or index.js)
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MedicationScheduleView from '../components/MedicationScheduleView';
import AddMedicationForm from '../components/AddMedicationForm';

const ScheduleScreen = () => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMedication = (newMedication) => {
    // Generate a unique ID for the medication
    const medicationWithId = {
      ...newMedication,
      id: Date.now().toString(), // Simple way to generate unique IDs
    };

    setMedications([...medications, medicationWithId]);
    setShowAddForm(false);
  };

  return (
    <View style={styles.container}>
      {showAddForm ? (
        <AddMedicationForm 
          onSubmit={handleAddMedication}
          onClose={() => setShowAddForm(false)}
        />
      ) : (
        <>
          <MedicationScheduleView medications={medications} />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4B7BEC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ScheduleScreen;