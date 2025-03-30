import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUser, getUserByEmail } from '../utils/database';

export default function AdminSignup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Check if email already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert('Error', 'Email already registered');
        return;
      }

      // Create new admin user
      await createUser({
        name,
        email,
        password,
        role: 'admin'
      });

      Alert.alert('Success', 'Account created successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/admin/login')
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'An error occurred during signup');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Admin Signup</Text>
        
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
          onPress={() => router.push('/admin/login')}
        >
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF5E6', // Beige background
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6347', // Tomato red
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 15,
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6347', // Tomato red border
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#FF6347', // Tomato red
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
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
    color: '#228B22', // Leafy green
    fontSize: 16,
  },
}); 