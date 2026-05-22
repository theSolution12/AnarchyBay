//help-center

import { useState } from 'react';
import NavBar from './NavBar.jsx';

// --- Static Data ---
const helpCategories = [
  { 
    slug: 'getting-started',
    title: "Getting Started", 
    icon: "🚀", 
    description: "Setup, account creation, and your first steps.",
    articles: [
      { id: 'signup-issue', title: 'Troubleshooting Sign-up Issues' },
      { id: 'reset-password', title: 'How to Reset Your Password' },
      { id: 'login-errors', title: 'Fixing Common Login Errors' },
      { id: 'tour', title: 'Take a Quick Platform Tour' },
    ],
    color: 'yellow-400',
  },
  { 
    slug: 'selling-listing',
    title: "Selling & Listing", 
    icon: "🛒", 
    description: "Uploading products, setting price, and managing listings.",
    articles: [
      { id: 'sell-product', title: 'Guide to Selling Your First Product' },
      { id: 'pricing-guide', title: 'Setting the Right Price for Your Work' },
      { id: 'upload-assets', title: 'File Requirements and Uploading Assets' },
      { id: 'license', title: 'Understanding Product Licenses' },
    ],
    color: 'mint',
  },
  { 
    slug: 'account-management',
    title: "Account Management", 
    icon: "👤", 
    description: "Profile updates, username changes, and social links.",
    articles: [
      { id: 'update-profile', title: 'How to Edit Your Profile Information' },
      { id: 'change-username', title: 'Changing Your Username and Display Name' },
      { id: 'verify-account', title: 'Verification and Badge Status' },
      { id: 'delete-account', title: 'How to Delete Your Account' },
    ],
    color: 'pink-200',
  },
  { 
    slug: 'security-privacy',
    title: "Security & Privacy", 
    icon: "🔒", 
    description: "Account protection, data policies, and security best practices.",
    articles: [
      { id: '2fa', title: 'Setting Up Two-Factor Authentication (2FA)' },
      { id: 'report-bug', title: 'Reporting a Bug or Security Vulnerability' },
      { id: 'data-policy', title: 'Understanding Our Data Usage Policy' },
      { id: 'scam', title: 'Avoiding Scams and Phishing' },
    ],
    color: 'pink-500',
  },
];

