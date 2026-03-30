import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Award,
  Clock,
  Facebook,
  HeadphonesIcon,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  Truck,
  Twitter,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import AdminPanel from "./AdminPanel";
import type { Category, Product, StoreInfo } from "./backend.d";
import {
  useCategories,
  useProducts,
  useStoreInfo,
  useSubmitInquiry,
} from "./hooks/useQueries";

// ─── Placeholder color palette for image areas ───────────────────────────────
const CATEGORY_COLORS = [
  "linear-gradient(135deg, #e8d5c4 0%, #c9a990 100%)",
  "linear-gradient(135deg, #c4cfd8 0%, #8fa3b1 100%)",
  "linear-gradient(135deg, #d4c9d8 0%, #a894b0 100%)",
  "linear-gradient(135deg, #c8d5c4 0%, #90a98e 100%)",
];
const PRODUCT_COLORS = [
  "linear-gradient(135deg, #f0ddd6 0%, #d4a99a 100%)",
  "linear-gradient(135deg, #d6dde0 0%, #9aadb8 100%)",
  "linear-gradient(135deg, #ddd6e8 0%, #b0a0c4 100%)",
  "linear-gradient(135deg, #dce8d6 0%, #a4c09a 100%)",
  "linear-gradient(135deg, #e8e0d0 0%, #c4b090 100%)",
  "linear-gradient(135deg, #d0dce8 0%, #90a8c4 100%)",
  "linear-gradient(135deg, #e8d0d8 0%, #c490a8 100%)",
  "linear-gradient(135deg, #d8e8d0 0%, #a0c490 100%)",
];

// ─── Sample data for initial load ────────────────────────────────────────────
const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 1n,
    name: "Women's Collection",
    description: "Elegant blouses, dresses & co-ords",
    imageUrl: "/assets/generated/category-womens.dim_400x300.jpg",
  },
  {
    id: 2n,
    name: "Men's Essentials",
    description: "Tailored suits, shirts & casualwear",
    imageUrl: "/assets/generated/category-mens.dim_400x300.jpg",
  },
  {
    id: 3n,
    name: "Kids' Wear",
    description: "Playful & comfortable everyday styles",
    imageUrl: "/assets/generated/category-kids.dim_400x300.jpg",
  },
  {
    id: 4n,
    name: "Accessories",
    description: "Bags, scarves & finishing touches",
    imageUrl: "/assets/generated/category-accessories.dim_400x300.jpg",
  },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Silk Wrap Blouse",
    priceUSD: 18.5,
    moq: 12n,
    categoryId: 1n,
    imageUrl: "/assets/generated/product-blouse.dim_300x300.jpg",
    rating: 4.8,
  },
  {
    id: 2n,
    name: "Tailored Blazer",
    priceUSD: 34.0,
    moq: 6n,
    categoryId: 2n,
    imageUrl: "/assets/generated/product-blazer.dim_300x300.jpg",
    rating: 4.7,
  },
  {
    id: 3n,
    name: "Linen Midi Skirt",
    priceUSD: 15.0,
    moq: 12n,
    categoryId: 1n,
    imageUrl: "",
    rating: 4.5,
  },
  {
    id: 4n,
    name: "Classic Oxford Shirt",
    priceUSD: 14.5,
    moq: 12n,
    categoryId: 2n,
    imageUrl: "",
    rating: 4.6,
  },
  {
    id: 5n,
    name: "Floral Sundress",
    priceUSD: 22.0,
    moq: 10n,
    categoryId: 1n,
    imageUrl: "",
    rating: 4.9,
  },
  {
    id: 6n,
    name: "Cotton Chinos",
    priceUSD: 19.5,
    moq: 12n,
    categoryId: 2n,
    imageUrl: "",
    rating: 4.4,
  },
  {
    id: 7n,
    name: "Kids' Playsuit Set",
    priceUSD: 11.0,
    moq: 20n,
    categoryId: 3n,
    imageUrl: "",
    rating: 4.7,
  },
  {
    id: 8n,
    name: "Woven Tote Bag",
    priceUSD: 9.5,
    moq: 24n,
    categoryId: 4n,
    imageUrl: "",
    rating: 4.5,
  },
];

