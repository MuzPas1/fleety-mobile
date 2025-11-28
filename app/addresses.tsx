import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useAddressStore } from '../store/addressStore';
import api from '../services/api';

export default function AddressesScreen() {
  const router = useRouter();
  const setSelectedAddress = useAddressStore((state) => state.setSelectedAddress);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  
  // Form state
  const [label, setLabel] = useState('Home');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = async () => {
    console.log('=== Detect Location Button Clicked ===');
    setDetectingLocation(true);
    
    try {
      const { getUserLocation } = await import('../utils/geolocation');
      console.log('Calling getUserLocation...');
      
      const result = await getUserLocation();
      console.log('Location result:', result);
      
      // Auto-fill form fields
      setFullAddress(result.address || `Lat: ${result.latitude}, Lng: ${result.longitude}`);
      setLabel('Home');
      setLandmark(result.city || result.region || '');
      setPhone('');
      
      // Open modal with pre-filled data
      setShowAddModal(true);
      
      const methodText = result.method === 'ip-fallback' ? '(approximate location from IP)' : '';
      Alert.alert(
        'Location Detected!',
        `${result.address || 'Location detected'} ${methodText}\n\nPlease review and complete the details.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Location detection error:', error);
      
      if (error.code === 'PERMISSION_DENIED') {
        Alert.alert(
          'Location Access Blocked',
          'Location access is blocked.\n\nTo enable:\n1. Click the lock icon (🔒) in your browser\n2. Go to Site Settings\n3. Set Location to "Allow"\n\nOr enter your address manually.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Location Error',
          error.message || 'Could not detect location. Please enter manually.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setLabel('Home');
    setFullAddress('');
    setLandmark('');
    setPhone('');
    setIsDefault(false);
    setShowAddModal(true);
  };

  const openEditModal = (address: any) => {
    setEditingAddress(address);
    setLabel(address.label);
    setFullAddress(address.fullAddress);
    setLandmark(address.landmark || '');
    setPhone(address.phone);
    setIsDefault(address.isDefault);
    setShowAddModal(true);
  };

  const handleSaveAddress = async () => {
    if (!fullAddress.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const addressData = {
        label,
        fullAddress,
        landmark: landmark || undefined,
        phone,
        isDefault,
      };

      if (editingAddress) {
        await api.put(`/addresses/${editingAddress._id}`, addressData);
      } else {
        await api.post('/addresses', addressData);
      }

      setShowAddModal(false);
      fetchAddresses();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    router.back();
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/addresses/${addressId}`);
              fetchAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={60} color={colors.textMuted} />
            <Text style={styles.emptyText}>No saved addresses</Text>
            <Text style={styles.emptySubtext}>Add an address to get started</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <TouchableOpacity 
              key={address._id} 
              style={styles.addressCard}
              onPress={() => handleSelectAddress(address)}
              activeOpacity={0.7}
            >
              <View style={styles.addressHeader}>
                <View style={styles.labelContainer}>
                  <Ionicons 
                    name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'location'} 
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={styles.addressLabel}>{address.label}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => openEditModal(address)} style={styles.iconButton}>
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAddress(address._id)} style={styles.iconButton}>
                    <Ionicons name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.addressText}>{address.fullAddress}</Text>
              {address.landmark && (
                <Text style={styles.landmarkText}>Landmark: {address.landmark}</Text>
              )}
              <Text style={styles.phoneText}>{address.phone}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detect Location Button */}
      <TouchableOpacity 
        style={styles.detectLocationButton} 
        onPress={detectLocation}
        disabled={detectingLocation}
      >
        {detectingLocation ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={styles.detectLocationText}>Detect My Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Label *</Text>
            <View style={styles.labelButtons}>
              {['Home', 'Work', 'Other'].map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelButton, label === l && styles.labelButtonActive]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[styles.labelButtonText, label === l && styles.labelButtonTextActive]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Full Address *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter complete address"
              placeholderTextColor={colors.textMuted}
              value={fullAddress}
              onChangeText={setFullAddress}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Landmark (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Near park, Opposite mall"
              placeholderTextColor={colors.textMuted}
              value={landmark}
              onChangeText={setLandmark}
            />

            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsDefault(!isDefault)}
            >
              <Ionicons
                name={isDefault ? 'checkbox' : 'square-outline'}
                size={24}
                color={colors.primary}
              />
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveAddress}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  addressCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  defaultBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: spacing.sm,
  },
  addressText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  landmarkText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  phoneText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  detectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  detectLocationText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primary,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  closeButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.round,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  labelButtons: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  labelButton: {
    flex: 1,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  labelButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  labelButtonText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  labelButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  checkboxLabel: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  cancelButton: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
});
