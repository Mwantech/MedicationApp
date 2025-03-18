import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, Text, Pressable, Image, Dimensions, Animated } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Words that will be animated/sliding
const slidingWords = [
  "Reliable",
  "Simple",
  "Effective",
  "Personalized",
  "Friendly"
];

const WelcomeScreen = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animation function to slide in words
  const animateNextWord = () => {
    // Reset position
    slideAnim.setValue(width);
    opacityAnim.setValue(0);
    
    // Animate the slide-in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
    
    // After displaying for a while, slide out
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Move to next word
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % slidingWords.length);
      });
    }, 2000); // Word display duration
  };

  // Start and manage the animation cycle
  useEffect(() => {
    const animationTimer = setTimeout(animateNextWord, 300);
    return () => clearTimeout(animationTimer);
  }, [currentWordIndex]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f7f9fe', '#e2eafc', '#d0e1ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Enhanced background decoration elements */}
      <View style={styles.decorationCircle1} />
      <View style={styles.decorationCircle2} />
      <View style={styles.decorationCircle3} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo container */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/pillpall_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title with modern typography */}
          <Text style={styles.title}>PillPal</Text>

          {/* Animated sliding words */}
          <View style={styles.slidingWordsContainer}>
            <Animated.Text 
              style={[
                styles.slidingWord,
                {
                  transform: [{ translateX: slideAnim }],
                  opacity: opacityAnim
                }
              ]}
            >
              {slidingWords[currentWordIndex]}
            </Animated.Text>
          </View>

          {/* Tagline with improved readability */}
          <Text style={styles.tagline}>
            Stay healthy and never miss a dose.{'\n'}Your personal medication companion.
          </Text>

          {/* Get Started Button - Updated with improved design and fixed border radius */}
          <Link href="/signup" asChild>
            <Pressable 
              style={({ pressed }) => [
                styles.getStartedButton,
                pressed && styles.buttonPressed
              ]}
            >
              <LinearGradient
                colors={['#5579ff', '#6448fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.getStartedGradient}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </LinearGradient>
            </Pressable>
          </Link>

          {/* Login Link with subtle hover effect */}
          <Link href="/login" asChild>
            <Pressable style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginBold}>Log In</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  decorationCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: -50,
    left: -50,
  },
  decorationCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    bottom: 50,
    right: -30,
  },
  decorationCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(85, 121, 255, 0.1)',
    top: 150,
    right: -20,
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    color: '#14142b',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  slidingWordsContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  slidingWord: {
    fontSize: 28,
    fontWeight: '500',
    color: '#5579ff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 18,
    color: '#4e4b66',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  getStartedButton: {
    width: '90%',
    borderRadius: 28, // Updated border radius for a more modern look
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#5579ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 28, // Matching border radius for the gradient
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginLink: {
    marginTop: 16,
    padding: 8,
  },
  loginText: {
    fontSize: 16,
    color: '#4e4b66',
  },
  loginBold: {
    fontWeight: '600',
    color: '#5579ff',
  },
});

export default WelcomeScreen;