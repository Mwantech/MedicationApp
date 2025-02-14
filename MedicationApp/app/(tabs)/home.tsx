import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUserData();
  }, []);

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
        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="add-circle" size={32} color="#6C63FF" />
          <Text style={styles.actionText}>Add Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="notifications" size={32} color="#6C63FF" />
          <Text style={styles.actionText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Medications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Medications</Text>
        <View style={styles.medicationCard}>
          <Image
            source={require('@/assets/images/logo.jpeg')} // Replace with your image path
            style={styles.medicationIcon}
          />
          <View style={styles.medicationDetails}>
            <Text style={styles.medicationName}>Paracetamol</Text>
            <Text style={styles.medicationTime}>8:00 AM</Text>
          </View>
          <TouchableOpacity style={styles.checkButton}>
            <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>Took Paracetamol at 8:00 AM</Text>
          <Text style={styles.activityTime}>Today</Text>
        </View>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationIcon: {
    width: 40,
    height: 40,
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
  },
  checkButton: {
    padding: 10,
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
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
});

export default HomeScreen;