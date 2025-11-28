import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoriteRestaurants: Set<string>;
  favoriteDishes: Set<string>;
  loadFavorites: () => Promise<void>;
  toggleRestaurantFavorite: (restaurantId: string) => Promise<void>;
  toggleDishFavorite: (dishId: string) => Promise<void>;
  isRestaurantFavorite: (restaurantId: string) => boolean;
  isDishFavorite: (dishId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteRestaurants: new Set(),
  favoriteDishes: new Set(),
  
  loadFavorites: async () => {
    try {
      const restaurantsData = await AsyncStorage.getItem('favoriteRestaurants');
      const dishesData = await AsyncStorage.getItem('favoriteDishes');
      
      set({
        favoriteRestaurants: new Set(restaurantsData ? JSON.parse(restaurantsData) : []),
        favoriteDishes: new Set(dishesData ? JSON.parse(dishesData) : []),
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  },
  
  toggleRestaurantFavorite: async (restaurantId: string) => {
    const { favoriteRestaurants } = get();
    const newFavorites = new Set(favoriteRestaurants);
    
    if (newFavorites.has(restaurantId)) {
      newFavorites.delete(restaurantId);
    } else {
      newFavorites.add(restaurantId);
    }
    
    set({ favoriteRestaurants: newFavorites });
    
    try {
      await AsyncStorage.setItem(
        'favoriteRestaurants',
        JSON.stringify(Array.from(newFavorites))
      );
    } catch (error) {
      console.error('Error saving restaurant favorites:', error);
    }
  },
  
  toggleDishFavorite: async (dishId: string) => {
    const { favoriteDishes } = get();
    const newFavorites = new Set(favoriteDishes);
    
    if (newFavorites.has(dishId)) {
      newFavorites.delete(dishId);
    } else {
      newFavorites.add(dishId);
    }
    
    set({ favoriteDishes: newFavorites });
    
    try {
      await AsyncStorage.setItem(
        'favoriteDishes',
        JSON.stringify(Array.from(newFavorites))
      );
    } catch (error) {
      console.error('Error saving dish favorites:', error);
    }
  },
  
  isRestaurantFavorite: (restaurantId: string) => {
    return get().favoriteRestaurants.has(restaurantId);
  },
  
  isDishFavorite: (dishId: string) => {
    return get().favoriteDishes.has(dishId);
  },
}));
