import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

export default function HowItWorksScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How It Works</Text>
        <Text style={styles.subtitle}>Simple, transparent, and honest food delivery</Text>

        {/* Step 1 */}
        <View style={styles.stepContainer}>
          <View style={styles.stepIconContainer}>
            <View style={styles.stepCircle}>
              <Ionicons name="search" size={32} color={colors.white} />
            </View>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Browse</Text>
            <Text style={styles.stepDescription}>Real menu prices, no inflation</Text>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepContainer}>
          <View style={styles.stepIconContainer}>
            <View style={styles.stepCircle}>
              <Ionicons name="cart" size={32} color={colors.white} />
            </View>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Order</Text>
            <Text style={styles.stepDescription}>No hidden fees, complete transparency</Text>
          </View>
        </View>

        {/* Step 3 */}
        <View style={styles.stepContainer}>
          <View style={styles.stepIconContainer}>
            <View style={styles.stepCircle}>
              <Ionicons name="bicycle" size={32} color={colors.white} />
            </View>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Delivered</Text>
            <Text style={styles.stepDescription}>Hyperlocal and fast delivery</Text>
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
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  stepCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepNumber: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
