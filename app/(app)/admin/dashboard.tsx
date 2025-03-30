import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getWeeklyMealStats, addNextWeekMenu, getCurrentMenu, MenuItem } from '../../utils/database';

interface MealStats {
  name: string;
  averageRatings: {
    taste: number;
    portion: number;
    variety: number;
    overall: number;
  };
  totalRatings: number;
}

interface WeeklyStats {
  bestMeal: { name: string; rating: number };
  worstMeal: { name: string; rating: number };
}

const MEALS = [
  'Chicken Pot Pie',
  'Burger',
  'Cheese Pizza',
  'Salad',
  'Hot Dog'
];

export default function AdminDashboard() {
  const router = useRouter();
  const [mealStats, setMealStats] = useState<MealStats[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuItems, setMenuItems] = useState<string[]>(['', '', '', '', '']);
  const [currentMenu, setCurrentMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadStats();
    loadCurrentMenu();
  }, []);

  const loadCurrentMenu = async () => {
    try {
      const menu = await getCurrentMenu();
      setCurrentMenu(menu);
    } catch (error) {
      console.error('Error loading current menu:', error);
    }
  };

  const handleAddMenu = async () => {
    // Validate menu items
    const validItems = menuItems.filter(item => item.trim() !== '');
    if (validItems.length < 5) {
      Alert.alert('Error', 'Please add all 5 menu items');
      return;
    }

    try {
      await addNextWeekMenu(validItems);
      Alert.alert('Success', 'Next week\'s menu has been added');
      setShowMenuModal(false);
      setMenuItems(['', '', '', '', '']);
      loadCurrentMenu();
    } catch (error) {
      Alert.alert('Error', 'Failed to add menu items');
      console.error('Error adding menu:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Load weekly stats
      const weeklyData = await getWeeklyMealStats();
      setWeeklyStats(weeklyData);

      // Load individual meal stats (mock data for now)
      const mockStats = MEALS.map(meal => ({
        name: meal,
        averageRatings: {
          taste: Math.random() * 4 + 1,
          portion: Math.random() * 4 + 1,
          variety: Math.random() * 4 + 1,
          overall: Math.random() * 4 + 1,
        },
        totalRatings: Math.floor(Math.random() * 50) + 1,
      }));
      setMealStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const handleMealPress = (meal: string) => {
    router.push({
      pathname: '/admin/meal-feedback',
      params: { meal }
    });
  };

  const handleLogout = () => {
    router.replace('/');
  };

  const getAverageColor = (rating: number) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FFC107';
    return '#FF5252';
  };

  const formatRating = (rating: number) => rating.toFixed(1);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#FFF5E6', '#FFE4E1']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Menu Analytics</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Add Menu Button */}
        <TouchableOpacity 
          style={styles.addMenuButton} 
          onPress={() => setShowMenuModal(true)}
        >
          <LinearGradient
            colors={['#228B22', '#1a6b1a']}
            style={styles.addMenuButtonGradient}
          >
            <Ionicons name="restaurant-outline" size={24} color="white" />
            <Text style={styles.addMenuButtonText}>Add Next Week's Menu</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Weekly Stats Section */}
        <View style={styles.weeklyStatsContainer}>
          <Text style={styles.weeklyStatsTitle}>Weekly Highlights</Text>
          <View style={styles.weeklyStatsGrid}>
            <View style={[styles.weeklyStatCard, styles.bestMealCard]}>
              <Ionicons name="trophy-outline" size={24} color="#4CAF50" />
              <Text style={styles.weeklyStatLabel}>Best Rated</Text>
              <Text style={styles.weeklyStatValue}>{weeklyStats?.bestMeal.name}</Text>
              <Text style={styles.weeklyStatRating}>{formatRating(weeklyStats?.bestMeal.rating || 0)}</Text>
            </View>
            <View style={[styles.weeklyStatCard, styles.worstMealCard]}>
              <Ionicons name="alert-circle-outline" size={24} color="#FF5252" />
              <Text style={styles.weeklyStatLabel}>Needs Improvement</Text>
              <Text style={styles.weeklyStatValue}>{weeklyStats?.worstMeal.name}</Text>
              <Text style={styles.weeklyStatRating}>{formatRating(weeklyStats?.worstMeal.rating || 0)}</Text>
            </View>
          </View>
        </View>

        {/* Individual Meal Stats */}
        {mealStats.map((meal) => (
          <TouchableOpacity
            key={meal.name}
            style={styles.mealCard}
            onPress={() => handleMealPress(meal.name)}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.totalRatings}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.totalRatingsText}>
                    {meal.totalRatings} ratings
                  </Text>
                </View>
              </View>

              <View style={styles.ratingsGrid}>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Taste</Text>
                  <Text style={[styles.ratingValue, { color: getAverageColor(meal.averageRatings.taste) }]}>
                    {formatRating(meal.averageRatings.taste)}
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Portion</Text>
                  <Text style={[styles.ratingValue, { color: getAverageColor(meal.averageRatings.portion) }]}>
                    {formatRating(meal.averageRatings.portion)}
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Variety</Text>
                  <Text style={[styles.ratingValue, { color: getAverageColor(meal.averageRatings.variety) }]}>
                    {formatRating(meal.averageRatings.variety)}
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Overall</Text>
                  <Text style={[styles.ratingValue, { color: getAverageColor(meal.averageRatings.overall) }]}>
                    {formatRating(meal.averageRatings.overall)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Next Week's Menu</Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuInputs}>
              {menuItems.map((item, index) => (
                <TextInput
                  style={styles.menuInput}
                  placeholder={`Menu Item ${index + 1}`}
                  value={item}
                  onChangeText={(text) => {
                    const newItems = [...menuItems];
                    newItems[index] = text;
                    setMenuItems(newItems);
                  }}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.addMenuButton} onPress={handleAddMenu}>
              <Text style={styles.addMenuButtonText}>Add Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '500',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  weeklyStatsContainer: {
    marginBottom: 30,
  },
  weeklyStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  weeklyStatsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  weeklyStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bestMealCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  worstMealCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  weeklyStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  weeklyStatRating: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  mealCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mealName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRatings: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  totalRatingsText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  ratingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  ratingItem: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addMenuButton: {
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  addMenuButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addMenuButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuInputs: {
    gap: 10,
    marginBottom: 20,
  },
  menuInput: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
}); 