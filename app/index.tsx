import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function Launcher() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5E6', '#FFE4E1']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/thriving.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.header}>
            <Text style={styles.title}>Forkast</Text>
            <Text style={styles.subtitle}>Rate your campus food experience</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/admin/login')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Admin Portal</Text>
                <Text style={styles.buttonSubtext}>Manage ratings and view analytics</Text>
              </View>
              <View style={[styles.buttonAccent, styles.adminAccent]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/student/login')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Student Portal</Text>
                <Text style={styles.buttonSubtext}>Rate your meals and track your streak</Text>
              </View>
              <View style={[styles.buttonAccent, styles.studentAccent]} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logo: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#228B22', // Leafy green
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 25,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  buttonContent: {
    flex: 1,
    padding: 25,
    alignItems: 'center',
  },
  buttonAccent: {
    width: 5,
    height: '100%',
  },
  adminAccent: {
    backgroundColor: '#FF6347', // Tomato red
  },
  studentAccent: {
    backgroundColor: '#228B22', // Leafy green
  },
  buttonText: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});
