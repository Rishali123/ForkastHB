import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { createUser } from '../../utils/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentSignup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword || !studentId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userId = await createUser({
        name,
        email,
        password,
        role: 'student',
        studentId,
      });
      Alert.alert('Success', 'Account created successfully!');
      router.push({
        pathname: '/student/dashboard',
        params: { userId }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF5E6', '#FFE4E1']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Image 
            source={require('../../../assets/images/thriving.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Student Signup</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Student ID"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="none"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.signupButton, loading && styles.disabledButton]} 
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.push('/student/login')}
          >
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#228B22',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  signupButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    color: '#FF6347',
    fontSize: 16,
    fontWeight: '500',
  },
}); 