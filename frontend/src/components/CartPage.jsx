import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import { useRazorpay } from "react-razorpay";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  X,
  Lock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const { Razorpay } = useRazorpay();
  const isRazorpayTestFlow = import.meta.env.VITE_RAZORPAY_TEST_FLOW === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) =>
        prev.filter((item) => item.product_id !== productId),
      );
      toast.success("Removed from cart");
      if (appliedDiscount) {
        validateCoupon(couponCode);
      }
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const validateCoupon = async (code) => {
    if (!code.trim()) {
      setAppliedDiscount(null);
      return;
    }

    setValidatingCoupon(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/discounts/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedDiscount(data.discount);
        toast.success(
          `Coupon applied: ${data.discount.type === "percentage" ? `${data.discount.value}%` : `₹${data.discount.value}`} off`,
        );
      } else {
        setAppliedDiscount(null);
        toast.error(data.error || "Invalid coupon code");
      }
    } catch {
      setAppliedDiscount(null);
      toast.error("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(null);
    toast.success("Coupon removed");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!isRazorpayTestFlow && !razorpayKey) {
      toast.error(
        "Missing Razorpay public key. Set VITE_RAZORPAY_KEY_ID in the frontend env.",
      );
      return;
    }

    setCheckingOut(true);
    try {
      const token = getAccessToken();
      const productIds = cartItems.map((item) => item.product_id);

      const orderRes = await fetch(
        `${API_URL}/api/purchases/checkout/razorpay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productIds,
            discountCode: appliedDiscount ? couponCode : undefined,
          }),
        },
      );

      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.error || "Failed to create order");

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Anarchy Bay",
        description: `Purchase of ${cartItems.length} items`,
        image: "/favicon_io/android-chrome-512x512.png",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${API_URL}/api/purchases/verify/razorpay`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            if (verifyRes.ok) {
              toast.success("Payment successful!");
              for (const item of cartItems) {
                await fetch(`${API_URL}/api/cart/${item.product_id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
              }
              navigate(`/checkout/success?order_id=${orderData.orderId}`);
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Error verifying payment");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#000000",
        },
      };

      if (isRazorpayTestFlow) {
        const verifyRes = await fetch(
          `${API_URL}/api/purchases/verify/razorpay`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `test_payment_${orderData.orderId}`,
              razorpay_signature: "test_signature",
            }),
          },
        );

        if (!verifyRes.ok) {
          const verifyData = await verifyRes.json();
          throw new Error(
            verifyData.error || "Failed to complete test checkout",
          );
        }

        toast.success("Test payment completed!");
        for (const item of cartItems) {
          await fetch(`${API_URL}/api/cart/${item.product_id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        navigate(`/checkout/success?order_id=${orderData.orderId}`);
        return;
      }

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0),
    0,
  );
  const currency = cartItems[0]?.product?.currency || "INR";
  const currencySymbol = currency === "INR" ? "₹" : "$";

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      discountAmount = (subtotal * appliedDiscount.value) / 100;
    } else {
      discountAmount = appliedDiscount.value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = subtotal - discountAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <NavBar />
        <main className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-16 w-64 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl" />
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-48 bg-gradient-to-r from-gray-200 to-gray-100 rounded-3xl"
                    />
                  ))}
                </div>
                <div className="lg:col-span-4 h-[600px] bg-gradient-to-br from-gray-200 to-gray-100 rounded-3xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <NavBar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200"
              >
                <ShoppingBag className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight"
                >
                  Shopping Cart
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-gray-500 font-semibold mt-2"
                >
                  <motion.span
                    key={cartItems.length}
                    initial={{ scale: 1.5, color: "#ec4899" }}
                    animate={{ scale: 1, color: "#6b7280" }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    {cartItems.length}
                  </motion.span>{" "}
                  {cartItems.length === 1 ? "item" : "items"} in your cart
                </motion.p>
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white rounded-[3rem] p-16 sm:p-24 text-center shadow-2xl shadow-blue-100 border border-gray-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full blur-3xl opacity-50 -ml-48 -mb-48" />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-gray-200"
                >
                  <ShoppingBag className="w-20 h-20 text-gray-300" />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-black text-gray-900 mb-6"
                >
                  Your cart is empty
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-gray-500 font-medium mb-12 max-w-md mx-auto leading-relaxed"
                >
                  Discover amazing digital products and start building your
                  collection today
                </motion.p>
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/browse")}
                  className="group inline-flex items-center gap-4 px-12 py-6 font-black text-lg bg-gradient-to-r from-blue-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-pink-300 transition-all duration-300"
                >
                  <Sparkles className="w-6 h-6" />
                  Explore Products
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-8 space-y-6">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="group relative bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:shadow-blue-100 hover:border-blue-200 transition-all duration-500 overflow-hidden"
                    >
                      {/* Decorative gradient */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-32 -mt-32" />

                      <Link
                        to={`/product/${item.product_id}`}
                        className="relative w-full sm:w-40 h-52 sm:h-40 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
                      >
                        {item.product?.thumbnail_url ? (
                          <img
                            src={item.product.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            📦
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>

                      <div className="relative flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <Link
                              to={`/product/${item.product_id}`}
                              className="font-black text-2xl sm:text-3xl text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 tracking-tight leading-tight"
                            >
                              {item.product?.name || "Product"}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.product_id)}
                              className="flex-shrink-0 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Remove"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <p className="text-gray-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                            {item.product?.short_description ||
                              item.product?.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Digital Download
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-full">
                              <Zap className="w-3.5 h-3.5" />
                              Instant Access
                            </span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            {appliedDiscount && (
                              <span className="font-bold text-xl text-gray-400 line-through">
                                {currencySymbol}
                                {item.product?.price || 0}
                              </span>
                            )}
                            <span
                              className={`font-black text-3xl tracking-tight ${appliedDiscount ? "text-green-600" : "text-gray-900"}`}
                            >
                              {appliedDiscount ? (
                                <>
                                  {currencySymbol}
                                  {(
                                    parseFloat(item.product?.price || 0) -
                                    (appliedDiscount.type === "percentage"
                                      ? (parseFloat(item.product?.price || 0) *
                                          appliedDiscount.value) /
                                        100 /
                                        cartItems.length
                                      : appliedDiscount.value /
                                        cartItems.length)
                                  ).toFixed(2)}
                                </>
                              ) : (
                                <>
                                  {currencySymbol}
                                  {item.product?.price || 0}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-8 py-12 opacity-50">
                  <div className="flex items-center gap-2 text-gray-600">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-bold">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Lock className="w-5 h-5" />
                    <span className="text-sm font-bold">256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm font-bold">Instant Delivery</span>
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative bg-white rounded-3xl p-8 shadow-2xl shadow-pink-100 border border-gray-100 overflow-hidden"
                  >
                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full blur-3xl opacity-30 -ml-32 -mb-32" />

                    <div className="relative">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200"
                        >
                          <CreditCard className="w-6 h-6 text-white" />
                        </motion.div>
                        <h2 className="font-black text-2xl text-gray-900">
                          Order Summary
                        </h2>
                      </motion.div>

                      <div className="space-y-5 mb-8">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold">
                            Subtotal
                          </span>
                          <span className="text-gray-900 font-black text-xl">
                            {currencySymbol}
                            {subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold">
                            Tax
                          </span>
                          <span className="text-gray-900 font-black text-xl">
                            {currencySymbol}0.00
                          </span>
                        </div>
                        {appliedDiscount && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4 rounded-2xl border border-green-200 shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-bold text-sm">
                                Discount ({couponCode})
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-xl text-green-600">
                                -{currencySymbol}
                                {discountAmount.toFixed(2)}
                              </span>
                              <button
                                onClick={removeCoupon}
                                className="text-green-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Coupon Input */}
                      {!appliedDiscount && (
                        <div className="mb-8 pb-8 border-b border-gray-100">
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Have a coupon code?
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) =>
                                setCouponCode(e.target.value.toUpperCase())
                              }
                              placeholder="ENTER CODE"
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-sm uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                              onKeyDown={(e) =>
                                e.key === "Enter" && validateCoupon(couponCode)
                              }
                            />
                            <button
                              onClick={() => validateCoupon(couponCode)}
                              disabled={validatingCoupon || !couponCode.trim()}
                              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
                            >
                              {validatingCoupon ? "..." : "Apply"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                              Total Amount
                            </span>
                            <span className="font-black text-5xl text-gray-900 tracking-tighter">
                              {currencySymbol}
                              {total.toFixed(2)}
                            </span>
                          </div>
                          {appliedDiscount && (
                            <div className="text-right">
                              <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-black rounded-full">
                                SAVE {currencySymbol}
                                {discountAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Checkout Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        className="group w-full py-5 font-black text-lg bg-gradient-to-r from-blue-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-pink-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {checkingOut ? (
                          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Proceed to Payment
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </motion.button>

                      {/* Social Proof */}
                      <div className="mt-8 text-center">
                        <div className="flex justify-center -space-x-3 mb-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-md"
                            >
                              <img
                                src={`https://i.pravatar.cc/100?img=${i + 15}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                          Join{" "}
                          <span className="text-gray-900 font-black">
                            2,000+
                          </span>{" "}
                          creators who trust us daily
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
