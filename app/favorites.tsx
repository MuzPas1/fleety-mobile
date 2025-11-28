import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useFavoritesStore } from '../store/favoritesStore';
import api from '../services/api';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteRestaurants, favoriteDishes, loadFavorites, toggleRestaurantFavorite, toggleDishFavorite } = useFavoritesStore();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');

  useEffect(() => {
    loadFavorites();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all restaurants
      const restaurantsResponse = await api.get('/restaurants');
      setRestaurants(restaurantsResponse.data);

      // Fetch all menus from all restaurants
      const allDishes: any[] = [];
      for (const restaurant of restaurantsResponse.data) {
        try {
          const menuResponse = await api.get(`/restaurants/${restaurant._id}/menu`);
          const dishesWithRestaurant = menuResponse.data.map((dish: any) => ({
            ...dish,
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
          }));
          allDishes.push(...dishesWithRestaurant);
        } catch (error) {
          console.error(`Error fetching menu for ${restaurant._id}:`, error);
        }
      }
      setDishes(allDishes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const favoriteRestaurantsList = restaurants.filter((r) =>
    favoriteRestaurants.has(r._id)
  );

  const favoriteDishiesList = dishes.filter((d) =>
    favoriteDishes.has(d._id)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restaurants' && styles.tabActive]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text style={[styles.tabText, activeTab === 'restaurants' && styles.tabTextActive]}>
            Restaurants ({favoriteRestaurantsList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dishes' && styles.tabActive]}
          onPress={() => setActiveTab('dishes')}
        >
          <Text style={[styles.tabText, activeTab === 'dishes' && styles.tabTextActive]}>
            Dishes ({favoriteDishiesList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : activeTab === 'restaurants' ? (
          // Restaurants Tab
          favoriteRestaurantsList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No favorite restaurants yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the heart icon on restaurants to save them here
              </Text>
            </View>
          ) : (
            favoriteRestaurantsList.map((restaurant) => (
              <View key={restaurant._id} style={styles.card}>
                <TouchableOpacity
                  style={styles.restaurantCard}
                  onPress={() => router.push(`/restaurant/${restaurant._id}`)}
                >
                  <View style={styles.restaurantImage}>
                    <Ionicons name="restaurant" size={40} color={colors.primary} />
                  </View>
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                    <View style={styles.restaurantMeta}>
                      <View style={styles.rating}>
                        <Ionicons name="star" size={14} color={colors.warning} />
                        <Text style={styles.ratingText}>{restaurant.rating}</Text>
                      </View>
                      <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleRestaurantFavorite(restaurant._id)}
                >
                  <Ionicons name="heart" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          // Dishes Tab
          favoriteDishiesList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No favorite dishes yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the heart icon on menu items to save them here
              </Text>
            </View>
          ) : (
            favoriteDishiesList.map((dish) => (
              <View key={dish._id} style={styles.card}>
                <View style={styles.dishCard}>
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName}>{dish.name}</Text>
                    <Text style={styles.restaurantNameSmall}>
                      {dish.restaurantName}
                    </Text>
                    {dish.description && (
                      <Text style={styles.dishDescription}>{dish.description}</Text>
                    )}
                    <Text style={styles.dishPrice}>₹{dish.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleDishFavorite(dish._id)}
                  >
                    <Ionicons name="heart" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  restaurantCuisine: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  ratingText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  dishCard: {
    padding: spacing.md,
  },
  dishInfo: {
    paddingRight: spacing.xl,
  },
  dishName: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  restaurantNameSmall: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  dishDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  dishPrice: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
