import NavBar from "../components/NavBar";

export default function LearnMorePage() {
  return (
    <div className="w-full">
        <NavBar/>
      {/* HERO SECTION */}
      <section className="bg-linear-to-br from-indigo-500 to-purple-600 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">

          {/* LEFT: TEXT */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              React Admin Dashboard Template
            </h1>
            <p className="mt-5 text-lg opacity-90">
              A premium developer-friendly admin UI built with React + Tailwind, 
              designed to boost productivity and reduce development time.
            </p>

            <div className="flex gap-4 mt-8">
              <button className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl shadow hover:bg-gray-100 transition">
                Buy Now – ₹299
              </button>
              <button className="px-6 py-3 bg-white/20 border border-white/40 backdrop-blur-md font-semibold rounded-xl hover:bg-white/30 transition">
                Download Sample
              </button>
            </div>
          </div>

          {/* RIGHT: PRODUCT IMAGE */}
          <div className="flex-1">
            <img
              src="/images/admin-template.png"
              className="rounded-2xl shadow-2xl border border-white/30"
              alt="Preview"
            />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center">
          🚀 Why Developers Love This Template
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            {
              title: "Fully Responsive",
              desc: "Optimized for laptop, tablet, and mobile screens.",
            },
            {
              title: "Clean & Modern UI",
              desc: "Pixel-perfect design with smooth shadows & gradients.",
            },
            {
              title: "Developer Friendly",
              desc: "Easy folder structure with reusable components.",
            },
            {
              title: "TailwindCSS Powered",
              desc: "Fast customization with utility-first styling.",
            },
            {
              title: "Dark Mode Ready",
              desc: "Built-in support for theme switching.",
            },
            {
              title: "Production Ready",
              desc: "Used by startups & SaaS companies worldwide.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white shadow hover:shadow-xl transition border"
            >
              <h3 className="text-xl font-semibold text-indigo-600">{f.title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCREENSHOTS GALLERY */}
      <section className="bg-gray-50 py-20 px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center">
          📸 Template Screenshots
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
          <img src="/images/ss1.png" className="rounded-xl shadow-lg" />
          <img src="/images/ss2.png" className="rounded-xl shadow-lg" />
          <img src="/images/ss3.png" className="rounded-xl shadow-lg" />
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center">
          📦 What’s Included
        </h2>

        <ul className="mt-10 space-y-4 text-lg text-slate-700 max-w-2xl mx-auto">
          <li>✔ Complete Source Code (React + Tailwind)</li>
          <li>✔ Reusable UI Components</li>
          <li>✔ Authentication-ready Pages</li>
          <li>✔ Dashboard + Analytics Page</li>
          <li>✔ Lifetime Updates</li>
          <li>✔ Developer Support</li>
        </ul>
      </section>

      {/* PRICING SECTION */}
      <section className="py-20 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-bold">Start Building Faster</h2>
        <p className="mt-4 text-lg opacity-90">
          Get full access to the template with lifetime updates.
        </p>

        <div className="mt-8">
          <button className="px-8 py-4 bg-white text-indigo-700 font-semibold text-lg rounded-xl shadow hover:bg-gray-100 transition">
            Buy Now For ₹299
          </button>
        </div>
      </section>
    </div>
  );
}
