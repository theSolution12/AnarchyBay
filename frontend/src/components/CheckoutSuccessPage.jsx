import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import { getPurchase, getPurchasesByOrder, getDownloadUrls } from "@/services/purchase.service";
import NavBar from "./NavBar";
import BlueTick from "./ui/BlueTick";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ArrowRight, Library, ShoppingBag, Loader2, Sparkles, ShieldCheck, Mail, Printer, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState("idle"); // idle, preparing, downloading, completed, failed
  const downloadTriggered = useRef(false);

  const purchaseId = searchParams.get("purchase_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!purchaseId && !orderId) {
      setError("No purchase or order found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let results = [];
        if (orderId) {
          results = await getPurchasesByOrder(orderId);
        } else if (purchaseId) {
          const result = await getPurchase(purchaseId);
          results = [result];
        }
        
        if (!results || results.length === 0) {
          throw new Error("Purchase details not found");
        }

        setPurchases(results);
      } catch (err) {
        console.error("Failed to fetch purchase details:", err);
        setError(err.message || "Failed to load purchase details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, purchaseId, orderId]);

  // Auto-download logic
  useEffect(() => {
    if (purchases.length > 0 && downloadStatus === "idle" && !downloadTriggered.current) {
      handleAutoDownload();
    }
  }, [purchases, downloadStatus]);

  const handleAutoDownload = async () => {
    if (downloadTriggered.current) return;
    downloadTriggered.current = true;
    
    setDownloadStatus("preparing");
    try {
      toast.success("Preparing your downloads...", { icon: "🚀" });
      
      for (const purchase of purchases) {
        try {
          const downloadData = await getDownloadUrls(purchase.id);
          const files = downloadData.files || [];
          
          for (const file of files) {
            // Trigger download
            const link = document.createElement("a");
            link.href = file.downloadUrl;
            link.download = file.fileName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Small delay between downloads to prevent browser blocking
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        } catch (err) {
          console.error(`Failed to download purchase ${purchase.id}:`, err);
        }
      }
      
      setDownloadStatus("completed");
      toast.success("Downloads started successfully!");
    } catch (err) {
      console.error("Auto-download failed:", err);
      setDownloadStatus("failed");
      toast.error("Auto-download failed. You can download manually below.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="pt-32 flex flex-col items-center justify-center p-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center max-w-md"
          >
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-blue-100 blur-3xl rounded-full opacity-50 scale-150 animate-pulse"></div>
              <Loader2 className="w-20 h-20 text-black animate-spin relative z-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black">Verifying Payment</h2>
            <p className="text-gray-500 font-bold mt-4 px-6">We're finalizing your transaction and securing your assets. This usually takes just a few seconds.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-32 pb-12 max-w-2xl mx-auto px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border-4 border-black shadow-[8px_8px_0px_var(--black)] p-10 text-center"
          >
            <div className="w-20 h-20 bg-red-100 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-6">
              <span className="text-4xl font-black text-black">!</span>
            </div>
            <h1 className="text-3xl font-black mb-4 uppercase italic tracking-tight text-black">Something went wrong</h1>
            <p className="text-gray-600 mb-8 font-bold leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/library"
                className="px-8 py-4 bg-black text-white border-3 border-black shadow-[4px_4px_0px_var(--black)] font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all flex items-center justify-center gap-2"
              >
                <Library className="w-5 h-5" /> My Library
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-white text-black border-3 border-black shadow-[4px_4px_0px_var(--black)] font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const total = purchases.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const currency = purchases[0]?.currency || "INR";
  const currencySymbol = currency === "INR" ? "₹" : "$";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <NavBar />
      
      {/* Confetti Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              top: "-10%", 
              left: `${Math.random() * 100}%`,
              rotate: 0,
              scale: 0 
            }}
            animate={{ 
              top: "110%",
              rotate: 360,
              scale: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className={`absolute w-3 h-3 rounded-full opacity-40 ${
              ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500"][i % 4]
            }`}
          />
        ))}
      </div>

      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 relative">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-2 border-black/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-white border-b border-black/5 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <BlueTick checked={true} />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl sm:text-6xl font-black uppercase italic mb-4 tracking-tight text-black">
                Order <span className="text-blue-600">Confirmed</span>
              </h1>
              <p className="font-bold text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                Thank you for your purchase! Your assets are now available in your library and ready for download.
              </p>
            </motion.div>

            {/* Background elements */}
            <div className="absolute top-0 left-0 p-8 opacity-5">
              <Sparkles className="w-32 h-32" />
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 bg-white">
            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12">
              {/* Left Column: Details */}
              <div className="space-y-10">
                {/* Items Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" /> Purchased Items
                    </h3>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {purchases.length} Product{purchases.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {purchases.map((purchase, idx) => (
                        <motion.div 
                          key={purchase.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * idx + 0.4 }}
                          className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-black/5 p-5 rounded-2xl hover:border-black/20 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-5 mb-4 sm:mb-0">
                            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-black/5">
                              {purchase.products?.thumbnail_url ? (
                                <img src={purchase.products.thumbnail_url} className="w-full h-full object-cover" alt="" />
                              ) : <ShoppingBag className="w-8 h-8 text-gray-300" />}
                            </div>
                            <div>
                              <p className="font-black text-lg text-black group-hover:text-blue-600 transition-colors">
                                {purchase.products?.name}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <Link 
                                  to={`/download/${purchase.id}`} 
                                  className="text-[11px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                                >
                                  <Download className="w-3 h-3" /> Manual Download
                                </Link>
                                <span className="text-gray-200">|</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ref: {purchase.id.split('-')[0]}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right w-full sm:w-auto sm:pl-8">
                            <p className="font-black text-2xl tracking-tighter text-black">
                              {currencySymbol}{parseFloat(purchase.amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>

                {/* Delivery Info */}
                <section className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row items-start gap-5">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wider text-blue-900 mb-1">Confirmation Sent</h4>
                    <p className="text-blue-800/70 font-bold text-sm leading-relaxed">
                      A detailed receipt and download instructions have been sent to <span className="text-blue-900 font-black">{user?.email || 'your email'}</span>.
                    </p>
                  </div>
                </section>

                {/* Download Status */}
                <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 transition-all duration-500 ${
                  downloadStatus === "completed" ? "bg-green-50 border-green-100" : 
                  downloadStatus === "failed" ? "bg-red-50 border-red-100" : "bg-gray-50 border-black/5"
                }`}>
                  <div className={`p-3 rounded-xl shadow-sm ${
                    downloadStatus === "completed" ? "bg-green-600" : 
                    downloadStatus === "failed" ? "bg-red-600" : "bg-black"
                  }`}>
                    {downloadStatus === "preparing" || downloadStatus === "downloading" ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : downloadStatus === "completed" ? (
                      <ShieldCheck className="w-6 h-6 text-white" />
                    ) : (
                      <Download className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 mb-1">Delivery Pipeline</p>
                    <p className="font-black text-black text-lg">
                      {downloadStatus === "idle" && "Initializing downloads..."}
                      {downloadStatus === "preparing" && "Preparing your assets..."}
                      {downloadStatus === "downloading" && "Downloading files..."}
                      {downloadStatus === "completed" && "Downloads started successfully!"}
                      {downloadStatus === "failed" && "Download interrupted. Use manual links."}
                    </p>
                  </div>
                  {downloadStatus === "failed" && (
                    <button 
                      onClick={() => { downloadTriggered.current = false; handleAutoDownload(); }}
                      className="px-5 py-2.5 bg-black text-white font-black text-xs uppercase rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Receipt & Actions */}
              <div className="space-y-8">
                <div className="bg-black rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <h3 className="font-black text-xl uppercase italic">Invoice</h3>
                    <div className="flex gap-3">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Print Receipt">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View Externally">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center text-white/50">
                      <span className="font-bold uppercase text-[11px] tracking-widest">Subtotal</span>
                      <span className="font-black text-lg">{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/50">
                      <span className="font-bold uppercase text-[11px] tracking-widest">Taxes & Fees</span>
                      <span className="font-black text-lg">{currencySymbol}0.00</span>
                    </div>
                    <div className="border-t border-dashed border-white/20 pt-6 flex justify-between items-end">
                      <div>
                        <span className="font-black uppercase text-xs tracking-widest text-white/40 block mb-1">Total Paid</span>
                        <span className="font-black text-4xl text-white tracking-tighter">
                          {currencySymbol}{total.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-blue-600 text-[10px] font-black uppercase px-2 py-1 rounded-md mb-1 animate-pulse">
                        Paid
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 border-t border-white/10 pt-6">
                    <div>
                      <p className="mb-1 text-white/50">Transaction ID</p>
                      <p className="text-white/60 truncate">{orderId || purchaseId?.split('-')[0] || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-white/50">Timestamp</p>
                      <p className="text-white/60">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => navigate("/library")}
                    className="group w-full py-5 bg-white text-black border-2 border-black rounded-2xl font-black text-xl uppercase italic hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]"
                  >
                    <Library className="w-6 h-6" /> 
                    Go to Library
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/browse")}
                    className="w-full py-4 bg-transparent text-gray-400 font-black text-sm uppercase tracking-[0.2em] hover:text-black transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Support Active 24/7</span>
          </div>
          <p className="text-gray-400 font-bold mb-6 text-sm">Facing issues? Our team is ready to help.</p>
          <div className="flex justify-center gap-10">
            <Link to="/help" className="text-[11px] font-black uppercase tracking-widest text-black border-b-2 border-black/5 hover:border-black transition-all">Help Center</Link>
            <Link to="/contact" className="text-[11px] font-black uppercase tracking-widest text-black border-b-2 border-black/5 hover:border-black transition-all">Support Desk</Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
