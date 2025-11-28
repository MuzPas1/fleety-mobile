import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

export default function AboutUsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.paragraph}>
          Fleety was created to fix what went wrong in food delivery — inflated prices, hidden fees, and unfair systems.
        </Text>
        <Text style={styles.paragraph}>
          We believe in pure pricing, pure transparency, and peaceful experiences for everyone involved — customers, restaurants, and riders.
        </Text>
        <Text style={styles.paragraph}>
          No drama, no tricks. Just good food delivered honestly.
        </Text>
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
    marginBottom: spacing.xl,
  },
  paragraph: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
});
