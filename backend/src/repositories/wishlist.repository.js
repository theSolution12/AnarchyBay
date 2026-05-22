import { supabase } from "../lib/supabase.js";

export const addToWishlist = async (userId, productId) => {
  return await supabase
    .from("wishlists")
    .upsert({ user_id: userId, product_id: productId })
    .select()
    .single();
};

export const removeFromWishlist = async (userId, productId) => {
  return await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
};

export const getWishlist = async (userId) => {
  return await supabase
    .from("wishlists")
    .select("*, product:products(*, creator:profiles!creator_id(id, name, username, display_name, profile_image_url))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
};

export const isInWishlist = async (userId, productId) => {
  const { data } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  return !!data;
};
