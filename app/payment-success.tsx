import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { orderId, amount } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Success Message */}
      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.subtitle}>Your order has been placed successfully</Text>

      {/* Order Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.detailsHeader}>
          <Ionicons name="cube" size={24} color={colors.primary} />
          <Text style={styles.detailsHeaderText}>Order Details</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order ID</Text>
          <Text style={styles.detailValue}>{orderId || 'ZGY426708370'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Paid</Text>
          <Text style={styles.detailValue}>₹{amount || '180'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={[styles.detailValue, styles.statusConfirmed]}>Confirmed</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method</Text>
          <Text style={styles.detailValue}>Online</Text>
        </View>
      </View>

      {/* Delivery Info */}
      <View style={styles.deliveryInfoCard}>
        <Ionicons name="bicycle" size={20} color={colors.primary} />
        <Text style={styles.deliveryInfoText}>
          Your order will be delivered in 30-40 minutes
        </Text>
      </View>

      <Text style={styles.whatsappText}>
        You'll receive a WhatsApp notification when your order is out for delivery
      </Text>

      {/* Order More Food Button */}
      <TouchableOpacity
        style={styles.orderMoreButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Ionicons name="home" size={20} color={colors.white} />
        <Text style={styles.orderMoreButtonText}>Order More Food</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footerText}>
        Thank you for ordering with Fleety! 🧡
      </Text>
      <Text style={styles.footerSubtext}>No hidden fees. No inflated prices. Just food.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsHeaderText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  statusConfirmed: {
    color: colors.success,
  },
  deliveryInfoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  deliveryInfoText: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
    fontWeight: '500',
  },
  whatsappText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  orderMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  orderMoreButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
