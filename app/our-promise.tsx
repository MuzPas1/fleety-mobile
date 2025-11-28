import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

export default function OurPromiseScreen() {
  const promises = [
    'Real menu prices',
    'No inflated charges',
    'Transparent bill breakdown',
    'Fair treatment of restaurants and riders',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Our Promise</Text>
        <Text style={styles.paragraph}>
          We promise honesty in everything:
        </Text>
        {promises.map((promise, index) => (
          <View key={index} style={styles.promiseItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.promiseText}>{promise}</Text>
          </View>
        ))}
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
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  promiseText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
});
