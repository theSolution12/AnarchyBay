import {
  validateLicense,
  activateLicense,
  deactivateLicenseOnDevice,
  deactivateAllDevices,
  getLicenseActivations,
  revokeLicense,
} from "../services/license.service.js";

export const validateLicenseController = async (req, res) => {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ error: "License key is required" });
    }

    const result = await validateLicense(licenseKey);
    
    if (!result.valid) {
      return res.status(400).json({ valid: false, error: result.error.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const activateLicenseController = async (req, res) => {
  try {
    const { licenseKey, machineId, deviceName, osInfo } = req.body;

    if (!licenseKey || !machineId) {
      return res.status(400).json({ error: "License key and machine ID are required" });
    }

    const { data, error } = await activateLicense(licenseKey, machineId, {
      deviceName,
      osInfo,
      ipAddress: req.ip,
    });

    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deactivateLicenseController = async (req, res) => {
  try {
    const { licenseKey, machineId } = req.body;

    if (!licenseKey || !machineId) {
      return res.status(400).json({ error: "License key and machine ID are required" });
    }

    const { data, error } = await deactivateLicenseOnDevice(licenseKey, machineId);

    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const revokeAllActivationsController = async (req, res) => {
  try {
    const { licenseKey } = req.params;

    const { data, error } = await deactivateAllDevices(licenseKey, req.user.id);

    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLicenseActivationsController = async (req, res) => {
  try {
    const { licenseKey } = req.params;

    const { data, error } = await getLicenseActivations(licenseKey);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const revokeLicenseController = async (req, res) => {
  try {
    const { licenseKey } = req.params;

    const { data, error } = await revokeLicense(licenseKey, req.user.id);

    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
