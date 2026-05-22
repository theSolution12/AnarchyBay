import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import { 
    Tag, Plus, X, Calendar, Hash, Percent, 
    Trash2, Edit, Check, AlertCircle, ShoppingBag,
    Link as LinkIcon, ChevronRight, Info, Settings, Package
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DiscountsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [myProducts, setMyProducts] = useState([]);
  
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "percentage",
    value: "",
    max_uses: "",
    expires_at: "",
    product_ids: [],
    scope: "my_products" // "my_products" or "all_products"
  });
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchDiscounts();
    fetchMyProducts();
  }, [isAuthenticated, navigate]);

  const fetchDiscounts = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/discounts/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDiscounts(data.discounts || []);
    } catch (err) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const token = getAccessToken();
      // Check if user is admin
      const profileRes = await fetch(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      setUserRole(profileData.role);

      // Fetch user's own products using the profile data id
      if (profileData.id) {
        const res = await fetch(`${API_URL}/api/profile/user/${profileData.id}/products`);
        const data = await res.json();
        setMyProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.value) {
      toast.error("Please enter code and discount value");
      return;
    }

    try {
      const token = getAccessToken();
      
      // Create the discount code
      const discountRes = await fetch(`${API_URL}/api/discounts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          code: newDiscount.code,
          type: newDiscount.type,
          value: parseFloat(newDiscount.value),
          usageLimit: newDiscount.max_uses ? parseInt(newDiscount.max_uses) : null,
          expiresAt: newDiscount.expires_at || null,
          appliesTo: newDiscount.product_ids.length === 0 ? "all" : "specific"
        })
      });

      if (!discountRes.ok) {
        const error = await discountRes.json();
        throw new Error(error.error || "Failed to create coupon");
      }

      const discountData = await discountRes.json();
      
      // If scope is "all_products" and user is admin, don't link any specific products (site-wide)
      // If scope is "my_products" or user selected specific products, link them
      if (newDiscount.scope === "my_products" && newDiscount.product_ids.length > 0) {
        for (const productId of newDiscount.product_ids) {
          await fetch(`${API_URL}/api/discounts/${discountData.id}/products`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ productId })
          });
        }
      }

      toast.success("Coupon code deployed successfully");
      setShowCreate(false);
      setNewDiscount({ code: "", type: "percentage", value: "", max_uses: "", expires_at: "", product_ids: [], scope: "my_products" });
      fetchDiscounts();
    } catch (err) {
      toast.error(err.message || "Network connection failed");
    }
  };

  const deleteDiscount = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Coupon deleted successfully");
        fetchDiscounts();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const toggleProduct = (pid) => {
    setNewDiscount(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(pid)
        ? prev.product_ids.filter(id => id !== pid)
        : [...prev.product_ids, pid]
    }));
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans">
      <NavBar />
      
      <main className="pt-32 pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Coupons & Rewards</h1>
            <p className="text-gray-500 font-medium text-lg">Manage promotional codes and seller rewards.</p>
          </div>
          
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all ${
                showCreate 
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                : "bg-[#0071e3] text-white shadow-lg shadow-blue-100 hover:bg-[#0077ed]"
            }`}
          >
            {showCreate ? <X size={20} /> : <Plus size={20} />}
            {showCreate ? "Cancel" : "Create New Coupon"}
          </button>
        </header>

        {showCreate && (
          <div className="mb-16 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
                <form onSubmit={handleCreate} className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Coupon String</label>
                            <input 
                                type="text" 
                                value={newDiscount.code}
                                onChange={e => setNewDiscount(p => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                                placeholder="SUMMER2025"
                                className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] text-2xl font-black tracking-tight outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Discount Type</label>
                                <select 
                                    value={newDiscount.type}
                                    onChange={e => setNewDiscount(p => ({ ...p, type: e.target.value }))}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Value</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={newDiscount.value}
                                        onChange={e => setNewDiscount(p => ({ ...p, value: e.target.value }))}
                                        placeholder="20"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all pr-12"
                                        required
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300">
                                        {newDiscount.type === 'percentage' ? '%' : '₹'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Max Activations</label>
                                <input 
                                    type="number" 
                                    value={newDiscount.max_uses}
                                    onChange={e => setNewDiscount(p => ({ ...p, max_uses: e.target.value }))}
                                    placeholder="Unlimited"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Expiration Date</label>
                                <input 
                                    type="date" 
                                    value={newDiscount.expires_at}
                                    onChange={e => setNewDiscount(p => ({ ...p, expires_at: e.target.value }))}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-5 bg-[#0071e3] text-white font-bold rounded-2xl hover:bg-[#0077ed] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3"
                        >
                            Deploy Coupon <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 h-full">
                            {userRole === 'admin' && (
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Coupon Scope</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewDiscount(p => ({ ...p, scope: "my_products", product_ids: [] }))}
                                            className={`p-4 rounded-xl text-sm font-bold transition-all ${
                                                newDiscount.scope === "my_products"
                                                    ? "bg-[#0071e3] text-white shadow-md"
                                                    : "bg-white border border-gray-200 hover:border-blue-200"
                                            }`}
                                        >
                                            My Products
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewDiscount(p => ({ ...p, scope: "all_products", product_ids: [] }))}
                                            className={`p-4 rounded-xl text-sm font-bold transition-all ${
                                                newDiscount.scope === "all_products"
                                                    ? "bg-[#0071e3] text-white shadow-md"
                                                    : "bg-white border border-gray-200 hover:border-blue-200"
                                            }`}
                                        >
                                            All Products
                                        </button>
                                    </div>
                                </div>
                            )}
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <ShoppingBag size={16} /> {newDiscount.scope === "all_products" ? "Site-wide Coupon" : "Product Linking (Optional)"}
                            </h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {newDiscount.scope === "all_products" ? (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <Package size={40} className="text-blue-600" />
                                        </div>
                                        <p className="text-lg font-black text-blue-600 mb-2">Site-wide Coupon Active</p>
                                        <p className="text-sm text-gray-500">This coupon will apply to ALL products in the marketplace</p>
                                    </div>
                                ) : myProducts.length > 0 ? (
                                    myProducts.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => toggleProduct(p.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold text-sm transition-all group ${
                                                newDiscount.product_ids.includes(p.id) 
                                                    ? "bg-[#0071e3] text-white shadow-md" 
                                                    : "bg-white border border-gray-100 hover:border-blue-200"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${newDiscount.product_ids.includes(p.id) ? 'bg-white/20' : 'bg-gray-100'}`}>
                                                    {p.thumbnail_url ? (
                                                        <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={16} />
                                                    )}
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <span className="truncate block">{p.name}</span>
                                                    <span className={`text-[10px] font-bold ${newDiscount.product_ids.includes(p.id) ? 'text-white/70' : 'text-gray-400'}`}>
                                                        {p.currency === 'INR' ? '₹' : '$'}{p.price}
                                                    </span>
                                                </div>
                                            </div>
                                            {newDiscount.product_ids.includes(p.id) ? <Check size={16} /> : <Plus size={16} className="text-gray-300 group-hover:text-blue-500" />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Package size={32} className="text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 font-medium mb-2">No products found</p>
                                        <p className="text-[11px] text-gray-400">Create products first to link them to coupons</p>
                                    </div>
                                )}
                            </div>
                            {newDiscount.scope !== "all_products" && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-[10px] font-bold text-blue-600 text-center uppercase tracking-widest">
                                        {newDiscount.product_ids.length === 0 
                                            ? `✨ Applies to ALL your products (${myProducts.length})` 
                                            : `🎯 Specific - Applies to ${newDiscount.product_ids.length} selected product${newDiscount.product_ids.length > 1 ? 's' : ''}`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
                [...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-50 rounded-[2.5rem] animate-pulse" />
                ))
            ) : discounts.length > 0 ? (
                discounts.map(d => (
                    <div key={d.id} className="bg-white rounded-[2.2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative group overflow-hidden">
                        {!d.is_active && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <span className="px-6 py-2 bg-red-50 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest border border-red-100 shadow-sm">Inactive Code</span>
                            </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="px-3 py-1 bg-blue-50 text-[#0071e3] rounded-lg text-[10px] font-black uppercase tracking-widest inline-block mb-3">
                                    {d.type === 'percentage' ? 'Percentage' : 'Fixed'}
                                </div>
                                <h3 className="text-3xl font-black tracking-tight text-gray-900">{d.code}</h3>
                            </div>
                            <button 
                                onClick={() => deleteDiscount(d.id)}
                                className="p-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-black text-[#1d1d1f]">
                                    {d.type === 'percentage' ? `${d.value}%` : `₹${d.value}`}
                                    <span className="text-sm font-bold text-gray-400 ml-1">OFF</span>
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    <Calendar size={12} />
                                    {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'No Expiry'}
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Usage</div>
                                <div className="text-sm font-bold">
                                    {d.current_uses} / <span className="text-gray-400">{d.max_uses || '∞'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <Tag size={12} />
                                {d.product_ids?.length ? `${d.product_ids.length} Products` : 'Site-wide'}
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[#0071e3] transition-colors">
                                <Settings size={14} />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-40 text-center rounded-[3rem] bg-gray-50 border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-8 text-gray-200">
                        <Tag size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight mb-2">No Active Promotions</h3>
                    <p className="text-gray-500 font-medium mb-10">Start boosting your sales with custom discount nodes.</p>
                    <button 
                        onClick={() => setShowCreate(true)}
                        className="px-10 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-gray-800 transition-all shadow-xl"
                    >
                        Initialize First Code <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
