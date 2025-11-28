import { create } from 'zustand';

interface AddressState {
  selectedAddress: any | null;
  setSelectedAddress: (address: any) => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),
}));
