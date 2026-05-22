import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isInWishlist,
} from "../repositories/wishlist.repository.js";

export const addToWishlistController = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Product ID required" });
    
    const { error } = await addToWishlist(req.user.id, productId);
    if (error) return res.status(500).json({ error: "Failed to add to wishlist" });
    
    return res.status(200).json({ message: "Added to wishlist" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const removeFromWishlistController = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ error: "Product ID required" });
    
    const { error } = await removeFromWishlist(req.user.id, productId);
    if (error) return res.status(500).json({ error: "Failed to remove from wishlist" });
    
    return res.status(200).json({ message: "Removed from wishlist" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getWishlistController = async (req, res) => {
  try {
    const { data, error } = await getWishlist(req.user.id);
    if (error) return res.status(500).json({ error: "Failed to get wishlist" });
    
    return res.status(200).json({ items: data || [] });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkWishlistController = async (req, res) => {
  try {
    const { productId } = req.params;
    const inWishlist = await isInWishlist(req.user.id, productId);
    return res.status(200).json({ inWishlist });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};