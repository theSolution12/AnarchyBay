import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";

const CATEGORIES = ["Design", "Code", "Templates", "E-commerce", "Icons", "Photography", "Productivity", "Education"];
const SHORT_DESC_LIMIT = 200;
const LONG_DESC_LIMIT = 5000;

const PAGE_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Cream", value: "#fffbeb" },
  { name: "Pink", value: "#fdf2f8" },
  { name: "Mint", value: "#ecfdf5" },
  { name: "Sky", value: "#f0f9ff" },
  { name: "Lavender", value: "#faf5ff" },
  { name: "Peach", value: "#fff7ed" },
  { name: "Gray", value: "#f9fafb" },
];

const BUTTON_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
];

const TEXT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#1f2937" },
  { name: "Gray", value: "#6b7280" },
  { name: "White", value: "#ffffff" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/^### (.+)$/gm, "<h3 class='text-base font-semibold mt-3 mb-1'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-lg font-semibold mt-4 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-xl font-bold mt-5 mb-2'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='px-1 py-0.5 bg-slate-100 rounded text-xs font-mono'>$1</code>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-slate-900 underline' target='_blank'>$1</a>")
    .replace(/\n\n/g, "</p><p class='mb-2'>")
    .replace(/\n/g, "<br/>");
  return `<p class='mb-2'>${html}</p>`;
}

