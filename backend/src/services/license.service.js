import {
  createLicenseActivation,
  findActivationsByLicenseKey,
  countActiveActivations,
  deactivateLicense,
  deactivateAllLicenses,
  findActivationByMachine,
} from "../repositories/license.repository.js";
import { findPurchaseByLicenseKey, updatePurchase } from "../repositories/purchase.repository.js";

const DEFAULT_ACTIVATION_LIMIT = 5;

export const validateLicense = async (licenseKey) => {
  const { data: purchase, error } = await findPurchaseByLicenseKey(licenseKey);

  if (error || !purchase) {
    return { valid: false, error: { message: "Invalid license key" } };
  }

  if (purchase.status !== "completed") {
    return { valid: false, error: { message: "Purchase not completed" } };
  }

  if (purchase.status === "refunded") {
    return { valid: false, error: { message: "Purchase has been refunded" } };
  }

  return {
    valid: true,
    license: {
      licenseKey: purchase.license_key,
      productId: purchase.product_id,
      productName: purchase.products?.name,
      variantId: purchase.variant_id,
      purchasedAt: purchase.purchased_at,
    },
  };
};

export const activateLicense = async (licenseKey, machineId, deviceInfo = {}) => {
  const validation = await validateLicense(licenseKey);

  if (!validation.valid) {
    return { error: validation.error };
  }

  const { data: existingActivation } = await findActivationByMachine(licenseKey, machineId);

  if (existingActivation && existingActivation.is_active) {
    return {
      data: {
        activated: true,
        message: "License already activated on this device",
        activation: existingActivation,
      },
    };
  }

  const { count: activeCount } = await countActiveActivations(licenseKey);
  const activationLimit = DEFAULT_ACTIVATION_LIMIT;

  if (activeCount >= activationLimit) {
    return {
      error: {
        message: `Activation limit reached (${activationLimit} devices)`,
        status: 400,
      },
    };
  }

  const { data, error } = await createLicenseActivation({
    license_key: licenseKey,
    machine_id: machineId,
    device_name: deviceInfo.deviceName || null,
    os_info: deviceInfo.osInfo || null,
    ip_address: deviceInfo.ipAddress || null,
    is_active: true,
  });

  if (error) {
    return { error };
  }

  return {
    data: {
      activated: true,
      message: "License activated successfully",
      activation: data,
      remainingActivations: activationLimit - activeCount - 1,
    },
  };
};

export const deactivateLicenseOnDevice = async (licenseKey, machineId) => {
  const { data, error } = await deactivateLicense(licenseKey, machineId);

  if (error) {
    return { error };
  }

  return { data: { deactivated: true, message: "License deactivated on this device" } };
};

export const deactivateAllDevices = async (licenseKey, creatorId) => {
  const { data: purchase } = await findPurchaseByLicenseKey(licenseKey);

  if (!purchase) {
    return { error: { message: "License not found", status: 404 } };
  }

  if (purchase.products?.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  await deactivateAllLicenses(licenseKey);

  return { data: { deactivated: true, message: "All activations revoked" } };
};

export const getLicenseActivations = async (licenseKey) => {
  return await findActivationsByLicenseKey(licenseKey);
};

export const revokeLicense = async (licenseKey, creatorId) => {
  const { data: purchase } = await findPurchaseByLicenseKey(licenseKey);

  if (!purchase) {
    return { error: { message: "License not found", status: 404 } };
  }

  if (purchase.products?.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  await deactivateAllLicenses(licenseKey);

  return { data: { revoked: true, message: "License has been revoked" } };
};
