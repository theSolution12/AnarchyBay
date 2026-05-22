import { supabase } from "../lib/supabase.js";

export const createDiscountCode = async (discountData) => {
  return await supabase
    .from("discount_codes")
    .insert(discountData)
    .select()
    .single();
};

export const updateDiscountCode = async (id, discountData) => {
  return await supabase
    .from("discount_codes")
    .update({ ...discountData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
};

export const deleteDiscountCode = async (id) => {
  return await supabase
    .from("discount_codes")
    .delete()
    .eq("id", id);
};

export const findDiscountCodeById = async (id) => {
  return await supabase
    .from("discount_codes")
    .select("*")
    .eq("id", id)
    .single();
};

export const findDiscountCodeByCode = async (code) => {
  return await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();
};

export const findDiscountCodesByCreator = async (creatorId, options = {}) => {
  const { page = 1, limit = 20, active } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("discount_codes")
    .select("*", { count: "exact" })
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (active !== undefined) {
    query = query.eq("is_active", active);
  }

  return await query;
};

export const incrementDiscountUsage = async (id) => {
  const { data: current } = await supabase
    .from("discount_codes")
    .select("times_used")
    .eq("id", id)
    .single();

  if (!current) return { error: { message: "Discount code not found" } };

  return await supabase
    .from("discount_codes")
    .update({ times_used: current.times_used + 1 })
    .eq("id", id)
    .select()
    .single();
};

export const associateDiscountWithProduct = async (discountId, productId) => {
  return await supabase
    .from("discount_code_products")
    .insert({ discount_code_id: discountId, product_id: productId })
    .select()
    .single();
};

export const removeDiscountProductAssociation = async (discountId, productId) => {
  return await supabase
    .from("discount_code_products")
    .delete()
    .eq("discount_code_id", discountId)
    .eq("product_id", productId);
};

export const findProductsForDiscount = async (discountId) => {
  return await supabase
    .from("discount_code_products")
    .select("product_id, products(*)")
    .eq("discount_code_id", discountId);
};

export const isDiscountValidForProduct = async (discountId, productId) => {
  const { data: discount } = await findDiscountCodeById(discountId);
  
  if (!discount) return false;
  if (!discount.is_active) return false;
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) return false;
  if (discount.usage_limit && discount.times_used >= discount.usage_limit) return false;

  if (discount.applies_to === "all") return true;

  const { data: association } = await supabase
    .from("discount_code_products")
    .select("*")
    .eq("discount_code_id", discountId)
    .eq("product_id", productId)
    .single();

  return !!association;
};
