import { supabase } from "../lib/supabase.js";

export const addToCart = async (userId, productId, quantity = 1) => {
  return await supabase
    .from("carts")
    .upsert({ user_id: userId, product_id: productId, quantity })
    .select()
    .single();
};

export const removeFromCart = async (userId, productId) => {
  return await supabase
    .from("carts")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
};

export const getCart = async (userId) => {
  return await supabase
    .from("carts")
    .select("*, product:products(*, files:product_files(*), creator:profiles!creator_id(id, name, username, display_name, profile_image_url))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
};

export const clearCart = async (userId) => {
  return await supabase
    .from("carts")
    .delete()
    .eq("user_id", userId);
};

export const isInCart = async (userId, productId) => {
  const { data } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  return !!data;
};