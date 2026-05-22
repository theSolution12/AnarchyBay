import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import NavBar from "./NavBar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

const CATEGORIES = ["All", "Design", "Code", "Templates", "E-commerce", "Icons", "Photography", "Productivity"];

export default function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "All";
  const urlTag = searchParams.get("tag") || "";

  const [search, setSearch] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeTag, setActiveTag] = useState(urlTag);

  // Sync with URL params only on mount or when URL changes externally
  const searchParamsKey = `${urlSearch}-${urlCategory}-${urlTag}`;
  useEffect(() => {
    setSearch(urlSearch);
    setActiveCategory(urlCategory);
    setActiveTag(urlTag);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey]);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/products/list`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/products/featured`).then(res => res.json()),
    ]).then(([allData, featuredData]) => {
      setProducts(allData.products || []);
      setFeatured(featuredData.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleTagClick = (tag, e) => {
    e?.stopPropagation();
    setActiveTag(tag);
    navigate(`/browse?tag=${encodeURIComponent(tag)}`);
  };

  const clearTag = () => {
    setActiveTag("");
    navigate("/browse");
  };

  const filtered = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "All" || 
        p.category?.some(c => c.toLowerCase().includes(activeCategory.toLowerCase()));
      const matchesTag = !activeTag || p.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase());
      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating_avg || 0) - (a.rating_avg || 0);
      if (sortBy === "popularity") return (b.sales_count || 0) - (a.sales_count || 0);
      return 0;
    });

  // Get popular tags from products
  const popularTags = [...new Set(products.flatMap(p => p.tags || []))]
    .slice(0, 12);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 lg:mb-12">
            <span className="inline-block px-4 py-2 bg-[var(--pink-200)] border-3 border-black font-bold text-sm uppercase mb-4">
              Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4">
              Discover <span className="text-[var(--pink-500)]">Digital Products</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
              Browse templates, code, designs, and more from creators around India.
            </p>
          </div>

          {activeTag && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm font-bold uppercase text-gray-500">Filtering by tag:</span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pink-500)] text-white font-bold border-3 border-black">
                #{activeTag}
                <button onClick={clearTag} className="hover:text-yellow-300">×</button>
              </span>
            </div>
          )}

          {popularTags.length > 0 && !activeTag && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold uppercase text-gray-500">Popular Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={(e) => handleTagClick(tag, e)}
                    className="px-3 py-1.5 text-sm font-bold bg-white border-2 border-black hover:bg-[var(--pink-100)] hover:shadow-[2px_2px_0px_var(--black)] transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="lg:hidden mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 font-bold text-sm border-3 transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-[var(--pink-500)] text-white border-black shadow-[2px_2px_0px_var(--black)]"
                      : "bg-white border-black hover:bg-[var(--pink-50)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {featured.length > 0 && (
            <div className="mb-8 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Featured Products</h2>
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 24 },
                }}
                className="featured-swiper"
              >
                {featured.map((product) => (
                  <SwiperSlide key={product.id}>
                    <FeaturedCard product={product} navigate={navigate} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] p-6 sticky top-24">
                <h3 className="font-black text-lg uppercase mb-4">Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-4 py-3 font-bold transition-all border-3 ${
                        activeCategory === cat
                          ? "bg-[var(--pink-500)] text-white border-black shadow-[3px_3px_0px_var(--black)]"
                          : "bg-white border-transparent hover:border-black hover:bg-[var(--pink-50)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search products or #tags..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 font-medium bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] focus:outline-none focus:shadow-[6px_6px_0px_var(--black)] transition-all text-base"
                  />
                  <svg className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-4 sm:px-5 py-3 sm:py-4 font-bold bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] cursor-pointer text-sm sm:text-base"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>

              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <p className="font-bold text-gray-600 text-sm sm:text-base">
                  {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200 border-b-3 border-black" />
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="h-4 bg-gray-200 w-1/3" />
                        <div className="h-6 bg-gray-200 w-3/4" />
                        <div className="h-4 bg-gray-200 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] p-8 sm:p-12 text-center">
                  <div className="text-5xl sm:text-6xl mb-4">🔍</div>
                  <h3 className="font-black text-xl sm:text-2xl mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filtered.map((product, i) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      navigate={navigate}
                      onTagClick={handleTagClick}
                      delay={i * 0.05}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeaturedCard({ product, navigate }) {
  const creatorName = product.creator?.display_name || product.creator?.name || "Anonymous";

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="relative h-80 bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] cursor-pointer hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_var(--black)] transition-all overflow-hidden group"
    >
      {product.thumbnail_url ? (
        <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[var(--pink-200)] to-[var(--pink-400)] flex items-center justify-center">
          <span className="text-8xl">📦</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 text-xs font-bold uppercase bg-[var(--pink-500)] border-2 border-white">Featured</span>
          {product.rating_avg > 0 && (
            <span className="flex items-center gap-1 text-sm">
              <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              {product.rating_avg.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="font-black text-2xl mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <Link 
            to={`/seller/${product.creator?.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm opacity-80 hover:opacity-100 hover:underline"
          >
            by {creatorName}
          </Link>
          <span className="font-black text-xl">{product.currency === 'INR' ? '₹' : '$'}{product.price}</span>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, navigate, onTagClick, delay }) {
  const creatorName = product.creator?.display_name || product.creator?.name || "Anonymous";

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] cursor-pointer hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_var(--black)] transition-all animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
    >
      <div className="aspect-[4/3] bg-[var(--pink-50)] border-b-3 border-black flex items-center justify-center overflow-hidden relative group">
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-center">
            <span className="text-6xl">📦</span>
          </div>
        )}
        {product.is_featured && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-[var(--yellow-400)] border-2 border-black font-bold text-xs uppercase rotate-3">
            Featured
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {product.category?.slice(0, 2).map((cat, j) => (
            <span key={j} className="px-3 py-1 text-xs font-bold uppercase bg-[var(--mint)] border-2 border-black">
              {cat}
            </span>
          ))}
        </div>
        <h3 className="font-black text-xl mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-10">{product.description}</p>
        
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.tags.slice(0, 3).map((tag, j) => (
              <button
                key={j}
                onClick={(e) => onTagClick(tag, e)}
                className="px-2 py-0.5 text-xs font-bold text-[var(--pink-600)] bg-[var(--pink-50)] border border-[var(--pink-200)] hover:bg-[var(--pink-100)] transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        
        <Link 
          to={`/seller/${product.creator?.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-4 group/seller"
        >
          <div className="w-6 h-6 rounded-full bg-[var(--pink-200)] border-2 border-black flex items-center justify-center text-xs font-bold overflow-hidden">
            {product.creator?.profile_image_url ? (
              <img src={product.creator.profile_image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              creatorName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm text-gray-600 group-hover/seller:text-[var(--pink-600)] group-hover/seller:underline">{creatorName}</span>
        </Link>

        <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-gray-200">
          <div className="flex flex-col">
            <span className="font-black text-2xl text-[var(--pink-600)]">
              {product.currency === 'INR' ? '₹' : '$'}{product.price}
            </span>
            {product.rating_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                {product.rating_avg?.toFixed(1)} ({product.rating_count})
              </div>
            )}
          </div>
          <button className="px-5 py-2 font-bold uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[3px_3px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_var(--black)] transition-all">
            View
          </button>
        </div>
      </div>
    </div>
  );
}