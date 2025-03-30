import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackItem {
  id: number;
  date: string;
  ratings: {
    taste: number;
    portion: number;
    variety: number;
    overall: number;
  };
  comment: string;
}

export default function MealFeedback() {
  const { meal } = useLocalSearchParams();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      // TODO: Replace with actual database query
      // For now, using mock data
      const mockFeedback = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        ratings: {
          taste: Math.floor(Math.random() * 5) + 1,
          portion: Math.floor(Math.random() * 5) + 1,
          variety: Math.floor(Math.random() * 5) + 1,
          overall: Math.floor(Math.random() * 5) + 1,
        },
        comment: "Student feedback comment here...",
      }));
      setFeedback(mockFeedback);
      setLoading(false);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Ionicons
            key={index}
            name={index < rating ? 'star' : 'star-outline'}
            size={16}
            color={index < rating ? '#FFD700' : '#ddd'}
          />
        ))}
      </View>
    );
  };

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
        <Text style={styles.title}>{meal}</Text>
        <Text style={styles.subtitle}>Student Feedback</Text>
      </View>

      <ScrollView style={styles.content}>
        {feedback.map((item) => (
          <View key={item.id} style={styles.feedbackCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.cardGradient}
            >
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.ratingsContainer}>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Taste</Text>
                  {renderStars(item.ratings.taste)}
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Portion</Text>
                  {renderStars(item.ratings.portion)}
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Variety</Text>
                  {renderStars(item.ratings.variety)}
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Overall</Text>
                  {renderStars(item.ratings.overall)}
                </View>
              </View>

              {item.comment && (
                <View style={styles.commentContainer}>
                  <Text style={styles.commentLabel}>Comment:</Text>
                  <Text style={styles.commentText}>{item.comment}</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  feedbackCard: {
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  ratingsContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  commentContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: 10,
  },
  commentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
}); 