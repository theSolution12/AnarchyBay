import {
  getDownloadUrl,
  getDownloadUrls,
  canDownload,
} from "../services/download.service.js";

export const getDownloadUrlController = async (req, res) => {
  try {
    const { purchaseId, fileId } = req.params;

    const { data, error } = await getDownloadUrl(req.user.id, purchaseId, fileId);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDownloadUrlsController = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const { data, error } = await getDownloadUrls(req.user.id, purchaseId);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkDownloadAccessController = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await canDownload(req.user.id, productId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
