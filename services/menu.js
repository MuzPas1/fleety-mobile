import { supabase } from './supabase';

export async function getMenuItemsForRestaurant(restaurantId) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (error) {
    console.error('Supabase menu fetch error:', error);
    throw error;
  }

  return data;
}
