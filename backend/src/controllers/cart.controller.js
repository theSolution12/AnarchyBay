import {
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
  isInCart,
} from "../repositories/cart.repository.js";

export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: "Product ID required" });
    
    const { error } = await addToCart(req.user.id, productId, quantity);
    if (error) return res.status(500).json({ error: "Failed to add to cart" });
    
    return res.status(200).json({ message: "Added to cart" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const removeFromCartController = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ error: "Product ID required" });
    
    const { error } = await removeFromCart(req.user.id, productId);
    if (error) return res.status(500).json({ error: "Failed to remove from cart" });
    
    return res.status(200).json({ message: "Removed from cart" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCartController = async (req, res) => {
  try {
    const { data, error } = await getCart(req.user.id);
    if (error) return res.status(500).json({ error: "Failed to get cart" });
    
    return res.status(200).json({ items: data || [] });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const clearCartController = async (req, res) => {
  try {
    const { error } = await clearCart(req.user.id);
    if (error) return res.status(500).json({ error: "Failed to clear cart" });
    
    return res.status(200).json({ message: "Cart cleared" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkCartController = async (req, res) => {
  try {
    const { productId } = req.params;
    const inCart = await isInCart(req.user.id, productId);
    return res.status(200).json({ inCart });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};