// --- Detailed Article Content Map (Used for final step-by-step click) ---
const detailedArticles = [
  { 
    id: 'reset-password', 
    title: 'How to Reset Your Password',
    content: (
      <>
        <h3 className="text-2xl font-black mb-3 text-[var(--pink-500)]">Password Reset Steps</h3>
        <ol className="list-decimal list-inside space-y-3 font-bold text-gray-800">
          <li>Go to the main Login screen and click the **"Forgot Password?"** link.</li>
          <li>Enter the email address associated with your AnarchyBay account.</li>
          <li>Check your inbox for a password reset link. **(Check spam too!)**</li>
          <li>Click the link and enter your new, secure password.</li>
          <li>Log in with your new credentials.</li>
        </ol>
      </>
    )
  },
  { 
    id: 'sell-product', 
    title: 'Guide to Selling Your First Product',
    content: (
      <>
        <h3 className="text-2xl font-black mb-3 text-[var(--pink-500)]">Listing Your Product</h3>
        <p className="mb-4">Follow these simple steps, as seen on the **Create Product** page:</p>
        <ol className="list-decimal list-inside space-y-3 font-bold text-gray-800">
          <li>Click the **"SELL"** button in the top navigation bar.</li>
          <li>Fill out **Product Details** (Name, Short Description, Long Description).</li>
          <li>Set the **Price** and choose a **Category**.</li>
          <li>Upload your **Files/Media** (Cover Image and Product Files).</li>
          <li>Add **Preview & Proof** images or video links to showcase your work.</li>
          <li>Customize the page background color.</li>
          <li>Review the **Tips for Success** checklist and click **"Publish Product"**.</li>
        </ol>
      </>
    )
  },
  { 
    id: 'update-profile', 
    title: 'How to Edit Your Profile Information',
    content: (
      <>
        <h3 className="text-2xl font-black mb-3 text-[var(--pink-500)]">Updating Account Info</h3>
        <p className="mb-4">You can manage your public presence, picture, and social links from the **Edit Profile** page:</p>
        <ul className="list-disc list-inside space-y-3 font-bold text-gray-800">
          <li>**Profile Picture:** Click "Upload a new photo" to change your avatar (supports JPG, PNG, WebP, GIF).</li>
          <li>**Basic Info:** Update your **Display Name**, change your **Username** (letters, numbers, and underscores only), and write your **Bio** (max 500 characters).</li>
          <li>**Social Links:** Paste the full URL of your social media profiles (Instagram, X/Twitter, Facebook, etc.). The platform is auto-detected.</li>
          <li>Remember to click **"Save Settings"** (or similar button) to apply changes.</li>
        </ul>
      </>
    )
  },
  { 
    id: 'signup-issue', 
    title: 'Troubleshooting Sign-up Issues',
    content: (
      <>
        <h3 className="text-2xl font-black mb-3 text-[var(--pink-500)]">Common Sign-up Errors</h3>
        <ul className="list-disc list-inside space-y-3 font-bold text-gray-800">
          <li>**Email Already Used:** Try logging in instead, or use a different email address.</li>
          <li>**Weak Password:** Ensure your password meets complexity requirements (e.g., 8 characters, one number, one symbol).</li>
          <li>**Username Taken:** Choose a unique username. Our system only allows letters, numbers, and underscores.</li>
          <li>**Verification Email Missing:** Check your Spam/Junk folder. If still missing, try re-sending the verification email from the login page.</li>
        </ul>
      </>
    )
    // ... add all other articles here for a complete help center
  },
  { id: 'login-errors', title: 'Fixing Common Login Errors', content: (<p className="font-bold">Clear your browser cache, check your caps lock, and ensure you are using the correct username or email.</p>) },
  { id: 'tour', title: 'Take a Quick Platform Tour', content: (<p className="font-bold">A platform tour is available in the main settings. Click 'Launch Tour' to begin!</p>) },
  { id: 'pricing-guide', title: 'Setting the Right Price for Your Work', content: (<p className="font-bold">We recommend researching similar items on the platform and considering the time spent on creation.</p>) },
  { id: 'upload-assets', title: 'File Requirements and Uploading Assets', content: (<p className="font-bold">Max file size is 5GB. Supported formats include ZIP, PNG, and PDF. Ensure your cover image is 16:9 ratio.</p>) },
  { id: 'license', title: 'Understanding Product Licenses', content: (<p className="font-bold">We primarily use a standard royalty-free license. Full details are available on the License Agreement page.</p>) },
  { id: 'change-username', title: 'Changing Your Username and Display Name', content: (<p className="font-bold">Usernames can be changed once every 90 days from the 'Edit Profile' page.</p>) },
  { id: 'verify-account', title: 'Verification and Badge Status', content: (<p className="font-bold">Account verification requires two steps: email confirmation and photo ID submission. This process takes 48-72 hours.</p>) },
  { id: 'delete-account', title: 'How to Delete Your Account', content: (<p className="font-bold">Account deletion is permanent. Navigate to Settings &gt; Security to initiate the 7-day grace period for deletion.</p>) },
  { id: '2fa', title: 'Setting Up Two-Factor Authentication (2FA)', content: (<p className="font-bold">2FA is mandatory. Download an authenticator app (like Google Authenticator) and follow the steps in the Security Settings tab.</p>) },
  { id: 'report-bug', title: 'Reporting a Bug or Security Vulnerability', content: (<p className="font-bold">Please email details and screenshots directly to security@anarchybay.local. Urgent reports receive priority!</p>) },
  { id: 'data-policy', title: 'Understanding Our Data Usage Policy', content: (<p className="font-bold">Your data is never sold to third parties. We only use anonymized data for improving platform features.</p>) },
  { id: 'scam', title: 'Avoiding Scams and Phishing', content: (<p className="font-bold">Never share your password. We will never ask for personal information via Discord or external links.</p>) },
];

const articleMap = detailedArticles.reduce((acc, article) => {
  acc[article.id] = article;
  return acc;
}, {});

