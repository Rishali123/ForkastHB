import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getStudentRatingStreak, addFoodRating } from '../../utils/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function StudentDashboard() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [lastRatingDate, setLastRatingDate] = useState<string | null>(null);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate progress bar based on streak
    Animated.timing(progressAnim, {
      toValue: Math.min(streak / 5, 1), // Progress maxes out at 5 days
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [streak]);

  const loadRatingStatus = async () => {
    try {
      const { currentStreak, lastRatingDate } = await getStudentRatingStreak(Number(userId));
      setStreak(currentStreak);
      setLastRatingDate(lastRatingDate);
    } catch (error) {
      console.error('Error loading rating status:', error);
    }
  };

  // Load rating status when component mounts
  useEffect(() => {
    loadRatingStatus();
  }, []);

  // Reload rating status when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRatingStatus();
    }, [])
  );

  const getCircleColor = () => {
    if (streak === 0) return '#FF4444'; // Red for no ratings
    if (streak < 5) return '#FFBB33'; // Yellow for 1-4 days
    return '#00C851'; // Green for 5+ days
  };

  const getPlantImage = () => {
    if (streak === 0) return require('../../../assets/images/dead.png');
    if (streak < 5) return require('../../../assets/images/sprout.png');
    return require('../../../assets/images/thriving.png');
  };

  const handleRatePress = () => {
    router.push({
      pathname: '/student/rate-food',
      params: { userId }
    });
  };

  const handleLogout = () => {
    router.replace('/');
  };

  const getStatusMessage = () => {
    if (streak === 0) return "Let's start rating!";
    if (streak < 3) return "You're just getting started!";
    if (streak < 5) return "You're building momentum!";
    return "You're on fire! 🔥";
  };

  const getAchievementStatus = () => {
    if (streak === 0) return { title: 'Beginner', icon: 'leaf-outline' as const };
    if (streak < 3) return { title: 'Growing', icon: 'leaf' as const };
    if (streak < 5) return { title: 'Flourishing', icon: 'flower-outline' as const };
    return { title: 'Master Rater', icon: 'trophy' as const };
  };

  const handleHomeFoodPress = async () => {
    try {
      // Add a default rating for home food to maintain streak
      await addFoodRating({
        userId: Number(userId),
        tasteRating: 5,
        portionRating: 5,
        varietyRating: 5,
        overallRating: 5,
        comment: "Brought food from home",
        createdAt: new Date().toISOString()
      });
      // Reload the streak count
      loadRatingStatus();
    } catch (error) {
      console.error('Error recording home food:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF5E6', '#FFE4E1']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.statusBar}>
          <View style={styles.streakInfo}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.streakInfoText}>{streak} Day Streak</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>{getStatusMessage()}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={getPlantImage()}
            style={styles.plantImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.achievementCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Ionicons name={getAchievementStatus().icon} size={32} color={getCircleColor()} />
              <Text style={styles.cardTitle}>{getAchievementStatus().title}</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }),
                      backgroundColor: getCircleColor()
                    }
                  ]} 
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Day {streak}</Text>
                <Text style={styles.progressText}>5 Days</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.rateButton}
          onPress={handleRatePress}
        >
          <LinearGradient
            colors={['#2E8B57', '#228B22']}
            style={styles.buttonGradient}
          >
            <Text style={styles.rateButtonText}>Rate your meal</Text>
            <Ionicons name="star" size={24} color="#fff" style={styles.buttonIcon} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeFoodButton}
          onPress={handleHomeFoodPress}
        >
          <Ionicons name="home-outline" size={16} color="#666" style={styles.homeFoodIcon} />
          <Text style={styles.homeFoodText}>I brought food from home!</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  streakInfoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    marginLeft: 5,
    color: '#666',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  plantImage: {
    width: '100%',
    height: 300,
    marginBottom: 30,
  },
  achievementCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  cardGradient: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
    alignItems: 'center',
  },
  rateButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
    paddingVertical: 15,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  homeFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  homeFoodIcon: {
    marginRight: 6,
  },
  homeFoodText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
}); 