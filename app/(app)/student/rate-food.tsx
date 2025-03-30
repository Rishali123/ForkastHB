import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Alert, ScrollView, Animated, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addFoodRating } from '../../utils/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface RatingCategory {
  name: string;
  key: 'tasteRating' | 'portionRating' | 'varietyRating' | 'overallRating';
  icon: 'restaurant' | 'resize' | 'grid' | 'star';
  description: string;
}

const foodOptions = [
  'Chicken Pot Pie',
  'Burger',
  'Cheese Pizza',
  'Salad',
  'Hot Dog'
];

const categories: RatingCategory[] = [
  { 
    name: 'Taste', 
    key: 'tasteRating',
    icon: 'restaurant',
    description: 'How delicious was your meal?'
  },
  { 
    name: 'Portion Size', 
    key: 'portionRating',
    icon: 'resize',
    description: 'Was the portion size appropriate?'
  },
  { 
    name: 'Variety', 
    key: 'varietyRating',
    icon: 'grid',
    description: 'How diverse were the food options?'
  },
  { 
    name: 'Overall', 
    key: 'overallRating',
    icon: 'star',
    description: 'Your overall satisfaction'
  },
];

export default function RateFood() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [ratings, setRatings] = useState({
    tasteRating: 0,
    portionRating: 0,
    varietyRating: 0,
    overallRating: 0,
  });
  const [selectedFood, setSelectedFood] = useState('');
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [comment, setComment] = useState('');
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRatingChange = (category: RatingCategory, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category.key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedFood) {
      Alert.alert('Missing Food Selection', 'Please select what you ate today.');
      return;
    }

    const unratedCategories = categories.filter(cat => ratings[cat.key] === 0);
    if (unratedCategories.length > 0) {
      Alert.alert(
        'Missing Ratings',
        `Please rate the following:\n${unratedCategories.map(cat => cat.name).join('\n')}`
      );
      return;
    }

    try {
      await addFoodRating({
        userId: Number(userId),
        ...ratings,
        comment: `${selectedFood}\n${comment}`,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Thank you for your feedback! 🎉');
      router.back();
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const RatingCategory = ({ category, index }: { category: RatingCategory; index: number }) => {
    const slideAnim = Animated.multiply(animation, 1).interpolate({
      inputRange: [0, 1],
      outputRange: [50 * (index + 1), 0],
    });

    return (
      <Animated.View 
        style={[
          styles.categoryContainer,
          {
            opacity: animation,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryHeader}>
            <Ionicons name={category.icon} size={24} color="#2E8B57" />
            <Text style={styles.categoryTitle}>{category.name}</Text>
          </View>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={[styles.star]}
                onPress={() => handleRatingChange(category, star)}
              >
                <Ionicons
                  name={star <= ratings[category.key] ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= ratings[category.key] ? '#FFD700' : '#ddd'}
                  style={[
                    star <= ratings[category.key] && styles.starSelected
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#FFF5E6', '#FFE4E1']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Rate Your Meal</Text>
        <Text style={styles.subtitle}>Help us improve your dining experience!</Text>

        <TouchableOpacity
          style={styles.foodSelector}
          onPress={() => setShowFoodPicker(true)}
        >
          <View style={styles.foodSelectorContent}>
            <Ionicons name="restaurant-outline" size={24} color="#2E8B57" />
            <Text style={styles.foodSelectorText}>
              {selectedFood || "What did you eat today?"}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
        
        <Modal
          visible={showFoodPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFoodPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFoodPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Your Meal</Text>
                <TouchableOpacity onPress={() => setShowFoodPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {foodOptions.map((food) => (
                <TouchableOpacity
                  key={food}
                  style={[
                    styles.foodOption,
                    selectedFood === food && styles.foodOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedFood(food);
                    setShowFoodPicker(false);
                  }}
                >
                  <Text style={[
                    styles.foodOptionText,
                    selectedFood === food && styles.foodOptionTextSelected
                  ]}>
                    {food}
                  </Text>
                  {selectedFood === food && (
                    <Ionicons name="checkmark" size={24} color="#2E8B57" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {categories.map((category, index) => (
          <>
            <RatingCategory category={category} index={index} />
          </>
        ))}

        <View style={styles.commentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Share your thoughts (optional)"
            placeholderTextColor="#666"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={['#2E8B57', '#228B22']}
            style={styles.submitGradient}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
            <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.submitIcon} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  categoryContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryGradient: {
    padding: 20,
    borderRadius: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  star: {
    padding: 5,
  },
  starSelected: {
    transform: [{ scale: 1.2 }],
  },
  commentContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButton: {
    marginBottom: 30,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  submitIcon: {
    marginLeft: 5,
  },
  foodSelector: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  foodSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodSelectorText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 10,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  foodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodOptionSelected: {
    backgroundColor: 'rgba(46,139,87,0.1)',
  },
  foodOptionText: {
    fontSize: 16,
    color: '#444',
  },
  foodOptionTextSelected: {
    color: '#2E8B57',
    fontWeight: '600',
  },
}); 