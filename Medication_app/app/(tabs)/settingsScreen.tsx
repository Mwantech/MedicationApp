import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const SettingsProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    emergencyAlerts: true,
  });
  
  const [emergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'John Doe', phone: '+1 234 567 8900' },
    { id: '2', name: 'Jane Smith', phone: '+1 234 567 8901' },
  ]);

  const handleLogout = async () => {
    try {
      await signOut();
      // Add explicit navigation to ensure immediate redirection
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
    }
  };

  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleUpdateEmail = () => {
    // Add your email update logic here
    Alert.alert(
      'Update Email',
      'Are you sure you want to update your email?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              // Add your API call to update email here
              setIsEditing(false);
              Alert.alert('Success', 'Email updated successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to update email. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name}</Text>
              <View style={styles.emailContainer}>
                {isEditing ? (
                  <View style={styles.emailEditContainer}>
                    <TextInput
                      style={styles.emailInput}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="Enter new email"
                    />
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleUpdateEmail}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.emailDisplay}>
                    <Text style={styles.email}>{email}</Text>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => setIsEditing(true)}
                    >
                      <Ionicons name="pencil" size={18} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationSettings.pushEnabled}
              onValueChange={() => handleToggleNotification('pushEnabled')}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch
              value={notificationSettings.emailEnabled}
              onValueChange={() => handleToggleNotification('emailEnabled')}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Emergency Alerts</Text>
            <Switch
              value={notificationSettings.emergencyAlerts}
              onValueChange={() => handleToggleNotification('emergencyAlerts')}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {emergencyContacts.map(contact => (
            <View key={contact.id} style={styles.contactItem}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="call-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addContactButton}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addContactText}>Add Emergency Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  emailContainer: {
    marginTop: 4,
  },
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  email: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
  },
  emailEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  addContactText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsProfileScreen;