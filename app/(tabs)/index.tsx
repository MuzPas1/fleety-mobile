import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { getRestaurants } from '../../services/restaurants';


const CATEGORIES = [
  { id: '1', name: 'Biryani', icon: 'restaurant' },
  { id: '2', name: 'Breakfast', icon: 'sunny' },
  { id: '3', name: 'North Indian', icon: 'flame' },
  { id: '4', name: 'South Indian', icon: 'leaf' },
  { id: '5', name: 'Chinese', icon: 'nutrition' },
  { id: '6', name: 'Snacks', icon: 'fast-food' },
  { id: '7', name: 'Continental', icon: 'pizza' },
  { id: '8', name: 'Fast Food', icon: 'fast-food-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { loadFavorites, toggleRestaurantFavorite, isRestaurantFavorite } = useFavoritesStore();
  const [selectedPincode, setSelectedPincode] = useState<string>('560038');
  const [showPincodePicker, setShowPincodePicker] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyName, setNotifyName] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPincode, setNotifyPincode] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadFavorites();
    fetchRestaurants();
  }, []);

const fetchRestaurants = async () => {
  try {
    setLoading(true);
    const data = await getRestaurants(); // SUPABASE FETCH
    setRestaurants(data);
  } catch (error) {
    console.error("Supabase fetch error:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Top Row: Fleety Logo + Pincode Selector */}
        <View style={styles.topRow}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_zoggy-eats/artifacts/zxe4hvd0_Fleety%20Logo%20zoomed.jpg' }}
            style={styles.fleetyLogoHome}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.areaDropdown}
            onPress={() => setShowPincodePicker(true)}
          >
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.areaDropdownText} numberOfLines={1}>
              {selectedPincode || 'Select Pincode'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Second Row: Saved Address + Profile Icon */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.addressSelector}
            onPress={() => router.push('/addresses')}
          >
            <Ionicons name="location" size={20} color={colors.white} />
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressText} numberOfLines={1}>
                Saved Address
              </Text>
              <Text style={styles.addressLabel} numberOfLines={1}>Tap to manage addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile-menu')}
          >
            <Ionicons name="person-circle" size={32} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Hero Section - Orange Background with Logo and Search */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_zoggy-eats/artifacts/zxe4hvd0_Fleety%20Logo%20zoomed.jpg' }}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroSubtitle}>No hidden fees. No inflated prices. Just food.</Text>
          
          {/* Search Bar - Inside Orange Section */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for restaurants or cuisines…"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.name && styles.categoryChipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category.name ? null : category.name
                    )
                  }
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={
                      selectedCategory === category.name
                        ? colors.white
                        : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.name && styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants Near You</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : filteredRestaurants.length === 0 ? (
            <Text style={styles.emptyText}>No restaurants found</Text>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <View key={restaurant.id} style={styles.restaurantCardContainer}>
                <TouchableOpacity
                  style={styles.restaurantCard}
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
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
                      <Text style={styles.metaText}>
                        {restaurant.deliveryTime}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.favoriteButtonHome}
                  onPress={() => toggleRestaurantFavorite(restaurant.id)}
                >
                  <Ionicons
                    name={isRestaurantFavorite(restaurant.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isRestaurantFavorite(restaurant.id) ? colors.error : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Pincode Picker Modal - Full Screen Centered */}
      <Modal
        visible={showPincodePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowPincodePicker(false);
          setPincodeInput('');
        }}
      >
        <TouchableOpacity 
          style={styles.fullScreenBackdrop}
          activeOpacity={1}
          onPress={() => {
            setShowPincodePicker(false);
            setPincodeInput('');
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredModalContainer}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.whiteModalCard}>
                <Text style={styles.centeredModalTitle}>Select Pincode</Text>
                
                <TextInput
                  style={styles.largeRoundedInput}
                  placeholder="Enter pincode (e.g., 560038)"
                  placeholderTextColor={colors.textMuted}
                  value={pincodeInput}
                  onChangeText={setPincodeInput}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                
                <TouchableOpacity
                  style={styles.primaryButtonLarge}
                  onPress={() => {
                    const pincode = pincodeInput.trim();
                    if (pincode === '560038' || pincode === '560075') {
                      setSelectedPincode(pincode);
                      setShowPincodePicker(false);
                      setPincodeInput('');
                      fetchRestaurants();
                    } else if (pincode.length === 6) {
                      setNotifyPincode(pincode);
                      setShowPincodePicker(false);
                      setPincodeInput('');
                      setShowNotifyModal(true);
                    } else {
                      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode');
                    }
                  }}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Notify Me Modal - Full Screen Centered with White Background */}
      <Modal
        visible={showNotifyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowNotifyModal(false);
          setNotifyName('');
          setNotifyEmail('');
        }}
      >
        <TouchableOpacity 
          style={styles.fullScreenBackdrop}
          activeOpacity={1}
          onPress={() => {
            setShowNotifyModal(false);
            setNotifyName('');
            setNotifyEmail('');
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centeredModalContainer}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <ScrollView style={styles.whiteModalCard} showsVerticalScrollIndicator={false}>
                <Text style={styles.centeredModalTitle}>Thank you for your love!</Text>
                <Text style={styles.centeredModalSubtitle}>
                  We are expanding fast across Bangalore.{'\n'}
                  Share your details, and we'll notify you the moment Fleety goes live in your pincode.
                </Text>
                
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Name *</Text>
                  <TextInput
                    style={styles.largeRoundedInput}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textMuted}
                    value={notifyName}
                    onChangeText={setNotifyName}
                  />
                  
                  <Text style={styles.formLabel}>Email *</Text>
                  <TextInput
                    style={styles.largeRoundedInput}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    value={notifyEmail}
                    onChangeText={setNotifyEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  
                  <Text style={styles.formLabel}>Pincode</Text>
                  <TextInput
                    style={[styles.largeRoundedInput, styles.inputDisabled]}
                    value={notifyPincode}
                    editable={false}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.primaryButtonLarge}
                  onPress={async () => {
                    if (!notifyName.trim() || !notifyEmail.trim()) {
                      Alert.alert('Error', 'Please fill in all required fields');
                      return;
                    }
                    
                    try {
                      await api.post('/notify-pincode', {
                        name: notifyName.trim(),
                        email: notifyEmail.trim(),
                        pincode: notifyPincode,
                      });
                      
                      setShowNotifyModal(false);
                      setNotifyName('');
                      setNotifyEmail('');
                      setShowSuccessModal(true);
                      
                      // Auto-close after 2 seconds and navigate home
                      setTimeout(() => {
                        setShowSuccessModal(false);
                      }, 2000);
                    } catch (error) {
                      console.error('Error saving notification request:', error);
                      Alert.alert('Error', 'Failed to submit. Please try again.');
                    }
                  }}
                >
                  <Text style={styles.primaryButtonText}>Notify Me</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setShowNotifyModal(false);
                    setNotifyName('');
                    setNotifyEmail('');
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal - Auto-closes after 2 seconds */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
        }}
      >
        <TouchableOpacity 
          style={styles.fullScreenBackdrop}
          activeOpacity={1}
          onPress={() => setShowSuccessModal(false)}
        >
          <View style={styles.centeredModalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.whiteModalCard}>
                <Text style={styles.successEmoji}>🙌</Text>
                <Text style={styles.centeredModalTitle}>Got it!</Text>
                <Text style={styles.centeredModalSubtitle}>
                  Thank you! We will notify you as soon as we go live in your pincode.
                </Text>
                <TouchableOpacity
                  style={styles.primaryButtonLarge}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text style={styles.primaryButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cart Button */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
          <Ionicons name="cart" size={24} color={colors.white} />
          <Text style={styles.cartButtonText}>View Cart</Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  fleetyLogoHome: {
    width: 120,
    height: 40,
    marginRight: spacing.sm,
  },
  areaDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  areaDropdownText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
    marginHorizontal: spacing.sm,
    maxWidth: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary,
  },
  addressSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  addressText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
  addressLabel: {
    fontSize: fontSize.xs,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  profileButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    width: 180,
    height: 60,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.white,
    textAlign: 'center',
    opacity: 0.95,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.round,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.white,
  },
  restaurantCardContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
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
  favoriteButtonHome: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  emptyText: {
    textAlign: 'center',
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  areaItemContent: {
    flex: 1,
  },
  areaItemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  areaItemLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  areaItemLabelAvailable: {
    color: colors.primary,
  },
  areaItemLabelComingSoon: {
    color: colors.textMuted,
  },
  cartButton: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    left: '30%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.primary,
  },
  cartButtonText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  fullScreenBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  centeredModalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  whiteModalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centeredModalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  centeredModalSubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  largeRoundedInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  primaryButtonLarge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  formSection: {
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundGray,
    color: colors.textMuted,
  },
  secondaryButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  comingSoonModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    margin: spacing.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  comingSoonHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  comingSoonEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  comingSoonTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  comingSoonSubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  notifySection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  notifyText: {
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  comingSoonActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  notifyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  notifyButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  successModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  successMessage: {
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  successButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    minWidth: 120,
  },
  successButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});
