import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

import { supabase } from '../services/supabase';   // ✅ SUPABASE CLIENT
import api from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      // STEP 1 — Check with your backend API
      const response = await api.post('/auth/login', { phone });

      if (response.data.status === 'USER_NOT_FOUND') {
        // User doesn't exist - redirect to signup
        setLoading(false);
        router.push(`/signup?phone=${phone}`);
        return;
      }

      if (response.data.status === 'SUCCESS') {
        // STEP 2 — Log in to Supabase using phone as email surrogate
        const email = `${phone}@fleety.app`; // deterministic pseudo-email

        const { data: supaData, error: supaError } =
          await supabase.auth.signInWithPassword({
            email,
            password: phone, // using phone as password for now
          });

        if (supaError) {
          console.log("Supabase login error:", supaError.message);
          Alert.alert('Error', 'Auth failed. Try again.');
          setLoading(false);
          return;
        }

        // Save auth in your store
        await setAuth(response.data.token, phone);

        // Redirect
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://customer-assets.emergentagent.com/job_zoggy-eats/artifacts/4bavuai5_Fleety%20Logo%20zoomed.jpg' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.tagline}>No hidden fees. No inflated prices.</Text>
            <Text style={styles.tagline}>Just food.</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={15}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.infoText}>
              Enter your phone number to login or create an account
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  tagline: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.white,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
