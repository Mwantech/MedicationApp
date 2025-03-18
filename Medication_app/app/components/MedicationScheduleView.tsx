import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Replace date-fns with manual date handling
// This avoids the startOfQuarter.js error
const getDayName = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const getMonthName = (date: Date): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()];
};

const formatDate = (date: Date): string => {
  return `${getMonthName(date)} ${date.getDate()}, ${date.getFullYear()}`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
};

const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

// Define the Medication type to match what comes from AddMedicationForm
interface Medication {
  name: string;
  dosage: string;
  instructions: string;
  time: string;
  id?: string; // Optional ID for uniqueness
}

// Props interface
interface MedicationScheduleScreenProps {
  medications: Medication[];
}

const MedicationScheduleScreen: React.FC<MedicationScheduleScreenProps> = ({ medications }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates, setDates] = useState<Date[]>([]);
  const [medicationsForSelectedDay, setMedicationsForSelectedDay] = useState<Medication[]>([]);
  
  // Generate 7 days for the date picker
  useEffect(() => {
    const dateArray: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      dateArray.push(addDays(new Date(), i));
    }
    setDates(dateArray);
  }, []);

  // Filter and sort medications for the selected day
  useEffect(() => {
    if (medications && medications.length > 0) {
      // In a real app with persistent storage, you'd filter by date as well
      // For now, we'll just sort them by time for the selected date
      const sortedMeds = [...medications].sort((a, b) => {
        const timeA = a.time.split(':');
        const timeB = b.time.split(':');
        
        const hourA = parseInt(timeA[0]);
        const hourB = parseInt(timeB[0]);
        
        if (hourA !== hourB) return hourA - hourB;
        
        const minuteA = parseInt(timeA[1]);
        const minuteB = parseInt(timeB[1]);
        
        return minuteA - minuteB;
      });
      
      setMedicationsForSelectedDay(sortedMeds);
    } else {
      setMedicationsForSelectedDay([]);
    }
  }, [selectedDate, medications]);

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(item, selectedDate);
    const isToday = isSameDay(item, new Date());
    
    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          isSelected && styles.selectedDateItem
        ]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[
          styles.dayName,
          isSelected && styles.selectedDateText
        ]}>
          {getDayName(item)}
        </Text>
        <Text style={[
          styles.dayNumber,
          isSelected && styles.selectedDateText,
          isToday && styles.todayText
        ]}>
          {item.getDate()}
        </Text>
        {isToday && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  };

  // Group medications by hour
  const getMedicationsByHour = () => {
    const medsByHour: Record<number, Medication[]> = {};
    
    medicationsForSelectedDay.forEach(med => {
      const hour = parseInt(med.time.split(':')[0]);
      
      if (!medsByHour[hour]) {
        medsByHour[hour] = [];
      }
      
      medsByHour[hour].push(med);
    });
    
    return medsByHour;
  };

  const renderTimeSlot = (hour: number) => {
    const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const medsByHour = getMedicationsByHour();
    const medsAtThisHour = medsByHour[hour] || [];

    return (
      <View key={hour} style={styles.timeSlot}>
        <View style={styles.timeIndicator}>
          <Text style={styles.timeText}>{formattedHour}</Text>
          <View style={styles.timeDot} />
          <View style={styles.timeLine} />
        </View>
        
        <View style={styles.medicationsContainer}>
          {medsAtThisHour.length > 0 ? (
            medsAtThisHour.map((med, index) => (
              <View key={`${med.name}-${index}`} style={styles.medicationCard}>
                <View style={styles.medicationIconContainer}>
                  <Ionicons name="medical" size={18} color="#ff6b6b" />
                </View>
                <View style={styles.medicationDetails}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  {med.dosage ? (
                    <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  ) : null}
                  <Text style={styles.medicationTime}>{med.time}</Text>
                  {med.instructions ? (
                    <Text style={styles.medicationInstructions}>
                      {med.instructions}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>No medications scheduled</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Create time slots from 6 AM to 10 PM (adjust as needed)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medication Schedule</Text>
          <Text style={styles.headerDate}>
            {formatDate(selectedDate)}
          </Text>
        </View>
        
        <View style={styles.calendarStrip}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dates}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderDateItem}
            contentContainerStyle={styles.dateList}
          />
        </View>
        
        <ScrollView style={styles.schedule}>
          {timeSlots.map(hour => renderTimeSlot(hour))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    // Add padding to top to move header down
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  calendarStrip: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateList: {
    paddingHorizontal: 10,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f5',
    paddingVertical: 8,
  },
  selectedDateItem: {
    backgroundColor: '#6200ee',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayText: {
    color: '#6200ee',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6200ee',
    marginTop: 4,
  },
  schedule: {
    flex: 1,
    paddingTop: 10,
  },
  timeSlot: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  timeIndicator: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#777',
    marginBottom: 5,
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
  },
  timeLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 5,
  },
  medicationsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  medicationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  medicationIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  medicationTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6200ee',
    marginBottom: 2,
  },
  medicationInstructions: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#777',
  },
  emptySlot: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptySlotText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default MedicationScheduleScreen;