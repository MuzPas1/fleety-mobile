import { supabase } from './supabase';

export async function createOrder({ userId, restaurantId, items, total }) {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        restaurant_id: restaurantId,
        items: items,
        total_amount: total,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase order creation error:", error);
    throw error;
  }

  return data;
}
