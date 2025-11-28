import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfileMenuScreen() {
  const router = useRouter();
  const { phone, logout } = useAuthStore();
  const [userProfile, setUserProfile] = React.useState<any>(null);

  React.useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('phone');
              await AsyncStorage.clear();
              
              // Clear auth store
              await logout();
              
              // Force full page reload to root
              if (typeof window !== 'undefined' && window.location) {
                window.location.href = '/';
              } else {
                router.replace('/login');
              }
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'details',
      title: 'My Details',
      icon: 'person',
      onPress: () => router.push('/my-details'),
    },
    {
      id: 'orders',
      title: 'My Orders',
      icon: 'receipt',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      id: 'favorites',
      title: 'My Favorites',
      icon: 'heart',
      onPress: () => router.push('/favorites'),
    },
    {
      id: 'addresses',
      title: 'Saved Addresses',
      icon: 'location',
      onPress: () => router.push('/addresses'),
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      icon: 'card',
      onPress: () => router.push('/payment-methods'),
    },
  ];

  const infoItems = [
    {
      id: 'about',
      title: 'About Us',
      icon: 'information-circle',
      onPress: () => router.push('/about-us'),
    },
    {
      id: 'promise',
      title: 'Our Promise',
      icon: 'shield-checkmark',
      onPress: () => router.push('/our-promise'),
    },
    {
      id: 'how',
      title: 'How It Works',
      icon: 'help-circle',
      onPress: () => router.push('/how-it-works'),
    },
    {
      id: 'restaurants',
      title: 'For Restaurants',
      icon: 'restaurant',
      onPress: () => router.push('/for-restaurants'),
    },
    {
      id: 'riders',
      title: 'For Riders',
      icon: 'bicycle',
      onPress: () => router.push('/for-riders'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.displayName}>
            {userProfile?.nickname || userProfile?.name || phone || 'User'}
          </Text>
          {userProfile?.nickname && (
            <Text style={styles.phoneText}>{phone}</Text>
          )}
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          {infoItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color={colors.textMuted} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            AsyncStorage.clear().then(() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            });
          }}
        >
          <Ionicons name="log-out" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Fleety v1.0</Text>
          <Text style={styles.footerSubtext}>No hidden fees. No inflated prices. Just food.</Text>
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
  backButtonContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  userSection: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  displayName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  phoneText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    margin: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.error,
    marginLeft: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
