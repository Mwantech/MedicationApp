import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Camera, CameraType, BarcodeScanningResult } from 'expo-camera';

interface MedicationInfo {
  brandName: string;
  genericName: string;
  manufacturer: string;
  productNdc: string;
}

const BarcodeScanner: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } else {
        setHasPermission(false); // Camera not supported on web
      }
    })();
  }, []);

  const fetchMedicationInfo = async (barcode: string): Promise<MedicationInfo> => {
    const response = await fetch(
      `https://api.fda.gov/drug/ndc.json?search=product_ndc:"${barcode}"&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Medication not found');
    }

    const data = await response.json();
    const result = data.results[0];

    return {
      brandName: result.brand_name,
      genericName: result.generic_name,
      manufacturer: result.labeler_name,
      productNdc: result.product_ndc,
    };
  };

  const handleBarCodeScanned = async (scanResult: BarcodeScanningResult) => {
    const { type, data } = scanResult;
    setScanned(true);
    setLoading(true);
    setError(null);

    try {
      console.log("Scanned barcode:", data);
      const medInfo = await fetchMedicationInfo(data);
      setMedicationInfo(medInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medication info');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setMedicationInfo(null);
    setError(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        {Platform.OS !== 'web' && (
          <TouchableOpacity style={styles.button} onPress={() => Camera.requestCameraPermissionsAsync()}>
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <Camera
          style={[styles.scanner, StyleSheet.absoluteFillObject]}
          type={CameraType.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeTypes={['qr', 'code39', 'code128', 'ean13', 'upc_e']}
        />
      ) : (
        <Text style={styles.errorText}>Camera not supported on web</Text>
      )}
      
      {/* Overlay - separate layer on top of scanner */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Fetching medication info...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {medicationInfo && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Medication Information</Text>
          <Text style={styles.resultText}>Brand: {medicationInfo.brandName}</Text>
          <Text style={styles.resultText}>Generic: {medicationInfo.genericName}</Text>
          <Text style={styles.resultText}>Manufacturer: {medicationInfo.manufacturer}</Text>
          <Text style={styles.resultText}>NDC: {medicationInfo.productNdc}</Text>
          <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default BarcodeScanner;