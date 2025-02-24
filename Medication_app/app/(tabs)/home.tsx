import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AddMedicationForm from '../components/AddMedicationForm';
import MedicationListView from '../components/MedicationListView';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [showMedicationList, setShowMedicationList] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications to receive medication reminders');
      }

      // Load user data and medications
      try {
        const [userDataString, medicationsString, activitiesString] = await Promise.all([
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('medications'),
          AsyncStorage.getItem('medicationActivities')
        ]);
        
        if (userDataString) {
          setUserData(JSON.parse(userDataString));
        }
        if (medicationsString) {
          setMedications(JSON.parse(medicationsString));
        }
        if (activitiesString) {
          const activities = JSON.parse(activitiesString);
          // Sort activities by timestamp and take the most recent 5
          const sortedActivities = activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
          setRecentActivities(sortedActivities);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load your medication data');
      }
    };

    initialize();
  }, []);

  const addMedication = async (medicationData) => {
    try {
      const newMedication = {
        id: Date.now().toString(),
        name: medicationData.name,
        time: medicationData.time,
        dosage: medicationData.dosage,
        instructions: medicationData.instructions,
        createdAt: new Date().toISOString(),
        active: true, // Add active status for pausing functionality
        completed: false // Add completed status
      };

      // Update state
      const updatedMedications = [...medications, newMedication];
      setMedications(updatedMedications);

      // Save to AsyncStorage
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));

      // Schedule notification
      await scheduleNotification(newMedication);

      Alert.alert('Success', 'Medication and reminder have been set');
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication');
    }
  };

  const scheduleNotification = async (medication) => {
    if (!medication.active || medication.completed) return;
    
    try {
      // Cancel any existing notifications for this medication
      await cancelNotification(medication.id);
      
      const [hours, minutes] = medication.time.split(':');
      const trigger = new Date();
      trigger.setHours(parseInt(hours, 10));
      trigger.setMinutes(parseInt(minutes, 10));
      trigger.setSeconds(0);
      
      // If time has passed for today, schedule for tomorrow
      if (trigger < new Date()) {
        trigger.setDate(trigger.getDate() + 1);
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medication Reminder',
          body: `Time to take ${medication.name}${medication.dosage ? ` - ${medication.dosage}` : ''}`,
          data: { medicationId: medication.id },
        },
        trigger: {
          hour: parseInt(hours, 10),
          minute: parseInt(minutes, 10),
          repeats: true,
        },
      });
      
      // Store notification ID for later cancellation if needed
      const notificationsMap = JSON.parse(await AsyncStorage.getItem('medicationNotifications') || '{}');
      notificationsMap[medication.id] = notificationId;
      await AsyncStorage.setItem('medicationNotifications', JSON.stringify(notificationsMap));
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const cancelNotification = async (medicationId) => {
    try {
      const notificationsMap = JSON.parse(await AsyncStorage.getItem('medicationNotifications') || '{}');
      const notificationId = notificationsMap[medicationId];
      
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        delete notificationsMap[medicationId];
        await AsyncStorage.setItem('medicationNotifications', JSON.stringify(notificationsMap));
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  };

  const editMedication = (medication) => {
    setCurrentMedication(medication);
    setShowEditForm(true);
  };

  const updateMedication = async (updatedData) => {
    try {
      const updatedMedications = medications.map(med => 
        med.id === currentMedication.id 
          ? { ...med, ...updatedData } 
          : med
      );
      
      setMedications(updatedMedications);
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      
      // Update notification if medication is active
      const updatedMedication = updatedMedications.find(med => med.id === currentMedication.id);
      if (updatedMedication) {
        await scheduleNotification(updatedMedication);
      }
      
      Alert.alert('Success', 'Medication has been updated');
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  const toggleMedicationStatus = async (medication, statusType) => {
    try {
      let updatedMedications;
      
      if (statusType === 'active') {
        updatedMedications = medications.map(med => 
          med.id === medication.id 
            ? { ...med, active: !med.active } 
            : med
        );
      } else if (statusType === 'completed') {
        updatedMedications = medications.map(med => 
          med.id === medication.id 
            ? { ...med, completed: !med.completed, active: !med.completed ? med.active : false } 
            : med
        );
      }
      
      setMedications(updatedMedications);
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      
      const updatedMedication = updatedMedications.find(med => med.id === medication.id);
      
      if (updatedMedication.active && !updatedMedication.completed) {
        await scheduleNotification(updatedMedication);
      } else {
        await cancelNotification(medication.id);
      }
      
      Alert.alert('Success', statusType === 'active' 
        ? `Medication ${updatedMedication.active ? 'activated' : 'paused'}`
        : `Medication ${updatedMedication.completed ? 'marked as completed' : 'reactivated'}`
      );
    } catch (error) {
      console.error(`Error toggling medication ${statusType}:`, error);
      Alert.alert('Error', `Failed to ${statusType === 'active' ? 'pause/activate' : 'complete'} medication`);
    }
  };

  const deleteMedication = async (medicationId) => {
    try {
      // Cancel any scheduled notifications for this medication
      await cancelNotification(medicationId);
      
      // Remove medication from state and storage
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      setMedications(updatedMedications);
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
      
      Alert.alert('Success', 'Medication has been deleted');
    } catch (error) {
      console.error('Error deleting medication:', error);
      Alert.alert('Error', 'Failed to delete medication');
    }
  };

  const handleMedicationTaken = async (medication) => {
    try {
      const now = new Date();
      const activity = {
        id: Date.now().toString(),
        medicationId: medication.id,
        medicationName: medication.name,
        timestamp: now.toISOString(),
      };

      // Update recent activities
      const updatedActivities = [activity, ...recentActivities].slice(0, 5);
      setRecentActivities(updatedActivities);

      // Save activity
      const allActivities = JSON.parse(await AsyncStorage.getItem('medicationActivities') || '[]');
      allActivities.push(activity);
      await AsyncStorage.setItem('medicationActivities', JSON.stringify(allActivities));

      Alert.alert('Success', 'Medication marked as taken');
    } catch (error) {
      console.error('Error recording medication activity:', error);
      Alert.alert('Error', 'Failed to record medication');
    }
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Filter active medications for the main display
  const activeMedications = medications.filter(med => med.active && !med.completed);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={['#6C63FF', '#4A47FF']}
        style={styles.header}
      >
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{userData?.fullName || 'User'}!</Text>
        <Text style={styles.subtitle}>Stay on track with your medications</Text>
      </LinearGradient>

      {/* Quick Actions Section */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add-circle" size={32} color="#6C63FF" />
          <Text style={styles.actionText}>Add Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setShowMedicationList(true)}
        >
          <Ionicons name="calendar" size={32} color="#6C63FF" />
          <Text style={styles.actionText}>View Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Medications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Medications</Text>
        {activeMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active medications</Text>
            <TouchableOpacity onPress={() => setShowAddForm(true)}>
              <Text style={styles.emptyStateAction}>Add a medication</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeMedications.map(medication => (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationIcon}>
                <Ionicons name="medical" size={24} color="#6C63FF" />
              </View>
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationTime}>{medication.time}</Text>
                {medication.dosage && (
                  <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.iconButton, styles.checkButton]}
                  onPress={() => handleMedicationTaken(medication)}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => editMedication(medication)}
                >
                  <Ionicons name="pencil" size={20} color="#6C63FF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => toggleMedicationStatus(medication, 'active')}
                >
                  <Ionicons name="pause-circle" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent activity</Text>
          </View>
        ) : (
          recentActivities.map(activity => (
            <View key={activity.id} style={styles.activityCard}>
              <Text style={styles.activityText}>
                Took {activity.medicationName}
              </Text>
              <Text style={styles.activityTime}>
                {formatActivityTime(activity.timestamp)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Add Medication Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <AddMedicationForm
            onSubmit={(medicationData) => {
              addMedication(medicationData);
              setShowAddForm(false);
            }}
            onClose={() => setShowAddForm(false)}
          />
        </View>
      </Modal>

      {/* Edit Medication Modal */}
      {currentMedication && (
        <Modal
          visible={showEditForm}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <AddMedicationForm
              initialData={currentMedication}
              isEditing={true}
              onSubmit={(medicationData) => {
                updateMedication(medicationData);
                setShowEditForm(false);
                setCurrentMedication(null);
              }}
              onClose={() => {
                setShowEditForm(false);
                setCurrentMedication(null);
              }}
            />
          </View>
        </Modal>
      )}

      {/* Medication List Modal */}
      <Modal
        visible={showMedicationList}
        animationType="slide"
        onRequestClose={() => setShowMedicationList(false)}
      >
        <View style={styles.medicationListContainer}>
          <View style={styles.medicationListHeader}>
            <TouchableOpacity 
              onPress={() => setShowMedicationList(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.medicationListTitle}>Medication Schedule</Text>
          </View>
          <MedicationListView 
            medications={medications}
            onDelete={deleteMedication}
            onEdit={editMedication}
            onToggleStatus={toggleMedicationStatus}
            onClose={() => setShowMedicationList(false)}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '300',
  },
  userName: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '700',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '400',
    marginTop: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
    marginTop: 10,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333',
    fontWeight: '700',
    marginBottom: 15,
  },
  medicationCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    color: '#333',
    fontWeight: '600',
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  checkButton: {
    marginRight: 5,
  },
  medicationListContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  medicationListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  medicationListTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  closeButton: {
    padding: 5,
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateAction: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
    marginTop: 10,
  },
});

export default HomeScreen;