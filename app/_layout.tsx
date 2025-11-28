import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant/[id]" options={{ title: 'Restaurant' }} />
      <Stack.Screen name="cart" options={{ title: 'Cart' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="order/[id]" options={{ title: 'Order Tracking' }} />
      <Stack.Screen name="addresses" options={{ title: 'Saved Addresses' }} />
      <Stack.Screen name="payment-methods" options={{ title: 'Payment Methods' }} />
      <Stack.Screen name="about-us" options={{ title: 'About Us' }} />
      <Stack.Screen name="how-it-works" options={{ title: 'How It Works' }} />
      <Stack.Screen name="our-promise" options={{ title: 'Our Promise' }} />
      <Stack.Screen name="for-restaurants" options={{ title: 'For Restaurants' }} />
      <Stack.Screen name="for-riders" options={{ title: 'For Riders' }} />
      <Stack.Screen name="profile-menu" options={{ headerShown: false }} />
      <Stack.Screen name="my-details" options={{ headerShown: false }} />
      <Stack.Screen name="favorites" options={{ headerShown: false }} />
      <Stack.Screen name="payment-success" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}
