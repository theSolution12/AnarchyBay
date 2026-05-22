import { supabase } from "../lib/supabase.js";

export const createPayout = async (payoutData) => {
  return await supabase
    .from("payouts")
    .insert(payoutData)
    .select()
    .single();
};

export const updatePayout = async (id, payoutData) => {
  return await supabase
    .from("payouts")
    .update(payoutData)
    .eq("id", id)
    .select()
    .single();
};

export const findPayoutById = async (id) => {
  return await supabase
    .from("payouts")
    .select("*")
    .eq("id", id)
    .single();
};

export const findPayoutsByCreator = async (creatorId, options = {}) => {
  const { page = 1, limit = 20, status } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("payouts")
    .select("*", { count: "exact" })
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  return await query;
};

export const getPendingPayoutAmount = async (creatorId) => {
  const { data, error } = await supabase
    .from("payouts")
    .select("amount")
    .eq("creator_id", creatorId)
    .eq("status", "pending");

  if (error) return { error };

  const total = data?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  return { data: total };
};

export const getCompletedPayoutTotal = async (creatorId) => {
  const { data, error } = await supabase
    .from("payouts")
    .select("amount")
    .eq("creator_id", creatorId)
    .eq("status", "completed");

  if (error) return { error };

  const total = data?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  return { data: total };
};
