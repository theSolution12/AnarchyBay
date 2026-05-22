import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscount,
  getMyDiscounts,
  validateDiscount,
  addProductToDiscount,
  removeProductFromDiscount,
  getDiscountProducts,
} from "../services/discount.service.js";
import { findProductById } from "../repositories/product.repository.js";

export const createDiscountController = async (req, res) => {
  try {
    const { data, error } = await createDiscount(req.user.id, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDiscountController = async (req, res) => {
  try {
    const { data, error } = await updateDiscount(req.user.id, req.params.id, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDiscountController = async (req, res) => {
  try {
    const { error } = await deleteDiscount(req.user.id, req.params.id);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Discount code deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDiscountController = async (req, res) => {
  try {
    const { data, error } = await getDiscount(req.params.id);
    if (error || !data) {
      return res.status(404).json({ error: "Discount code not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyDiscountsController = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      active: req.query.active === "true" ? true : req.query.active === "false" ? false : undefined,
    };

    const { data, error, count } = await getMyDiscounts(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      discounts: data,
      total: count,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(count / options.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const validateDiscountController = async (req, res) => {
  try {
    const { code, productId } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Discount code is required" });
    }

    let price = 0;
    if (productId) {
      const { data: product } = await findProductById(productId);
      if (product) {
        price = parseFloat(product.price);
      }
    }

    const result = await validateDiscount(code, productId, price);
    
    if (!result.valid) {
      return res.status(400).json({ valid: false, error: result.error.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addProductToDiscountController = async (req, res) => {
  try {
    const { productId } = req.body;
    const { data, error } = await addProductToDiscount(req.user.id, req.params.id, productId);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const removeProductFromDiscountController = async (req, res) => {
  try {
    const { productId } = req.body;
    const { error } = await removeProductFromDiscount(req.user.id, req.params.id, productId);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Product removed from discount" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDiscountProductsController = async (req, res) => {
  try {
    const { data, error } = await getDiscountProducts(req.params.id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data?.map(d => d.products) || []);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
