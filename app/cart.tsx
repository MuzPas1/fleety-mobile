import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useCartStore } from '../store/cartStore';
import { useAddressStore } from '../store/addressStore';
import api from '../services/api';
import { createOrder } from '../services/orders';
import { useAuthStore } from '../store/authStore';

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const globalSelectedAddress = useAddressStore((state) => state.selectedAddress);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chargesGST, setChargesGST] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('');

  // Watch for address changes from the address store
  useEffect(() => {
    if (globalSelectedAddress) {
      setSelectedAddress(globalSelectedAddress);
    }
  }, [globalSelectedAddress]);

  const platformFee = 10;
  const infraFee = 10;

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (items.length > 0 && selectedAddress) {
      calculateDeliveryFee();
    }
  }, [items, selectedAddress]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data);
      
      // Auto-select default address
      const defaultAddress = response.data.find((a: any) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryFee = async () => {
    if (items.length === 0) return;
    
    try {
      const restaurantId = items[0].restaurantId;
      const response = await api.get(`/calculate-delivery-fee?restaurant_id=${restaurantId}`);
      setDeliveryFee(response.data.deliveryFee);
      setDistance(response.data.distance);
      setChargesGST(response.data.chargesGST);
      setDeliveryTime(response.data.deliveryTime);
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
    }
  };

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setShowAddressPicker(false);
  };

  const handleOpenAddressPicker = () => {
    fetchAddresses(); // Refresh addresses before showing modal
    setShowAddressPicker(true);
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add items to get started</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.back()}
        >
          <Text style={styles.browseButtonText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subtotal = getTotal();
  const gst = chargesGST ? Math.round(subtotal * 0.05) : 0; // 5% GST only if restaurant charges
  const totalFees = deliveryFee + platformFee + infraFee + gst;
  const grandTotal = subtotal + totalFees;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity 
              onPress={() => router.push('/addresses')}
              style={styles.addButton}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {selectedAddress ? (
            <View style={styles.addressBox}>
              <View style={styles.addressHeader}>
                <Ionicons 
                  name={selectedAddress.label === 'Home' ? 'home' : selectedAddress.label === 'Work' ? 'briefcase' : 'location'} 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                {selectedAddress.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressText}>{selectedAddress.fullAddress}</Text>
              <Text style={styles.phoneText}>{selectedAddress.phone}</Text>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={handleOpenAddressPicker}
              >
                <Text style={styles.changeButtonText}>Change Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => router.push('/addresses')}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.addAddressText}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}

          {distance > 0 && (
            <View style={styles.distanceInfo}>
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <Text style={styles.distanceText}>{distance} km from restaurant</Text>
            </View>
          )}

          {/* ETA Display */}
          {deliveryTime && (
            <View style={styles.etaContainer}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={styles.etaText}>
                Estimated delivery: {deliveryTime}
              </Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemRestaurant}>{item.restaurantName}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={16} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fee</Text>
            <Text style={styles.billValue}>₹{platformFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Infra Fee</Text>
            <Text style={styles.billValue}>₹{infraFee}</Text>
          </View>
          {chargesGST && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST (5%)</Text>
              <Text style={styles.billValue}>₹{gst}</Text>
            </View>
          )}
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Address Picker Modal */}
      <Modal
        visible={showAddressPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddressPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address._id}
                  style={[
                    styles.addressOption,
                    selectedAddress?._id === address._id && styles.addressOptionActive
                  ]}
                  onPress={() => handleAddressSelect(address)}
                >
                  <Ionicons 
                    name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'location'} 
                    size={20} 
                    color={selectedAddress?._id === address._id ? colors.primary : colors.textMuted} 
                  />
                  <View style={styles.addressOptionInfo}>
                    <View style={styles.addressOptionHeader}>
                      <Text style={styles.addressOptionLabel}>{address.label}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadgeSmall}>
                          <Text style={styles.defaultBadgeTextSmall}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressOptionText}>{address.fullAddress}</Text>
                  </View>
                  {selectedAddress?._id === address._id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Checkout Button */}
      <TouchableOpacity
        style={[styles.checkoutButton, !selectedAddress && styles.checkoutButtonDisabled]}
        onPress={async () => {
          if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
          }

          try {
            const orderPayload = {
              userId: user?.id,
              restaurantId: items[0]?.restaurantId,
              items: items,
              total: grandTotal,
            };

            const order = await createOrder(orderPayload);

            Alert.alert("Success", "Your order has been placed!");

            useCartStore.getState().clearCart();
            router.replace('/(tabs)');
          } catch (error) {
            Alert.alert("Error", "Failed to place the order.");
            console.error(error);
          }
        }}
        disabled={!selectedAddress}
      >
        <Text style={styles.checkoutButtonText}>
          Proceed to Checkout • ₹{grandTotal}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  browseButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  browseButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  section: {
    padding: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  addressBox: {
    padding: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressLabel: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  defaultBadge: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '600',
  },
  addressText: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  phoneText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  changeButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  changeButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addAddressText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  distanceText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 122, 26, 0.1)',
    borderRadius: borderRadius.sm,
  },
  etaText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemRestaurant: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  quantityButton: {
    padding: spacing.xs,
  },
  quantityText: {
    marginHorizontal: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  billLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  billValue: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
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
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addressOptionActive: {
    backgroundColor: 'rgba(255, 122, 26, 0.05)',
  },
  addressOptionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  addressOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addressOptionLabel: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  defaultBadgeSmall: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeTextSmall: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  addressOptionText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  checkoutButton: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
});
