import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

export default function ForRestaurantsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Partner with Fleety</Text>
        <Text style={styles.subtitle}>
          Zero commission. Real menu pricing. Fast payouts. Transparency builds more orders.
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.benefitText}>Zero commission on orders</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.benefitText}>Keep 100% of menu prices</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.benefitText}>Fast payouts within 24 hours</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.benefitText}>Transparency builds customer trust</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.benefitText}>No hidden platform charges</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.benefitText}>Full control over your menu</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0%</Text>
            <Text style={styles.statLabel}>Commission</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Menu Price</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>24h</Text>
            <Text style={styles.statLabel}>Payouts</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  benefitsContainer: {
    marginBottom: spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  benefitText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
