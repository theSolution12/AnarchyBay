import {
  createVariant,
  updateVariant,
  deleteVariant,
  getVariant,
  getProductVariants,
} from "../services/variant.service.js";

export const createVariantController = async (req, res) => {
  try {
    const { data, error } = await createVariant(req.user.id, req.params.productId, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateVariantController = async (req, res) => {
  try {
    const { data, error } = await updateVariant(req.user.id, req.params.id, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteVariantController = async (req, res) => {
  try {
    const { error } = await deleteVariant(req.user.id, req.params.id);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getVariantController = async (req, res) => {
  try {
    const { data, error } = await getVariant(req.params.id);
    if (error) {
      return res.status(error.status || 404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductVariantsController = async (req, res) => {
  try {
    const { data, error } = await getProductVariants(req.params.productId);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
