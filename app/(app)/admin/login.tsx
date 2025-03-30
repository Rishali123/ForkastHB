import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { validateLogin } from '../../utils/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await validateLogin(email, password);
      if (user && user.role === 'admin') {
        router.push('/(app)/admin/dashboard');
      } else {
        Alert.alert('Error', 'Invalid credentials or not an admin account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
      console.error('Login error:', error);
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
          <Text style={styles.title}>Admin Login</Text>
          
          <View style={styles.inputContainer}>
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
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signupLink}
            onPress={() => router.push('/admin/signup')}
          >
            <Text style={styles.signupText}>Don't have an account? Sign up</Text>
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
    color: '#FF6347',
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
    borderColor: '#FF6347',
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
  loginButton: {
    backgroundColor: '#FF6347',
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
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    color: '#228B22',
    fontSize: 16,
    fontWeight: '500',
  },
}); 