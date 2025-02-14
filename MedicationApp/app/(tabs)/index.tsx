import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.container}>
      <Image source={require('@/assets/images/react-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to MediTrack</Text>
      <Text style={styles.subtitle}>Stay on top of your medication effortlessly</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#2575fc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default WelcomeScreen;
