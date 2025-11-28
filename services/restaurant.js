import { supabase } from './supabase';

export async function getRestaurantById(id) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Supabase restaurant fetch error:', error);
    throw error;
  }

  return data;
}
