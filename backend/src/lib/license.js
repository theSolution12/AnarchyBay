import crypto from "crypto";

export const generateLicenseKey = () => {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(4).toString("hex").toUpperCase());
  }
  return segments.join("-");
};

export const generateDiscountCode = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const calculateDiscount = (price, discount) => {
  if (discount.type === "percentage") {
    return price * (discount.value / 100);
  } else if (discount.type === "fixed") {
    return Math.min(discount.value, price);
  }
  return 0;
};

export const calculatePlatformFee = (amount, feePercentage = 5) => {
  return amount * (feePercentage / 100);
};
