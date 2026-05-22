import { supabase } from "../lib/supabase.js";

export const createReview = async (reviewData) => {
  return await supabase
    .from("reviews")
    .insert(reviewData)
    .select("*, user:profiles!user_id(id, name, username, display_name, profile_image_url)")
    .single();
};

export const updateReview = async (id, reviewData) => {
  return await supabase
    .from("reviews")
    .update({ ...reviewData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, user:profiles!user_id(id, name, username, display_name, profile_image_url)")
    .single();
};

export const deleteReview = async (id) => {
  return await supabase
    .from("reviews")
    .delete()
    .eq("id", id);
};

export const findReviewById = async (id) => {
  return await supabase
    .from("reviews")
    .select("*, user:profiles!user_id(id, name, username, display_name, profile_image_url)")
    .eq("id", id)
    .single();
};

export const findReviewsByProduct = async (productId, options = {}) => {
  const { page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = options;
  const offset = (page - 1) * limit;
  const ascending = sortOrder === "asc";

  return await supabase
    .from("reviews")
    .select("*, user:profiles!user_id(id, name, username, display_name, profile_image_url)", { count: "exact" })
    .eq("product_id", productId)
    .order(sortBy, { ascending })
    .range(offset, offset + limit - 1);
};

export const findUserReviewForProduct = async (productId, userId) => {
  return await supabase
    .from("reviews")
    .select("*, user:profiles!user_id(id, name, username, display_name, profile_image_url)")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .single();
};

export const getProductRatingStats = async (productId) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error || !data || data.length === 0) {
    return { avg: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const count = data.length;
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / count) * 10) / 10;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach(r => distribution[r.rating]++);

  return { avg, count, distribution };
};
