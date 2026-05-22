import {
  requestPayout,
  getPayout,
  getMyPayouts,
  getPayoutEligibility,
} from "../services/payout.service.js";

export const requestPayoutController = async (req, res) => {
  try {
    const { amount } = req.body;

    const { data, error } = await requestPayout(req.user.id, amount);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPayoutController = async (req, res) => {
  try {
    const { data, error } = await getPayout(req.params.id);
    if (error || !data) {
      return res.status(404).json({ error: "Payout not found" });
    }

    if (data.creator_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyPayoutsController = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
    };

    const { data, error, count } = await getMyPayouts(req.user.id, options);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      payouts: data,
      total: count,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(count / options.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPayoutEligibilityController = async (req, res) => {
  try {
    const { data, error } = await getPayoutEligibility(req.user.id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