export default function HelpCenterPage() {
  const [activeArticleId, setActiveArticleId] = useState(null); 
  const [openCategorySlug, setOpenCategorySlug] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(''); // New state for search

  const isViewingArticle = activeArticleId !== null;
  const currentArticle = articleMap[activeArticleId];

  // Function to toggle the category view (close/open)
  const toggleCategory = (slug) => {
    // If the user is searching, clear the article view and open the category
    if (isViewingArticle) setActiveArticleId(null);
    
    // Toggle the accordion panel
    if (slug === openCategorySlug) {
      setOpenCategorySlug(null); 
    } else {
      setOpenCategorySlug(slug); 
    }
  };

  // --- FILTERING LOGIC ---
  const filterCategories = () => {
    if (!searchQuery) {
      return helpCategories;
    }

    const query = searchQuery.toLowerCase();
    
    return helpCategories
      .map(category => {
        // Filter articles within the current category
        const filteredArticles = category.articles.filter(article =>
          article.title.toLowerCase().includes(query)
        );

        // Check if the category title itself matches OR if any articles matched
        const categoryMatches = category.title.toLowerCase().includes(query) || 
                                category.description.toLowerCase().includes(query);

        if (categoryMatches || filteredArticles.length > 0) {
          return {
            ...category,
            articles: filteredArticles.length > 0 ? filteredArticles : category.articles,
            // Automatically open the category if articles matched the search query
            isSearchMatch: true, 
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  };

  const filtered = filterCategories();

  // RENDER THE DETAILED ARTICLE VIEW
  if (isViewingArticle) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-20">
          {/* Article View Section */}
          <section className="py-16 md:py-20 px-4 sm:px-6 max-w-5xl mx-auto min-h-[60vh]">
            <div className="mb-8">
                <button 
                  onClick={() => setActiveArticleId(null)}
                  className="inline-flex items-center gap-2 text-lg font-bold text-gray-600 hover:text-[var(--pink-500)] transition-colors"
                >
                  <span className="text-2xl">←</span> Back to Topics
                </button>
            </div>
            
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-black mb-6">{currentArticle.title}</h1>
              <div className="prose max-w-none">
                {currentArticle.content}
              </div>
            </div>
          </section>

          {/* Contact CTA (Always visible) */}
          <section className="py-20 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--pink-200)] border-3 border-black p-8 md:p-12 shadow-[8px_8px_0px_var(--black)]">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-black mb-4">Still need assistance?</h2>
                <p className="text-lg mb-6 font-bold">
                  Call us at <span className="text-[var(--pink-500)] font-black">(555) 123-4567</span> or email <span className="text-[var(--pink-500)] font-black">support@anarchybay.local</span>.
                </p>
                <a 
                  href="/contact" 
                  className="inline-block px-8 py-4 text-lg font-black uppercase bg-[var(--yellow-400)] text-black border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
                >
                  Contact Support →
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // RENDER THE MAIN CATEGORY VIEW
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="pt-20">
        
        {/* === Help Center Hero/Search Section === */}
        <section className={`py-20 md:py-32 bg-[var(--yellow-100)] border-b-3 border-black`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
              AnarchyBay Help Center
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
              Find instant answers to your questions across all topics.
            </p>

            {/* Functional Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <input 
                type="search" 
                placeholder="Search articles, issues, or topics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpenCategorySlug(null); // Close any open accordion when searching
                }}
                className="w-full p-4 pr-16 border-3 border-black font-bold focus:outline-none focus:shadow-[0_0_0_3px_var(--pink-200)]" 
              />
              <button 
                className="absolute right-0 top-0 h-full px-5 bg-[var(--pink-500)] text-white border-l-3 border-black shadow-[3px_3px_0px_var(--black)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
                onClick={() => setSearchQuery('')} // Clear search on button click for simplicity
              >
                <span className="font-black text-lg">{searchQuery ? '✕' : '🔍'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* === Categories & Accordion Section === */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-[var(--mint)] text-black border-3 border-black font-black text-sm uppercase mb-4 shadow-[3px_3px_0px_var(--black)]">
              Browse Topics
            </span>
            <h2 className="text-4xl font-black">Everything You Need to Know</h2>
          </div>

          <div className="space-y-6">
            {filtered.length === 0 && searchQuery ? (
              <div className="text-center p-12 bg-[var(--pink-50)] border-3 border-black shadow-[4px_4px_0px_var(--black)]">
                <h3 className="text-2xl font-black mb-2">No results found for "{searchQuery}"</h3>
                <p className="font-bold text-gray-700">Try a different search term or contact support directly.</p>
              </div>
            ) : (
              filtered.map((cat, index) => (
                <div key={index} className="border-3 border-black">
                  {/* Accordion Header (The clickable card) */}
                  <button
                    onClick={() => toggleCategory(cat.slug)}
                    className={`flex items-center justify-between w-full p-6 text-left 
                               bg-[var(--${cat.color})] transition-all font-black 
                               hover:bg-[var(--${cat.color})]/90 shadow-[4px_4px_0px_var(--black)]`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{cat.icon}</span>
                      <div>
                        <h3 className="text-xl mb-1">{cat.title}</h3>
                        <p className="text-sm font-normal text-gray-800">{cat.description}</p>
                      </div>
                    </div>
                    <span className="text-2xl transform transition-transform duration-300">
                      {openCategorySlug === cat.slug || cat.isSearchMatch ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Accordion Content (The list of articles) */}
                  {(openCategorySlug === cat.slug || cat.isSearchMatch) && (
                    <div className="bg-white p-6 border-t-3 border-black">
                      <h4 className="font-black text-lg mb-4">
                        {searchQuery ? `Search Results in ${cat.title}:` : `Articles in ${cat.title}:`}
                      </h4>
                      <ul className="space-y-3">
                        {cat.articles.map((article, articleIndex) => (
                          <li key={articleIndex}>
                            <a 
                              href="#"
                              onClick={(e) => { e.preventDefault(); setActiveArticleId(article.id); }}
                              className="block font-bold text-gray-700 hover:text-[var(--pink-500)] transition-colors hover:underline"
                            >
                              → {article.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* === Back to Contact CTA (Updated with dummy contact info) === */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto bg-[var(--pink-200)] border-3 border-black p-8 md:p-12 shadow-[8px_8px_0px_var(--black)]">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Still need assistance?</h2>
              <p className="text-lg mb-4 font-bold">
                Call us at <span className="text-[var(--pink-500)] font-black">(555) 123-4567</span> or email <span className="text-[var(--pink-500)] font-black">support@anarchybay.local</span>.
              </p>
              <p className="text-lg mb-6 font-bold">
                Our support team is ready to help you find your answer.
              </p>
              <a 
                href="/contact" 
                className="inline-block px-8 py-4 text-lg font-black uppercase bg-[var(--yellow-400)] text-black border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}