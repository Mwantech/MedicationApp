import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PharmacyFinderScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Sample Kenyan pharmacy data
  const pharmacies = [
    {
      id: 1,
      name: "Goodlife Pharmacy",
      address: "The Junction Mall, Ngong Road, Nairobi",
      distance: "0.5 km",
      phone: "0709 557 700",
      hours: "Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-8PM",
      accepting: true,
      insurances: ["NHIF", "AAR", "Jubilee", "Britam"]
    },
    {
      id: 2,
      name: "Haltons Pharmacy",
      address: "Sarit Centre, Westlands, Nairobi",
      distance: "1.2 km",
      phone: "0709 256 000",
      hours: "Mon-Sat: 8AM-8PM, Sun: 10AM-6PM",
      accepting: true,
      insurances: ["NHIF", "Madison", "Jubilee", "UAP"]
    },
    {
      id: 3,
      name: "Naivas Pharmacy",
      address: "Capital Centre, Mombasa Road, Nairobi",
      distance: "2.4 km",
      phone: "0721 453 789",
      hours: "Mon-Sun: 8AM-9PM",
      accepting: true,
      insurances: ["NHIF", "AAR", "Resolution"]
    },
    {
      id: 4,
      name: "MediPlus Pharmacy",
      address: "Yaya Centre, Argwings Kodhek Road, Nairobi",
      distance: "3.2 km",
      phone: "0788 123 456",
      hours: "Open 24 hours",
      accepting: true,
      insurances: ["NHIF", "Britam", "UAP", "CIC"]
    },
    {
      id: 5,
      name: "Highlands Pharmacy",
      address: "Kenyatta Avenue, CBD, Nairobi",
      distance: "4.1 km",
      phone: "0722 987 654",
      hours: "Mon-Fri: 7AM-9PM, Sat: 8AM-7PM, Sun: 9AM-5PM",
      accepting: false,
      insurances: ["NHIF", "AAR", "Jubilee"]
    }
  ];

  // Filter pharmacies based on search query
  const filteredPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle expanded pharmacy details
  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Render individual pharmacy item
  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <View style={styles.pharmacyCard}>
        <View style={styles.pharmacyHeader}>
          <View>
            <Text style={styles.pharmacyName}>{item.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#fff" />
              <Text style={styles.infoText}>{item.address} ({item.distance})</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#fff" />
              <Text style={styles.infoText}>{item.phone}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => toggleExpand(item.id)}
            style={styles.expandButton}
          >
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.badgeContainer}>
          <View style={[
            styles.statusBadge, 
            item.accepting ? styles.acceptingBadge : styles.notAcceptingBadge
          ]}>
            <Text style={item.accepting ? styles.acceptingText : styles.notAcceptingText}>
              {item.accepting ? 'Accepting new patients' : 'Not accepting new patients'}
            </Text>
          </View>
        </View>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailSection}>
              <Ionicons name="time-outline" size={16} color="#fff" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Hours:</Text>
                <Text style={styles.detailText}>{item.hours}</Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Accepted Insurance:</Text>
            </View>
            
            <View style={styles.insuranceContainer}>
              {item.insurances.map((insurance, index) => (
                <View key={index} style={styles.insuranceBadge}>
                  <Text style={styles.insuranceText}>{insurance}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0056b3" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Nearby Pharmacies</Text>
        <Text style={styles.headerSubtext}>Find dawa points near you</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#0056b3" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#78a3cb"
        />
      </View>
      
      <FlatList
        data={filteredPharmacies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pharmacies found matching your search.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  header: {
    backgroundColor: '#007bff', // Changed from #0072c6 to #007bff
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 16,
    color: '#e6f0ff',
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    marginHorizontal: 16,
    marginTop: -25,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#007bff', // Changed from #0056b3 to #007bff
  },
  listContainer: {
    padding: 16,
    paddingTop: 32,
  },
  pharmacyCard: {
    backgroundColor: '#007bff', // Changed from #0072c6 to #007bff
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#e6f0ff',
    marginLeft: 8,
  },
  expandButton: {
    padding: 4,
  },
  badgeContainer: {
    marginTop: 12,
    flexDirection: 'row',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  acceptingBadge: {
    backgroundColor: '#e6fff2',
  },
  notAcceptingBadge: {
    backgroundColor: '#fff2e6',
  },
  acceptingText: {
    color: '#006644',
    fontSize: 13,
    fontWeight: '500',
  },
  notAcceptingText: {
    color: '#cc5500',
    fontSize: 13,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#4a95ff', // Changed from #3389d4 to a lighter shade of #007bff
  },
  detailSection: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: 'white',
  },
  detailText: {
    fontSize: 14,
    color: '#e6f0ff',
  },
  insuranceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  insuranceBadge: {
    backgroundColor: '#e6f0ff',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  insuranceText: {
    color: '#007bff', // Changed from #0056b3 to #007bff
    fontSize: 13,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#007bff', // Changed from #0072c6 to #007bff
    padding: 24,
    fontSize: 16,
  },
});

export default PharmacyFinderScreen;