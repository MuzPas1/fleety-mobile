import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import api from '../../services/api';
import MapView, { Marker } from 'react-native-maps';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addItem, items, updateQuantity } = useCartStore();
  const { loadFavorites, toggleRestaurantFavorite, toggleDishFavorite, isRestaurantFavorite, isDishFavorite } = useFavoritesStore();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
    fetchRestaurantDetails();
  }, [id]);

const fetchRestaurantDetails = async () => {
  try {
    setLoading(true);

    const restaurantData = await getRestaurantById(id);
    const menuData = await getMenuItemsForRestaurant(id);

    setRestaurant(restaurantData);
    setMenu(menuData);

  } catch (error) {
    console.error("Supabase fetch error:", error);
  } finally {
    setLoading(false);
  }
};

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find((i) => i.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddItem = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: id as string,
      restaurantName: restaurant?.name || '',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Restaurant Header */}
        <View style={styles.header}>
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="restaurant" size={60} color={colors.primary} />
          </View>
          <TouchableOpacity
            style={styles.restaurantFavoriteButton}
            onPress={() => toggleRestaurantFavorite(id as string)}
          >
            <Ionicons
              name={isRestaurantFavorite(id as string) ? 'heart' : 'heart-outline'}
              size={28}
              color={isRestaurantFavorite(id as string) ? colors.error : colors.textMuted}
            />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
            <View style={styles.metaRow}>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
              <Text style={styles.metaText}>
                {restaurant.deliveryTime} • ${restaurant.minOrder} min
              </Text>
            </View>
          </View>
        </View>

        <MapView
          style={{
            width: '100%',
            height: 200,
            borderRadius: 12,
            marginTop: 10,
            marginBottom: 20,
          }}
          initialRegion={{
            latitude: restaurant?.latitude || 0,
            longitude: restaurant?.longitude || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: restaurant?.latitude || 0,
              longitude: restaurant?.longitude || 0,
            }}
            title={restaurant?.name}
          />
        </MapView>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {menu.map((item) => {
            const quantity = getItemQuantity(item.id);
            return (
              <View key={item.id} style={styles.menuItemContainer}>
                <View style={styles.menuItem}>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <TouchableOpacity
                        style={styles.dishFavoriteButton}
                        onPress={() => toggleDishFavorite(item.id)}
                      >
                        <Ionicons
                          name={isDishFavorite(item.id) ? 'heart' : 'heart-outline'}
                          size={20}
                          color={isDishFavorite(item.id) ? colors.error : colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    {item.description && (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    )}
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                  {quantity === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddItem(item)}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item._id, quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item._id, quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* View Cart Button */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.viewCartButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.viewCartText}>
            View Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  header: {
    backgroundColor: colors.white,
    position: 'relative',
  },
  bannerPlaceholder: {
    height: 200,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantFavoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },
  headerInfo: {
    padding: spacing.md,
  },
  restaurantName: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cuisine: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  ratingText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  menuSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuItemContainer: {
    position: 'relative',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  dishFavoriteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  itemDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  quantityButton: {
    padding: spacing.xs,
  },
  quantityText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  viewCartButton: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  viewCartText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
});