const SAMPLE_STORE: StoreInfo = {
  address: "42 Fashion District Lane, Mumbai, Maharashtra 400001",
  city: "Mumbai",
  businessHours: "Mon–Sat: 9:00 AM – 7:00 PM | Sun: 10:00 AM – 5:00 PM",
  phone: "234678900",
  email: "hello@alookover.com",
};

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState<"public" | "admin">("public");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: storeInfo, isLoading: storeLoading } = useStoreInfo();
  const submitInquiry = useSubmitInquiry();

  const displayCategories = (
    categories && categories.length > 0 ? categories : SAMPLE_CATEGORIES
  ).slice(0, 4);
  const displayProducts = (
    products && products.length > 0 ? products : SAMPLE_PRODUCTS
  ).slice(0, 8);
  const displayStore = storeInfo ?? SAMPLE_STORE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitInquiry.mutateAsync(formData);
      setFormSubmitted(true);
      toast.success("Inquiry sent! We'll get back to you shortly.");
    } catch {
      toast.error("Failed to send inquiry. Please try again.");
    }
  };

  const navLinks = [
    { label: "Collections", href: "#collections" },
    { label: "New Arrivals", href: "#new-arrivals" },
    { label: "Partner With Us", href: "#partner" },
    { label: "Visit Us", href: "#visit" },
  ];

  if (currentView === "admin") {
    return (
      <>
        <Toaster />
        <AdminPanel onBack={() => setCurrentView("public")} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <a
              href="#top"
              className="font-serif text-xl font-semibold text-foreground tracking-tight"
            >
              A Lookover Fashion
            </a>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid={`nav.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button
                data-ocid="nav.wholesale_access.button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 text-sm"
                asChild
              >
                <a href="#partner">Get Wholesale Access</a>
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-ocid="nav.mobile_menu.toggle"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-foreground px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <Button className="mt-2 rounded-full" asChild>
                  <a href="#partner">Get Wholesale Access</a>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="bg-card rounded-2xl shadow-panel overflow-hidden">
            <div className="grid md:grid-cols-2 min-h-[480px]">
              {/* Left */}
              <div className="flex flex-col justify-center p-10 lg:p-16">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4"
                >
                  Wholesale Fashion Outlet
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight uppercase mb-6"
                >
                  Elevate Your Wardrobe Wholesale
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md"
                >
                  Discover premium bulk fashion at unbeatable prices. From
                  women's couture to men's essentials, A Lookover Fashion offers
                  curated wholesale collections for retailers and boutiques.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap gap-3"
                >
                  <Button
                    data-ocid="hero.browse_collection.button"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7"
                    asChild
                  >
                    <a href="#collections">Browse Collection</a>
                  </Button>
                  <Button
                    data-ocid="hero.visit_store.button"
                    variant="outline"
                    className="rounded-full px-7 border-border"
                    asChild
                  >
                    <a href="#visit">Visit Store</a>
                  </Button>
                </motion.div>
              </div>
              {/* Right: hero image */}
              <motion.div
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative min-h-[320px] md:min-h-0 overflow-hidden"
              >
                <img
                  src="/assets/generated/hero-models.dim_800x600.jpg"
                  alt="Fashion models wearing A Lookover Fashion wholesale collection"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Featured Collections ─────────────────────────────────────────── */}
        <section
          id="collections"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl text-center text-foreground mb-2">
              Featured Collections
            </h2>
            <p className="text-center text-muted-foreground text-sm mb-10">
              Curated wholesale categories for every retailer
            </p>
          </motion.div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl shadow-card overflow-hidden"
                  data-ocid="collections.loading_state"
                >
                  <Skeleton className="h-44 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayCategories.map((cat, i) => (
                <motion.div
                  key={String(cat.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  data-ocid={`collections.item.${i + 1}`}
                  className="bg-card rounded-xl shadow-card overflow-hidden group cursor-pointer hover:shadow-panel transition-shadow duration-300"
                >
                  <div className="h-44 overflow-hidden relative">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background:
                            CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        }}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-foreground text-base mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {cat.description}
                    </p>
                    <a
                      href="#new-arrivals"
                      data-ocid={`collections.shop.link.${i + 1}`}
                      className="text-xs font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Shop Wholesale <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── New Arrivals ──────────────────────────────────────────────────── */}
        <section
          id="new-arrivals"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl text-center text-foreground mb-2">
              New Arrivals
            </h2>
            <p className="text-center text-muted-foreground text-sm mb-10">
              Fresh styles added to our wholesale catalog
            </p>
          </motion.div>

          {productsLoading ? (
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              data-ocid="arrivals.loading_state"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl shadow-card overflow-hidden"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayProducts.map((product, i) => (
                <motion.div
                  key={String(product.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                  data-ocid={`arrivals.item.${i + 1}`}
                  className="bg-card rounded-xl shadow-card overflow-hidden group hover:shadow-panel transition-shadow duration-300"
                >
                  <div className="h-48 overflow-hidden relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
                        }}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-foreground text-sm mb-1 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-2">
                      ${product.priceUSD.toFixed(2)} / pc &nbsp;·&nbsp; MOQ{" "}
                      {String(product.moq)} pcs
                    </p>
                    <StarRating rating={product.rating} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Partner With Us ───────────────────────────────────────────────── */}
        <section
          id="partner"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="bg-card rounded-2xl shadow-panel p-10 lg:p-14">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3 block">
                  Wholesale Partnership
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                  Why Partner With A Lookover Fashion?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Join hundreds of boutiques and retailers who trust A Lookover
                  Fashion for their wholesale needs. We offer competitive
                  pricing, flexible minimum order quantities, and dedicated
                  support for growing businesses.
                </p>
                <Button
                  data-ocid="partner.inquiry.button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
                  asChild
                >
                  <a href="#contact">Start Your Partnership</a>
                </Button>
              </motion.div>

              {/* Right: Feature cards */}
              <div className="flex flex-col gap-4">
                {[
                  {
                    icon: Truck,
                    title: "Fast Shipping",
                    desc: "Reliable dispatch within 48 hours. Pan-India delivery in 3–7 business days with real-time tracking.",
                  },
                  {
                    icon: Award,
                    title: "Premium Quality",
                    desc: "Every piece quality-checked before dispatch. Consistent sizing, premium fabrics, and retail-ready packaging.",
                  },
                  {
                    icon: HeadphonesIcon,
                    title: "Dedicated Support",
                    desc: "A personal account manager assigned to every wholesale partner. Reach us 6 days a week.",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    data-ocid={`partner.feature.card.${i + 1}`}
                    className="flex gap-4 items-start bg-accent rounded-xl p-5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Visit Us ──────────────────────────────────────────────────────── */}
        <section
          id="visit"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl text-center text-foreground mb-2">
              Visit Our Showroom
            </h2>
            <p className="text-center text-muted-foreground text-sm mb-10">
              Experience the collection in person
            </p>
          </motion.div>

          <div className="bg-card rounded-2xl shadow-panel overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Map */}
              <div className="h-80 md:h-auto min-h-[320px]">
                <iframe
                  title="Store location"
                  src="https://maps.google.com/maps?q=fashion+district+mumbai&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 320 }}
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              {/* Store Info */}
              <div className="p-8 lg:p-12">
                <div className="mb-6 rounded-xl overflow-hidden h-40">
                  <img
                    src="/assets/generated/showroom.dim_400x300.jpg"
                    alt="A Lookover Fashion showroom interior"
                    className="w-full h-full object-cover"
                  />
                </div>

                {storeLoading ? (
                  <div data-ocid="visit.loading_state">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Address
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {displayStore.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Business Hours
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {displayStore.businessHours}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Phone
                        </p>
                        <a
                          href={`tel:${displayStore.phone}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {displayStore.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Email
                        </p>
                        <a
                          href={`mailto:${displayStore.email}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {displayStore.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact / Inquiry Form ────────────────────────────────────────── */}
        <section
          id="contact"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="bg-card rounded-2xl shadow-panel p-10 lg:p-14 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-serif text-3xl text-center text-foreground mb-2">
                Send an Inquiry
              </h2>
              <p className="text-center text-muted-foreground text-sm mb-10">
                Interested in wholesale? Let's connect.
              </p>
            </motion.div>

            {formSubmitted ? (
              <div
                data-ocid="contact.success_state"
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">
                  Thank You!
                </h3>
                <p className="text-muted-foreground text-sm">
                  We've received your inquiry and will be in touch within 24
                  hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    data-ocid="contact.name.input"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    data-ocid="contact.email.input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    data-ocid="contact.message.textarea"
                    placeholder="Tell us about your wholesale needs — product types, quantities, etc."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="contact.submit.button"
                  disabled={submitInquiry.isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5"
                >
                  {submitInquiry.isPending ? "Sending..." : "Send Inquiry"}
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-footer-bg text-footer-text mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="font-serif text-xl font-semibold text-white mb-3">
                A Lookover Fashion
              </h3>
              <p className="text-sm text-footer-text/70 leading-relaxed mb-5">
                Your trusted wholesale clothing outlet for premium fashion at
                bulk prices.
              </p>
              <div className="flex gap-3">
                <a
                  href="#top"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#top"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#top"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Explore
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-footer-text/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Info
              </h4>
              <ul className="space-y-2">
                {[
                  "About Us",
                  "Wholesale Terms",
                  "Return Policy",
                  "Size Guide",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#top"
                      className="text-sm text-footer-text/70 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Contact
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-footer-text/70">
                  {displayStore.address}
                </p>
                <p className="text-sm text-footer-text/70">
                  {displayStore.phone}
                </p>
                <p className="text-sm text-footer-text/70">
                  {displayStore.email}
                </p>
              </div>
              <div className="mt-6">
                <p className="text-xs text-footer-text/50 mb-2">Newsletter</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full text-sm h-9"
                  />
                  <Button
                    size="sm"
                    className="rounded-full bg-white text-foreground hover:bg-white/90 h-9 px-4 text-xs flex-shrink-0"
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-footer-text/50">
              © {new Date().getFullYear()} A Lookover Fashion. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-footer-text/50">
                Built with ♥ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  caffeine.ai
                </a>
              </p>
              <button
                type="button"
                onClick={() => setCurrentView("admin")}
                className="text-xs text-footer-text/25 hover:text-footer-text/50 transition-colors"
                data-ocid="footer.admin.button"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
