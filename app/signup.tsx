import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

import { supabase } from '../services/supabase';    // ✅ SUPABASE CLIENT
import api from '../services/api';

export default function SignupScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const { setToken, setPhone } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Validation Error', 'Name must be at least 2 characters');
      return;
    }

    if (!email.trim() || !validateEmail(email.trim())) {
      Alert.alert('Validation Error', 'Enter a valid email');
      return;
    }

    if (!pincode.trim() || pincode.trim().length !== 6) {
      Alert.alert('Validation Error', 'Pincode must be exactly 6 digits');
      return;
    }

    setLoading(true);

    try {
      // STEP 1 — Register with your backend
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone as string,
        pincode: pincode.trim(),
      });

      if (response.data.status === 'EMAIL_EXISTS') {
        Alert.alert('Email already registered', 'Try login instead.');
        setLoading(false);
        return;
      }

      if (response.data.status === 'PHONE_EXISTS') {
        Alert.alert('Account Exists', 'Redirecting you to login.');
        router.replace('/login');
        return;
      }

      if (response.data.status === 'SUCCESS') {
        // STEP 2 — Create Supabase user
        const pseudoEmail = `${phone}@fleety.app`; // pseudo email for Supabase

        const { data: signupData, error: signupError } =
          await supabase.auth.signUp({
            email: pseudoEmail,
            password: phone as string,
          });

        if (signupError) {
          console.log("Supabase signup error:", signupError.message);
          Alert.alert('Error', 'Failed to create user. Try again.');
          setLoading(false);
          return;
        }

        const supaUserId = signupData.user?.id;

        // STEP 3 — Insert user into Supabase users table
        if (supaUserId) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: supaUserId,
              full_name: name.trim(),
              phone: phone as string,
            });

          if (insertError) {
            console.log("Insert error:", insertError.message);
          }
        }

        // STEP 4 — Save token to your app store
        setToken(response.data.token);
        setPhone(phone as string);

        Alert.alert('Success!', 'Account created.');

        setTimeout(() => {
          router.replace('/(tabs)');
        }, 800);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View className={styles.header}>
            <Image
              source={{ uri: 'https://customer-assets.emergentagent.com/job_zoggy-eats/artifacts/4bavuai5_Fleety%20Logo%20zoomed.jpg' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Create Your Account</Text>
            <Text style={styles.tagline}>Join Fleety for honest food delivery</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formLabel}>Phone Number</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={phone as string}
              editable={false}
            />

            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.formLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.formLabel}>Pincode *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your pincode"
              placeholderTextColor={colors.textMuted}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logoImage: { width: 200, height: 200, marginBottom: spacing.lg },
  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagline: { fontSize: fontSize.md, color: colors.textMuted },
  form: { width: '100%' },
  formLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    height: 50,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundGray,
    color: colors.textMuted,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    height: 50,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
});
