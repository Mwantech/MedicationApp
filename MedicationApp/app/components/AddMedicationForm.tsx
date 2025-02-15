import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView, 
  Keyboard, 
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddMedicationForm = ({ onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter the medication name');
      return;
    }

    onSubmit({
      name: name.trim(),
      dosage: dosage.trim(),
      instructions: instructions.trim(),
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    });

    // Reset form
    setName('');
    setDosage('');
    setInstructions('');
    setTime(new Date());
  };

  const InputField = ({ label, value, onChangeText, placeholder, multiline, style }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input, 
            activeInput === label && styles.inputActive,
            multiline && styles.multilineInput,
            style
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          onFocus={() => setActiveInput(label)}
          onBlur={() => setActiveInput(null)}
          placeholderTextColor="#9EA0A4"
        />
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Medication</Text>
              <Text style={styles.subtitle}>Enter your medication details below</Text>
            </View>

            <InputField
              label="Medication Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter medication name"
            />

            <InputField
              label="Dosage"
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 500mg"
            />

            <InputField
              label="Instructions"
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g., Take with food"
              multiline
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reminder Time</Text>
              <TouchableOpacity 
                style={[styles.timeButton, styles.inputWrapper]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.submitButton]} 
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Save Medication</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputActive: {
    borderColor: '#6C63FF',
    borderWidth: 2,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeButton: {
    padding: 16,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    elevation: 2,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666666',
  },
});

export default AddMedicationForm;