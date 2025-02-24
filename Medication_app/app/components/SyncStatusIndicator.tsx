// In app/components/SyncStatusIndicator.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import syncService from '../services/MedicationSyncService';

const SyncStatusIndicator = () => {
  const [lastSync, setLastSync] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Get initial sync status
    const updateSyncStatus = async () => {
      const timestamp = await syncService.getLastSyncTimestamp();
      setLastSync(timestamp);
    };
    
    updateSyncStatus();
    
    // Set up interval to check status
    const interval = setInterval(updateSyncStatus, 30000); // Check every 30 seconds
    
    // Set up network status listener
    const netInfoSubscription = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    
    return () => {
      clearInterval(interval);
      netInfoSubscription && netInfoSubscription();
    };
  }, []);

  const formatLastSync = () => {
    if (!lastSync) return 'Never synced';
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const diffMs = now - syncDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    return syncDate.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Ionicons 
        name={isOnline ? "cloud-done-outline" : "cloud-offline-outline"} 
        size={16} 
        color={isOnline ? "#4CAF50" : "#F44336"} 
      />
      <Text style={styles.text}>
        {isOnline ? `Last synced: ${formatLastSync()}` : 'Offline - Changes will sync when online'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  text: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
});

export default SyncStatusIndicator;