import { supabase } from "../lib/supabase.js";

export const createLicenseActivation = async (activationData) => {
  return await supabase
    .from("license_activations")
    .insert(activationData)
    .select()
    .single();
};

export const findActivationsByLicenseKey = async (licenseKey) => {
  return await supabase
    .from("license_activations")
    .select("*")
    .eq("license_key", licenseKey)
    .eq("is_active", true)
    .order("activated_at", { ascending: false });
};

export const countActiveActivations = async (licenseKey) => {
  return await supabase
    .from("license_activations")
    .select("*", { count: "exact", head: true })
    .eq("license_key", licenseKey)
    .eq("is_active", true);
};

export const deactivateLicense = async (licenseKey, machineId) => {
  return await supabase
    .from("license_activations")
    .update({ is_active: false, deactivated_at: new Date().toISOString() })
    .eq("license_key", licenseKey)
    .eq("machine_id", machineId)
    .select()
    .single();
};

export const deactivateAllLicenses = async (licenseKey) => {
  return await supabase
    .from("license_activations")
    .update({ is_active: false, deactivated_at: new Date().toISOString() })
    .eq("license_key", licenseKey);
};

export const findActivationByMachine = async (licenseKey, machineId) => {
  return await supabase
    .from("license_activations")
    .select("*")
    .eq("license_key", licenseKey)
    .eq("machine_id", machineId)
    .single();
};
