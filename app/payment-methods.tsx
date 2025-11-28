import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import api from '../services/api';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/payment-methods');
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/payment-methods/${methodId}`);
              fetchPaymentMethods();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card';
      case 'upi':
        return 'phone-portrait';
      case 'netbanking':
        return 'business';
      case 'wallet':
        return 'wallet';
      default:
        return 'cash';
    }
  };

  const getPaymentLabel = (method: any) => {
    if (method.type === 'card' && method.last4) {
      return `${method.provider || 'Card'} •••• ${method.last4}`;
    } else if (method.type === 'upi' && method.upiId) {
      return method.upiId;
    } else if (method.type === 'wallet' && method.provider) {
      return method.provider;
    }
    return method.type.charAt(0).toUpperCase() + method.type.slice(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={60} color={colors.textMuted} />
            <Text style={styles.emptyText}>No saved payment methods</Text>
            <Text style={styles.emptySubtext}>
              Payment methods are saved automatically when you place an order
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Payment Methods</Text>
            {paymentMethods.map((method) => (
              <View key={method._id} style={styles.methodCard}>
                <View style={styles.methodInfo}>
                  <View style={styles.methodIcon}>
                    <Ionicons
                      name={getPaymentIcon(method.type) as any}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.methodDetails}>
                    <Text style={styles.methodLabel}>{getPaymentLabel(method)}</Text>
                    <Text style={styles.methodType}>
                      {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMethod(method._id)}
                >
                  <Ionicons name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            We only save payment method metadata (last 4 digits, UPI ID, etc.) for your convenience.
            No sensitive payment information is stored.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodDetails: {
    flex: 1,
  },
  methodLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  methodType: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
