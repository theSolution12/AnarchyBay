import { supabase } from "../lib/supabase.js";

export const createProduct = async (productData) => {
  return await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();
};

export const updateProduct = async (id, productData) => {
  return await supabase
    .from("products")
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
};

export const softDeleteProduct = async (id) => {
  return await supabase
    .from("products")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
};

export const findProductById = async (id) => {
  return await supabase
    .from("products")
    .select("*, creator:profiles!creator_id(id, name, username, display_name, profile_image_url)")
    .eq("id", id)
    .single();
};

export const findProductsByCreator = async (creatorId, options = {}) => {
  const { page = 1, limit = 20, includeInactive = false, sortBy = "created_at", sortOrder = "desc" } = options;
  const offset = (page - 1) * limit;
  const ascending = sortOrder === "asc";

  let query = supabase
    .from("products")
    .select("*, creator:profiles!creator_id(id, name, username, display_name, profile_image_url)", { count: "exact" })
    .eq("creator_id", creatorId)
    .order(sortBy, { ascending })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  return await query;
};

export const findAllProducts = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    search,
    sortBy = "created_at",
    sortOrder = "desc",
    featured,
    tags,
  } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*, creator:profiles!creator_id(id, name, username, display_name, profile_image_url)", { count: "exact" })
    .eq("is_active", true);

  if (category) {
    query = query.contains("category", [category]);
  }

  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (featured !== undefined) {
    query = query.eq("is_featured", featured);
  }

  if (tags && tags.length > 0) {
    query = query.overlaps("tags", tags);
  }

  const ascending = sortOrder === "asc";
  query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

  return await query;
};

export const searchProducts = async (searchQuery, options = {}) => {
  const { page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = options;
  const offset = (page - 1) * limit;
  const ascending = sortOrder === "asc";

  return await supabase
    .from("products")
    .select("*, creator:profiles!creator_id(id, name, username, display_name, profile_image_url)", { count: "exact" })
    .eq("is_active", true)
    .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    .order(sortBy, { ascending })
    .range(offset, offset + limit - 1);
};

export const countProductsByCreator = async (creatorId) => {
  return await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creatorId)
    .eq("is_active", true);
};