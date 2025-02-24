import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Configuration - Replace with your API endpoint
const API_CONFIG = {
  BASE_URL: 'https://your-api-endpoint.com/api',
  ENDPOINTS: {
    SYNC_MEDICATIONS: '/medications/sync',
    SYNC_ACTIVITIES: '/medication-activities/sync'
  },
  HEADERS: {
    'Content-Type': 'application/json',
    // Add any authentication headers as needed
  }
};

// Keys for tracking sync status
const STORAGE_KEYS = {
  LAST_SYNC_TIMESTAMP: 'lastMedicationSyncTimestamp',
  PENDING_SYNC_MEDICATIONS: 'pendingSyncMedications',
  PENDING_SYNC_ACTIVITIES: 'pendingSyncActivities',
};

// Configure retry options
const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  RETRY_DELAY_MS: 5000,
};

class MedicationSyncService {
  constructor() {
    this._isInitialized = false;
    this._isOnline = false;
    this._syncInProgress = false;
    this._networkSubscription = null;
  }

  /**
   * Initialize the sync service and start monitoring network status
   */
  async initialize() {
    if (this._isInitialized) return;
    
    // Set up network status monitoring
    this._networkSubscription = NetInfo.addEventListener(state => {
      const wasOffline = !this._isOnline;
      this._isOnline = state.isConnected && state.isInternetReachable;
      
      // If we just came online, try to sync pending data
      if (wasOffline && this._isOnline) {
        this.syncPendingData();
      }
    });
    
    // Get initial network state
    const netInfo = await NetInfo.fetch();
    this._isOnline = netInfo.isConnected && netInfo.isInternetReachable;
    
    this._isInitialized = true;
    
    // Attempt initial sync if online
    if (this._isOnline) {
      this.syncPendingData();
    }
  }

  /**
   * Clean up resources when service is no longer needed
   */
  cleanup() {
    if (this._networkSubscription) {
      this._networkSubscription();
      this._networkSubscription = null;
    }
    this._isInitialized = false;
  }

  /**
   * Queue medication data for synchronization
   * @param {Object} medication - The medication data to sync
   * @param {String} operation - The operation type: 'create', 'update', or 'delete'
   */
  async queueMedicationSync(medication, operation = 'update') {
    try {
      // Get current pending sync items
      const pendingSyncString = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_MEDICATIONS) || '[]';
      const pendingSync = JSON.parse(pendingSyncString);
      
      // Check if this medication already has a pending sync
      const existingIndex = pendingSync.findIndex(item => item.data.id === medication.id);
      
      // If there's an existing item for this medication, remove it (we'll replace it)
      if (existingIndex >= 0) {
        pendingSync.splice(existingIndex, 1);
      }
      
      // Add the new pending sync item
      pendingSync.push({
        data: medication,
        operation,
        timestamp: new Date().toISOString(),
        syncAttempts: 0,
      });
      
      // Save back to storage
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_MEDICATIONS, JSON.stringify(pendingSync));
      