export default function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const previewImageInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    long_description: "",
    price: "",
    currency: "INR",
    categories: [],
    tags: "",
    preview_videos: [""],
    preview_images: [],
    page_color: "#ffffff",
    accent_color: "#ffde59",
    button_color: "#ec4899",
    text_color: "#000000",
  });
  const [files, setFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [previewImagePreviews, setPreviewImagePreviews] = useState([]);
  const [showLongDescPreview, setShowLongDescPreview] = useState(false);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [existingPreviewImages, setExistingPreviewImages] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          const p = data.product;
          if (p.creator_id !== user?.id) {
            toast.error("Unauthorized access");
            navigate(`/product/${productId}`);
            return;
          }
          setForm({
            name: p.name || "",
            short_description: p.short_description || "",
            long_description: p.long_description || "",
            price: p.price?.toString() || "",
            currency: p.currency || "INR",
            categories: p.category || [],
            tags: (p.tags || []).join(", "),
            preview_videos: p.preview_videos && p.preview_videos.length > 0 ? p.preview_videos : [""],
            preview_images: [],
            page_color: p.page_color || "#ffffff",
            accent_color: p.accent_color || "#ffde59",
            button_color: p.button_color || "#ec4899",
            text_color: p.text_color || "#000000",
          });
          
          if (p.thumbnail_url) {
            setExistingThumbnail(p.thumbnail_url);
            setThumbnailPreview(p.thumbnail_url);
          }
          
          if (p.preview_images && p.preview_images.length > 0) {
            setExistingPreviewImages(p.preview_images);
            setPreviewImagePreviews(p.preview_images);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load product");
        setLoading(false);
      });
  }, [productId, isAuthenticated, navigate, user?.id]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    toast.success(`${selectedFiles.length} file(s) added`);
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
      setExistingThumbnail(null);
    }
  };

  const handlePreviewImageSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setForm(prev => ({ ...prev, preview_images: [...prev.preview_images, ...selectedFiles] }));
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));
  
  const removePreviewImage = (index) => {
    const totalExisting = existingPreviewImages.length;
    if (index < totalExisting) {
      setExistingPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - totalExisting;
      setForm(prev => ({ ...prev, preview_images: prev.preview_images.filter((_, i) => i !== newIndex) }));
    }
    setPreviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const insertMarkdown = (field, syntax) => {
    setForm(prev => ({ ...prev, [field]: prev[field] + syntax }));
  };

  const updateVideoLink = (index, value) => {
    setForm(prev => {
      const videos = [...prev.preview_videos];
      videos[index] = value;
      return { ...prev, preview_videos: videos };
    });
  };

  const addVideoLink = () => {
    setForm(prev => ({ ...prev, preview_videos: [...prev.preview_videos, ""] }));
  };

  const removeVideoLink = (index) => {
    setForm(prev => ({ ...prev, preview_videos: prev.preview_videos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.price || form.categories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.short_description);
      formData.append("short_description", form.short_description);
      formData.append("long_description", form.long_description);
      formData.append("price", parseFloat(form.price));
      formData.append("currency", form.currency);
      formData.append("category", JSON.stringify(form.categories));
      formData.append("tags", JSON.stringify(form.tags.split(",").map(t => t.trim()).filter(Boolean)));
      formData.append("preview_videos", JSON.stringify(form.preview_videos.filter(v => v.trim())));
      formData.append("page_color", form.page_color);
      formData.append("accent_color", form.accent_color);
      formData.append("button_color", form.button_color);
      formData.append("text_color", form.text_color);
      
      files.forEach(file => formData.append("files", file));
      if (thumbnail) formData.append("thumbnail", thumbnail);
      form.preview_images.forEach(img => formData.append("preview_images", img));

      const token = getAccessToken();
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast.success("Product updated successfully!");
        navigate(`/product/${productId}`);
      } else {
        const data = await response.json();
        toast.error(data.error?.message || "Failed to update product");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-32 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-slate-500">Loading product...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="font-display text-4xl mb-2">Edit Product</h1>
            <p className="text-slate-500">Update your product details and settings</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs">1</span>
                    Product Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g., Premium UI Kit for Figma"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">Short Description</label>
                        <span className={`text-xs ${form.short_description.length > SHORT_DESC_LIMIT * 0.9 ? "text-pink-500 font-medium" : "text-slate-400"}`}>
                          {form.short_description.length}/{SHORT_DESC_LIMIT}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Brief summary for product cards</p>
                      <textarea
                        value={form.short_description}
                        onChange={e => setForm(p => ({ ...p, short_description: e.target.value.slice(0, SHORT_DESC_LIMIT) }))}
                        placeholder="A brief tagline for your product..."
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">Long Description</label>
                        <span className={`text-xs ${form.long_description.length > LONG_DESC_LIMIT * 0.9 ? "text-pink-500 font-medium" : "text-slate-400"}`}>
                          {form.long_description.length}/{LONG_DESC_LIMIT}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Detailed description with markdown support</p>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200">
                          <button type="button" onClick={() => insertMarkdown("long_description", "**bold**")} className="px-2 py-1 text-xs font-bold hover:bg-white rounded transition-colors">B</button>
                          <button type="button" onClick={() => insertMarkdown("long_description", "*italic*")} className="px-2 py-1 text-xs italic hover:bg-white rounded transition-colors">I</button>
                          <button type="button" onClick={() => insertMarkdown("long_description", "`code`")} className="px-2 py-1 text-xs font-mono hover:bg-white rounded transition-colors">&lt;&gt;</button>
                          <button type="button" onClick={() => insertMarkdown("long_description", "\n- ")} className="px-2 py-1 text-xs hover:bg-white rounded transition-colors">List</button>
                          <button type="button" onClick={() => insertMarkdown("long_description", "\n## ")} className="px-2 py-1 text-xs font-bold hover:bg-white rounded transition-colors">H2</button>
                          <button type="button" onClick={() => insertMarkdown("long_description", "[text](url)")} className="px-2 py-1 text-xs hover:bg-white rounded transition-colors">Link</button>
                          <div className="ml-auto">
                            <button type="button" onClick={() => setShowLongDescPreview(!showLongDescPreview)} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${showLongDescPreview ? "bg-slate-900 text-white" : "hover:bg-white"}`}>
                              {showLongDescPreview ? "Edit" : "Preview"}
                            </button>
                          </div>
                        </div>
                        {showLongDescPreview ? (
                          <div className="px-4 py-3 min-h-[180px] text-sm text-slate-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.long_description) || "<p class='text-slate-400'>Nothing to preview...</p>" }} />
                        ) : (
                          <textarea
                            value={form.long_description}
                            onChange={e => setForm(p => ({ ...p, long_description: e.target.value.slice(0, LONG_DESC_LIMIT) }))}
                            placeholder="Describe what's included, features, requirements..."
                            rows={8}
                            className="w-full px-4 py-3 bg-white focus:outline-none resize-none text-sm"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-600">
                            {form.currency === "INR" ? "₹" : "$"}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.price}
                            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                            placeholder="499"
                            className="w-full pl-10 pr-4 py-3 font-semibold text-lg bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                        <select
                          value={form.currency}
                          onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Categories *</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-2 text-sm font-medium rounded-full transition-all ${
                              form.categories.includes(cat)
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={form.tags}
                        onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                        placeholder="e.g., figma, ui-kit, design-system"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs">2</span>
                    Files & Media
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image</label>
                      <div 
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        {thumbnailPreview ? (
                          <div className="relative inline-block">
                            <img src={thumbnailPreview} alt="Thumbnail" className="max-h-40 mx-auto rounded-lg" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setThumbnail(null); setThumbnailPreview(null); setExistingThumbnail(null); }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full text-xs flex items-center justify-center hover:bg-slate-700"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <p className="text-sm font-medium text-slate-600">Click to upload cover image</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                          </>
                        )}
                      </div>
                      <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Additional Product Files</label>
                      <p className="text-xs text-slate-400 mb-2">Upload new files to add to this product</p>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <p className="text-sm font-medium text-slate-600">Click to upload files</p>
                        <p className="text-xs text-slate-400 mt-1">ZIP, PDF, or any file type</p>
                      </div>
                      <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

                      {files.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                          {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3 min-w-0">
                                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <button type="button" onClick={() => removeFile(i)} className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0">
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs">3</span>
                    Preview & Proof
                  </h2>
                  <p className="text-sm text-slate-500 mb-4">Add images and videos to showcase your product</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preview Images</label>
                      <div 
                        onClick={() => previewImageInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-8 h-8 mx-auto mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <p className="text-sm text-slate-500">Add screenshots or preview images</p>
                      </div>
                      <input ref={previewImageInputRef} type="file" accept="image/*" multiple onChange={handlePreviewImageSelect} className="hidden" />

                      {previewImagePreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {previewImagePreviews.map((img, i) => (
                            <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removePreviewImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Video Links</label>
                      <p className="text-xs text-slate-400 mb-2">YouTube or Vimeo links</p>
                      <div className="space-y-2">
                        {form.preview_videos.map((video, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="url"
                              value={video}
                              onChange={e => updateVideoLink(i, e.target.value)}
                              placeholder="https://youtube.com/watch?v=..."
                              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />
                            {form.preview_videos.length > 1 && (
                              <button type="button" onClick={() => removeVideoLink(i)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={addVideoLink} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                          Add another video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs">4</span>
                    Page Customization
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">Customize the appearance of your product page</p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Page Background Color</label>
                      <div className="flex flex-wrap gap-3">
                        {PAGE_COLORS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, page_color: color.value }))}
                            className={`w-12 h-12 rounded-xl border-2 transition-all ${
                              form.page_color === color.value 
                                ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2 scale-110" 
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                        <div className="relative">
                          <input
                            type="color"
                            value={form.page_color}
                            onChange={e => setForm(p => ({ ...p, page_color: e.target.value }))}
                            className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
                          />
                          <div 
                            className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                            style={{ backgroundColor: !PAGE_COLORS.find(c => c.value === form.page_color) ? form.page_color : 'transparent' }}
                          >
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Background color of the product page</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Button Color</label>
                      <div className="flex flex-wrap gap-3">
                        {BUTTON_COLORS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, button_color: color.value }))}
                            className={`w-12 h-12 rounded-xl border-2 transition-all ${
                              form.button_color === color.value 
                                ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2 scale-110" 
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                        <div className="relative">
                          <input
                            type="color"
                            value={form.button_color}
                            onChange={e => setForm(p => ({ ...p, button_color: e.target.value }))}
                            className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
                          />
                          <div 
                            className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                            style={{ backgroundColor: !BUTTON_COLORS.find(c => c.value === form.button_color) ? form.button_color : 'transparent' }}
                          >
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Color for "I want this" button</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Text Color</label>
                      <div className="flex flex-wrap gap-3">
                        {TEXT_COLORS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, text_color: color.value }))}
                            className={`w-12 h-12 rounded-xl border-2 transition-all ${
                              form.text_color === color.value 
                                ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2 scale-110" 
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                        <div className="relative">
                          <input
                            type="color"
                            value={form.text_color}
                            onChange={e => setForm(p => ({ ...p, text_color: e.target.value }))}
                            className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
                          />
                          <div 
                            className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                            style={{ backgroundColor: !TEXT_COLORS.find(c => c.value === form.text_color) ? form.text_color : 'transparent' }}
                          >
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Main text color on the page</p>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: form.page_color, color: form.text_color }}>
                        <p className="text-sm font-medium mb-3">Color Preview</p>
                        <button 
                          type="button"
                          className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm"
                          style={{ backgroundColor: form.button_color }}
                        >
                          I want this
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Preview</h3>
                    
                    <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
                      <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center overflow-hidden">
                        {thumbnailPreview ? (
                          <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-1 truncate">{form.name || "Product Name"}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{form.short_description || "Short description..."}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg">
                            {form.currency === "INR" ? "₹" : "$"}{form.price || "0"}
                          </span>
                          <div className="flex gap-1">
                            {form.categories.slice(0, 2).map((cat, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs font-medium bg-slate-100 rounded-full">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between text-slate-500">
                        <span>New Files</span>
                        <span className="font-medium text-slate-700">{files.length}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Categories</span>
                        <span className="font-medium text-slate-700">{form.categories.length}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Preview Images</span>
                        <span className="font-medium text-slate-700">{previewImagePreviews.length}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-4 font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        "Update Product"
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-medium mb-3">Update Tips</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Update details as needed
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Add new files to existing product
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Refresh preview images
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Customize page appearance
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
