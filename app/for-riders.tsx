import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

export default function ForRidersScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>For Riders</Text>
        <Text style={styles.paragraph}>
          Fleety supports delivery partners with fair, transparent earnings — no hidden cuts, no exploitation.
        </Text>
        <Text style={styles.paragraph}>
          100% of tips go directly to the rider.
        </Text>
        <Text style={styles.paragraph}>
          Because they deserve dignity, respect, and honest pay for honest work.
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
