import { supabase } from "../lib/supabase.js";

export const createDownloadLog = async (logData) => {
  return await supabase
    .from("download_logs")
    .insert(logData)
    .select()
    .single();
};

export const findDownloadLogsByPurchase = async (purchaseId) => {
  return await supabase
    .from("download_logs")
    .select("*")
    .eq("purchase_id", purchaseId)
    .order("downloaded_at", { ascending: false });
};

export const findDownloadLogsByFile = async (fileId) => {
  return await supabase
    .from("download_logs")
    .select("*")
    .eq("file_id", fileId)
    .order("downloaded_at", { ascending: false });
};

export const countDownloadsByPurchase = async (purchaseId) => {
  return await supabase
    .from("download_logs")
    .select("*", { count: "exact", head: true })
    .eq("purchase_id", purchaseId);
};

export const countDownloadsByProduct = async (productId, options = {}) => {
  const { startDate, endDate } = options;

  let query = supabase
    .from("download_logs")
    .select("*, purchases!inner(product_id)", { count: "exact", head: true })
    .eq("purchases.product_id", productId);

  if (startDate) {
    query = query.gte("downloaded_at", startDate);
  }

  if (endDate) {
    query = query.lte("downloaded_at", endDate);
  }

  return await query;
};
