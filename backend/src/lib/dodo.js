import DodoPayments from "dodopayments";

let dodoClient = null;

if (process.env.DODO_API_KEY) {
  dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY,
    environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
  });
} else {
  console.warn("DODO_API_KEY not configured. Dodo Payments features will be disabled.");
}

export { dodoClient };