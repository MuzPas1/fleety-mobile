import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useCartStore } from '../store/cartStore';
import api from '../services/api';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
  { id: 'upi', name: 'UPI', icon: 'phone-portrait' },
  { id: 'netbanking', name: 'Net Banking', icon: 'business' },
  { id: 'wallet', name: 'Wallets', icon: 'wallet' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // UPI
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    fetchAddresses();
    fetchPaymentMethods();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data);
      
      // Auto-fill with default address
      const defaultAddress = response.data.find((a: any) => a.isDefault);
      if (defaultAddress) {
        setAddress(defaultAddress.fullAddress);
        setPhone(defaultAddress.phone);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/payment-methods');
      setSavedPaymentMethods(response.data);
      
      // Auto-fill with most recent payment method
      if (response.data.length > 0) {
        const recentMethod = response.data[0];
        setSelectedPayment(recentMethod.type);
        
        if (recentMethod.type === 'upi' && recentMethod.upiId) {
          setUpiId(recentMethod.upiId);
        } else if (recentMethod.type === 'card' && recentMethod.last4) {
          // For card, we can only show last 4 digits, user still needs to enter full details
          // But we can pre-select the payment method
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  // Get totals passed from cart (these are already calculated)
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    // Calculate total from cart
    const subtotal = getTotal();
    const platformFee = 10;
    const infraFee = 10;
    const tax = Math.round(subtotal * 0.05);
    // Delivery fee will be added from cart state
    setOrderTotal(subtotal + platformFee + infraFee + tax);
  }, [items]);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    // Validate payment details
    if (selectedPayment === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        Alert.alert('Error', 'Please enter all card details');
        return;
      }
    } else if (selectedPayment === 'upi') {
      if (!upiId) {
        Alert.alert('Error', 'Please enter UPI ID');
        return;
      }
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const subtotal = getTotal();
      const platformFee = 10;
      const infraFee = 10;
      const tax = Math.round(subtotal * 0.05);
      const deliveryFee = 0; // Set to 0 or get from cart state if needed
      
      const orderData = {
        items: items.map(item => ({
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        restaurantId: items[0]?.restaurantId,
        restaurantName: items[0]?.restaurantName,
        deliveryAddress: address,
        phone,
        paymentMethod: selectedPayment,
        subtotal,
        deliveryFee,
        tax,
        totalAmount: orderTotal,
      };

      const response = await api.post('/orders', orderData);
      
      // Save payment method metadata
      try {
        const paymentMethodData: any = {
          type: selectedPayment,
        };
        
        if (selectedPayment === 'card' && cardNumber) {
          paymentMethodData.last4 = cardNumber.slice(-4);
          paymentMethodData.provider = 'Card';
        } else if (selectedPayment === 'upi' && upiId) {
          paymentMethodData.upiId = upiId;
        } else if (selectedPayment === 'wallet') {
          paymentMethodData.provider = 'Wallet';
        }
        
        await api.post('/payment-methods', paymentMethodData);
      } catch (error) {
        console.error('Error saving payment method:', error);
      }
      
      // Clear cart and navigate to success screen
      clearCart();
      router.replace(`/payment-success?orderId=${response.data._id}&amount=${orderTotal}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          
          {/* Display Selected Address (Read-Only) */}
          {address ? (
            <View style={styles.addressDisplayBox}>
              <Text style={styles.addressDisplayText}>{address}</Text>
            </View>
          ) : (
            <Text style={styles.noAddressText}>No address selected</Text>
          )}
          
          {/* Display Phone Number (Read-Only) */}
          {phone && (
            <View style={styles.phoneDisplayBox}>
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={styles.phoneDisplayText}>{phone}</Text>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {savedPaymentMethods.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/payment-methods')}>
                <Text style={styles.linkText}>Manage</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Saved Payment Methods */}
          {savedPaymentMethods.length > 0 && (
            <View style={styles.savedMethodsContainer}>
              <Text style={styles.savedMethodsLabel}>Saved Methods:</Text>
              {savedPaymentMethods.slice(0, 2).map((method) => (
                <TouchableOpacity
                  key={method._id}
                  style={[
                    styles.savedMethodChip,
                    selectedPayment === method.type && styles.savedMethodChipActive,
                  ]}
                  onPress={() => {
                    setSelectedPayment(method.type);
                    if (method.type === 'upi' && method.upiId) {
                      setUpiId(method.upiId);
                    }
                  }}
                >
                  <Ionicons
                    name={
                      method.type === 'card' ? 'card' :
                      method.type === 'upi' ? 'phone-portrait' :
                      method.type === 'wallet' ? 'wallet' : 'business'
                    }
                    size={16}
                    color={selectedPayment === method.type ? colors.white : colors.primary}
                  />
                  <Text style={[
                    styles.savedMethodText,
                    selectedPayment === method.type && styles.savedMethodTextActive,
                  ]}>
                    {method.type === 'card' && method.last4 ? `•••• ${method.last4}` :
                     method.type === 'upi' && method.upiId ? method.upiId :
                     method.provider || method.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Ionicons
                name={method.icon as any}
                size={24}
                color={selectedPayment === method.id ? colors.primary : colors.textMuted}
              />
              <Text style={styles.paymentText}>{method.name}</Text>
              {selectedPayment === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Details */}
        {selectedPayment === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor={colors.textMuted}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              maxLength={16}
            />
            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              placeholderTextColor={colors.textMuted}
              value={cardName}
              onChangeText={setCardName}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                placeholderTextColor={colors.textMuted}
                value={expiryDate}
                onChangeText={setExpiryDate}
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                placeholderTextColor={colors.textMuted}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="number-pad"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        )}

        {selectedPayment === 'upi' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPI Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID (e.g., name@upi)"
              placeholderTextColor={colors.textMuted}
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>
        )}

        {selectedPayment === 'netbanking' && (
          <View style={styles.section}>
            <Text style={styles.infoText}>You will be redirected to your bank's website</Text>
          </View>
        )}

        {selectedPayment === 'wallet' && (
          <View style={styles.section}>
            <Text style={styles.infoText}>Select your preferred wallet on the next screen</Text>
          </View>
        )}

        {/* OTP Disclaimer */}
        <View style={[styles.section, { backgroundColor: colors.backgroundGray }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.disclaimerText}>
              Do not share the delivery OTP until the food is delivered.
            </Text>
          </View>
        </View>

      </ScrollView>

      <TouchableOpacity
        style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.placeOrderButtonText}>
          {loading ? 'Processing...' : `Pay ₹${orderTotal}`}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  linkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  savedAddresses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  savedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  savedAddressItemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 122, 26, 0.05)',
  },
  savedAddressText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  savedAddressTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  defaultBadgeSmall: {
    marginLeft: spacing.xs,
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
  addressDisplayBox: {
    padding: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  addressDisplayText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  noAddressText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  phoneDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneDisplayText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 122, 26, 0.05)',
  },
  paymentText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.md,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
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
  placeOrderButton: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  savedMethodsContainer: {
    marginBottom: spacing.md,
  },
  savedMethodsLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  savedMethodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  savedMethodChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  savedMethodText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  savedMethodTextActive: {
    color: colors.white,
  },
});
