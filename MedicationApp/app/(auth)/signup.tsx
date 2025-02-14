import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SignUpScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f7f9fe', '#ebf1fd', '#e2eafc']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#555" />
              </TouchableOpacity>
            </Link>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start tracking your medications today</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={22} color="#6e7191" style={styles.inputIcon} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#a0a3bd"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#6e7191" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#a0a3bd"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#6e7191" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.input}
                placeholderTextColor="#a0a3bd"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#6e7191" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#6e7191" style={styles.inputIcon} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                placeholderTextColor="#a0a3bd"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#6e7191" 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By signing up, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>

            <Pressable 
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed
              ]}
            >
              <LinearGradient
                colors={['#6448fe', '#5579ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.loginLink}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginBold}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14142b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6e7191',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#14142b',
    paddingVertical: 16,
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#6e7191',
    marginBottom: 32,
    lineHeight: 20,
  },
  linkText: {
    color: '#5579ff',
    fontWeight: '500',
  },
  signupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6448fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  loginLink: {
    padding: 12,
  },
  loginText: {
    fontSize: 16,
    color: '#6e7191',
  },
  loginBold: {
    color: '#5579ff',
    fontWeight: '600',
  },
});

export default SignUpScreen;