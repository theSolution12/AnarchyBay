import {
  createPayout as createPayoutRepo,
  updatePayout as updatePayoutRepo,
  findPayoutById,
  findPayoutsByCreator,
} from "../repositories/payout.repository.js";
import { getCreatorBalance } from "../repositories/analytics.repository.js";

const MINIMUM_PAYOUT_AMOUNT = 10;

export const requestPayout = async (creatorId, amount) => {
  const { data: balance, error: balanceError } = await getCreatorBalance(creatorId);

  if (balanceError) {
    return { error: balanceError };
  }

  if (balance.availableBalance < MINIMUM_PAYOUT_AMOUNT) {
    return {
      error: {
        message: `Minimum payout amount is $${MINIMUM_PAYOUT_AMOUNT}`,
        status: 400,
      },
    };
  }

  const payoutAmount = amount || balance.availableBalance;

  if (payoutAmount > balance.availableBalance) {
    return {
      error: { message: "Insufficient balance", status: 400 },
    };
  }

  if (payoutAmount < MINIMUM_PAYOUT_AMOUNT) {
    return {
      error: {
        message: `Minimum payout amount is $${MINIMUM_PAYOUT_AMOUNT}`,
        status: 400,
      },
    };
  }

  const { data, error } = await createPayoutRepo({
    creator_id: creatorId,
    amount: payoutAmount,
    currency: "USD",
    status: "pending",
  });

  return { data, error };
};

export const processPayout = async (payoutId, paymentDetails) => {
  const { data: payout, error: findError } = await findPayoutById(payoutId);

  if (findError || !payout) {
    return { error: { message: "Payout not found", status: 404 } };
  }

  if (payout.status !== "pending") {
    return { error: { message: "Payout already processed", status: 400 } };
  }

  return await updatePayoutRepo(payoutId, {
    status: "processing",
    payment_provider: paymentDetails.provider,
    stripe_transfer_id: paymentDetails.stripeTransferId || null,
    processed_at: new Date().toISOString(),
  });
};

export const completePayout = async (payoutId) => {
  return await updatePayoutRepo(payoutId, {
    status: "completed",
    completed_at: new Date().toISOString(),
  });
};

export const failPayout = async (payoutId, errorMessage) => {
  return await updatePayoutRepo(payoutId, {
    status: "failed",
    failure_reason: errorMessage,
  });
};

export const getPayout = async (payoutId) => {
  return await findPayoutById(payoutId);
};

export const getMyPayouts = async (creatorId, options = {}) => {
  return await findPayoutsByCreator(creatorId, options);
};

export const getPayoutEligibility = async (creatorId) => {
  const { data: balance, error } = await getCreatorBalance(creatorId);

  if (error) {
    return { error };
  }

  return {
    data: {
      isEligible: balance.availableBalance >= MINIMUM_PAYOUT_AMOUNT,
      availableBalance: balance.availableBalance,
      minimumAmount: MINIMUM_PAYOUT_AMOUNT,
    },
  };
};
