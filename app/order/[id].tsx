import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../theme/colors';
import api from '../../services/api';

const ORDER_STATUSES = [
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'restaurant' },
  { key: 'on the way', label: 'On the way', icon: 'bicycle' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle' },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
    
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchOrderDetails, 5000);
    
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/₹{id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return ORDER_STATUSES.findIndex(
      (s) => s.key.toLowerCase() === status.toLowerCase()
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isDelivered = order.status.toLowerCase() === 'delivered';

  return (
    <ScrollView style={styles.container}>
      {/* Order Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isDelivered ? 'Order Delivered!' : 'Tracking Your Order'}
        </Text>
        <View style={styles.statusContainer}>
          {ORDER_STATUSES.map((status, index) => {
            const isActive = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <View key={status.key} style={styles.statusItem}>
                <View style={styles.statusIconContainer}>
                  <View
                    style={[
                      styles.statusIcon,
                      isActive && styles.statusIconActive,
                      isCurrent && styles.statusIconCurrent,
                    ]}
                  >
                    <Ionicons
                      name={status.icon as any}
                      size={24}
                      color={isActive ? colors.white : colors.textMuted}
                    />
                  </View>
                  {index < ORDER_STATUSES.length - 1 && (
                    <View
                      style={[
                        styles.statusLine,
                        isActive && styles.statusLineActive,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.statusTextContainer}>
                  <Text
                    style={[
                      styles.statusLabel,
                      isActive && styles.statusLabelActive,
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order ID</Text>
          <Text style={styles.detailValue}>#{order._id.slice(-8)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Restaurant</Text>
          <Text style={styles.detailValue}>{order.restaurantName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order Time</Text>
          <Text style={styles.detailValue}>
            {new Date(order.createdAt).toLocaleString('en-US', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item: any, index: number) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>
        ))}
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>{order.deliveryAddress}</Text>
        <Text style={styles.phoneText}>{order.phone}</Text>
      </View>

      {/* Bill Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Subtotal</Text>
          <Text style={styles.billValue}>₹{order.subtotal}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <Text style={styles.billValue}>₹{order.deliveryFee}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Tax</Text>
          <Text style={styles.billValue}>₹{order.tax}</Text>
        </View>
        <View style={[styles.billRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
        </View>
      </View>

      {isDelivered && (
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
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
  section: {
    padding: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusContainer: {
    paddingVertical: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusIconContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconActive: {
    backgroundColor: colors.primary,
  },
  statusIconCurrent: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  statusLineActive: {
    backgroundColor: colors.primary,
  },
  statusTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  statusLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  itemName: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  itemPrice: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  addressText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  phoneText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
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
  homeButton: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
});