      // Attempt to sync if we're online
      if (this._isOnline) {
        this.syncPendingData();
      }
    } catch (error) {
      console.error('Error queueing medication sync:', error);
    }
  }

  /**
   * Queue medication activity data for synchronization
   * @param {Object} activity - The medication activity data to sync
   */
  async queueActivitySync(activity) {
    try {
      // Get current pending sync items
      const pendingSyncString = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES) || '[]';
      const pendingSync = JSON.parse(pendingSyncString);
      
      // Check if this activity already has a pending sync
      const existingIndex = pendingSync.findIndex(item => item.data.id === activity.id);
      
      // If there's an existing item for this activity, remove it (we'll replace it)
      if (existingIndex >= 0) {
        pendingSync.splice(existingIndex, 1);
      }
      
      // Add the new pending sync item
      pendingSync.push({
        data: activity,
        operation: 'create', // Activities are typically only created, not updated/deleted
        timestamp: new Date().toISOString(),
        syncAttempts: 0,
      });
      
      // Save back to storage
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES, JSON.stringify(pendingSync));
      
      // Attempt to sync if we're online
      if (this._isOnline) {
        this.syncPendingData();
      }
    } catch (error) {
      console.error('Error queueing activity sync:', error);
    }
  }

  /**
   * Sync all pending data to the backend
   */
  async syncPendingData() {
    if (!this._isOnline || this._syncInProgress) return;
    
    try {
      this._syncInProgress = true;
      
      // Sync medications
      await this._syncMedications();
      
      // Sync activities
      await this._syncActivities();
      
      // Update last sync timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, new Date().toISOString());
    } catch (error) {
      console.error('Error during data sync:', error);
    } finally {
      this._syncInProgress = false;
    }
  }

  /**
   * Perform a full sync of all data (helpful for initial setup or recovery)
   */
  async performFullSync() {
    try {
      // Fetch all medications
      const medicationsString = await AsyncStorage.getItem('medications') || '[]';
      const medications = JSON.parse(medicationsString);
      
      // Fetch all activities
      const activitiesString = await AsyncStorage.getItem('medicationActivities') || '[]';
      const activities = JSON.parse(activitiesString);
      
      // Get user data for context
      const userDataString = await AsyncStorage.getItem('userData') || '{}';
      const userData = JSON.parse(userDataString);
      
      // Prepare package for server
      const syncPackage = {
        userId: userData.id || 'anonymous',
        deviceId: await this._getDeviceId(),
        timestamp: new Date().toISOString(),
        medications,
        activities
      };
      
      // Only proceed if we're online
      if (!this._isOnline) {
        console.log('Cannot perform full sync: device is offline');
        return false;
      }
      
      // Send to server
      const response = await fetch(`${API_CONFIG.BASE_URL}/backup/full`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(syncPackage)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      // Update last sync timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, new Date().toISOString());
      
      // Clear any pending syncs since we've just synced everything
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_MEDICATIONS, '[]');
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES, '[]');
      
      return true;
    } catch (error) {
      console.error('Error during full sync:', error);
      return false;
    }
  }

  /**
   * Restore data from the most recent backup on the server
   */
  async restoreFromBackup() {
    try {
      // Only proceed if we're online
      if (!this._isOnline) {
        console.log('Cannot restore from backup: device is offline');
        return {
          success: false,
          message: 'Device is offline'
        };
      }
      
      // Get user data for authentication
      const userDataString = await AsyncStorage.getItem('userData') || '{}';
      const userData = JSON.parse(userDataString);
      
      // Request backup from server
      const response = await fetch(`${API_CONFIG.BASE_URL}/backup/restore`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          userId: userData.id || 'anonymous',
          deviceId: await this._getDeviceId(),
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const backupData = await response.json();
      
      // Only restore if we got valid data
      if (!backupData.medications || !backupData.activities) {
        return {
          success: false,
          message: 'Invalid backup data received'
        };
      }
      
      // Store restored data
      await AsyncStorage.setItem('medications', JSON.stringify(backupData.medications));
      await AsyncStorage.setItem('medicationActivities', JSON.stringify(backupData.activities));
      
      // Update last sync timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, new Date().toISOString());
      
      return {
        success: true,
        message: 'Backup restored successfully',
        data: {
          medicationsCount: backupData.medications.length,
          activitiesCount: backupData.activities.length
        }
      };
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Sync pending medication data to the server
   * @private
   */
  async _syncMedications() {
    // Get pending medication syncs
    const pendingSyncString = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_MEDICATIONS) || '[]';
    let pendingSync = JSON.parse(pendingSyncString);
    
    if (pendingSync.length === 0) return;
    
    // Process each pending item
    const successfulSyncs = [];
    
    for (let i = 0; i < pendingSync.length; i++) {
      const syncItem = pendingSync[i];
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYNC_MEDICATIONS}`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({
            operation: syncItem.operation,
            data: syncItem.data
          })
        });
        
        if (response.ok) {
          // If successful, mark for removal
          successfulSyncs.push(syncItem);
        } else {
          // If failed, increment attempt counter
          syncItem.syncAttempts += 1;
          
          // If max attempts reached, mark for removal
          if (syncItem.syncAttempts >= RETRY_CONFIG.MAX_ATTEMPTS) {
            successfulSyncs.push(syncItem);
          }
        }
      } catch (error) {
        console.error('Error syncing medication:', error);
        // Increment attempt counter
        syncItem.syncAttempts += 1;
        
        // If max attempts reached, mark for removal
        if (syncItem.syncAttempts >= RETRY_CONFIG.MAX_ATTEMPTS) {
          successfulSyncs.push(syncItem);
        }
      }
    }
    
    // Remove successful or max-attempted syncs
    pendingSync = pendingSync.filter(item => !successfulSyncs.includes(item));
    
    // Save updated pending syncs
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_MEDICATIONS, JSON.stringify(pendingSync));
  }

  /**
   * Sync pending activity data to the server
   * @private
   */
  async _syncActivities() {
    // Get pending activity syncs
    const pendingSyncString = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES) || '[]';
    let pendingSync = JSON.parse(pendingSyncString);
    
    if (pendingSync.length === 0) return;
    
    // Process each pending item
    const successfulSyncs = [];
    
    for (let i = 0; i < pendingSync.length; i++) {
      const syncItem = pendingSync[i];
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYNC_ACTIVITIES}`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({
            operation: syncItem.operation,
            data: syncItem.data
          })
        });
        
        if (response.ok) {
          // If successful, mark for removal
          successfulSyncs.push(syncItem);
        } else {
          // If failed, increment attempt counter
          syncItem.syncAttempts += 1;
          
          // If max attempts reached, mark for removal
          if (syncItem.syncAttempts >= RETRY_CONFIG.MAX_ATTEMPTS) {
            successfulSyncs.push(syncItem);
          }
        }
      } catch (error) {
        console.error('Error syncing activity:', error);
        // Increment attempt counter
        syncItem.syncAttempts += 1;
        
        // If max attempts reached, mark for removal
        if (syncItem.syncAttempts >= RETRY_CONFIG.MAX_ATTEMPTS) {
          successfulSyncs.push(syncItem);
        }
      }
    }
    
    // Remove successful or max-attempted syncs
    pendingSync = pendingSync.filter(item => !successfulSyncs.includes(item));
    
    // Save updated pending syncs
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES, JSON.stringify(pendingSync));
  }

  /**
   * Get or generate a unique device identifier
   * @private
   */
  async _getDeviceId() {
    try {
      // Try to retrieve existing device ID
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      if (deviceId) {
        return deviceId;
      }
      
      // Generate a new device ID if one doesn't exist
      const newDeviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('deviceId', newDeviceId);
      
      return newDeviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Return a temporary ID if storage fails
      return 'temp_' + Date.now();
    }
  }

  /**
   * Get the last successful sync timestamp
   */
  async getLastSyncTimestamp() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP);
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  }
}

// Export as singleton
const syncService = new MedicationSyncService();
export default syncService;