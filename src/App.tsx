import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { INITIAL_PRODUCTS, DEFAULT_PRICING_CONFIG, SkincareProduct, PricingConfig, calculateINRPrice, SUPPORTED_CURRENCIES, CurrencyUnit } from "./data/skincareData";

// Components
import AIdiagnosis from "./components/AIdiagnosis";
import Doctors from "./components/Doctors";
import ProgressTracker from "./components/ProgressTracker";
import SubscriptionBox from "./components/SubscriptionBox";
import Chatbot from "./components/Chatbot";
import AdminPanel from "./components/AdminPanel";
import AuthModal, { UserProfile } from "./components/AuthModal";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

// Icons
import {
  Sparkles,
  ShoppingBag,
  Gift,
  Stethoscope,
  TrendingUp,
  Sliders,
  Bot,
  Heart,
  ChevronRight,
  Info,
  Check,
  Star,
  InfoIcon,
  HelpCircle,
  Percent,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Lock,
  Shield,
  CheckCircle2,
  User
} from "lucide-react";

export default function App() {
  // Global States (placed high to facilitate component communication)
  const [products, setProducts] = useState<SkincareProduct[]>(INITIAL_PRODUCTS);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [orders, setOrders] = useState<any[]>([
    { id: "ORD-9201", type: "Product Import", details: "Beauty of Joseon Sunscreen (Rice + Probiotics)", price: 1350, date: "June 11", status: "In Transit" },
    { id: "ORD-8451", type: "Subscription Box", details: "Glass Glow Box (4 Premium K-Items)", price: 3400, date: "June 12", status: "Delivered" }
  ]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"diagnostic" | "shop" | "subscriptions" | "telehealth" | "progress" | "importer">("diagnostic");

  // User Profile Credentials
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("luxecare_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Synchronize user profile into checkout fields when logged in
  useEffect(() => {
    if (user) {
      localStorage.setItem("luxecare_user_profile", JSON.stringify(user));
      if (user.address) setShippingAddress(user.address);
      if (user.city) setShippingCity(user.city);
      if (user.zip) setShippingZip(user.zip);
      if (user.name) setCardName(user.name);
    } else {
      localStorage.removeItem("luxecare_user_profile");
    }
  }, [user]);

  // Listen to Firebase Auth state change to sync real-time database session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch fresh profile data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              name: data.name || "User",
              email: data.email || firebaseUser.email || "",
              phone: data.phone || "",
              address: data.address || "",
              city: data.city || "",
              zip: data.zip || "",
              joinedDate: data.joinedDate || "June 2026",
              avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`
            });
          }
        } catch (error) {
          console.error("Error reading profile on auth state change:", error);
        }
      } else {
        // If logged out on Firebase, clear local state
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Floating Chatbot Toggle
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Animated notification toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Shopping Cart & Drawer States
  const [cart, setCart] = useState<{ product: SkincareProduct; quantity: number }[]>(() => {
    const saved = localStorage.getItem("luxecare_user_cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout payment form states
  const [checkoutStep, setCheckoutStep] = useState<"CART" | "CHECKOUT" | "PROCESSING" | "RECEIPT">("CART");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [processingStepText, setProcessingStepText] = useState("");
  const [lastReceipt, setLastReceipt] = useState<{ product: SkincareProduct; quantity: number }[]>([]);
  const [receiptTotal, setReceiptTotal] = useState(0);

  // Persist cart
  useEffect(() => {
    localStorage.setItem("luxecare_user_cart", JSON.stringify(cart));
  }, [cart]);

  // Helper selectors
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Shop internal states
  const [selectedShopCategory, setSelectedShopCategory] = useState("All");
  const [shopSearch, setShopSearch] = useState("");

  // Preferred display currency state with Local Storage persistence
  const [activeCurrency, setActiveCurrency] = useState<CurrencyUnit>(() => {
    const saved = localStorage.getItem("luxecare_active_currency");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const exists = SUPPORTED_CURRENCIES.find(c => c.code === parsed.code);
        if (exists) return exists;
      } catch (e) {}
    }
    // Default config is Indian Rupee (₹)
    return SUPPORTED_CURRENCIES[0];
  });

  const handleCurrencyChange = (currCode: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === currCode);
    if (found) {
      setActiveCurrency(found);
      localStorage.setItem("luxecare_active_currency", JSON.stringify(found));
    }
  };

  const formatCurrency = (valInINR: number): string => {
    const converted = Math.round(valInINR * activeCurrency.rateToINR);
    return `${activeCurrency.symbol}${converted.toLocaleString()} ${activeCurrency.code}`;
  };

  // Cart operations
  const handleAddToCart = (p: SkincareProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) {
          showToast(`⚠️ Cannot add more! Maximum available wholesale stock limit reached for "${p.name}".`, "error");
          return prev;
        }
        showToast(`✨ Added another unit of "${p.brand} ${p.name}" to your importer cart.`, "success");
        return prev.map((item) =>
          item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (p.stock <= 0) {
          showToast(`⚠️ "${p.name}" is currently out of stock in regional hubs.`, "error");
          return prev;
        }
        showToast(`🛍️ Added "${p.brand} ${p.name}" to your importer cart!`, "success");
        return [...prev, { product: p, quantity: 1 }];
      }
    });

    setCheckoutStep("CART");
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          // check stock limit
          if (newQty > item.product.stock) {
            showToast(`⚠️ Cannot add more. Only ${item.product.stock} units are currently available inside the K-Beauty importer dispatch.`, "info");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: SkincareProduct; quantity: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("🗑️ Item removed from importer cart.", "info");
  };

  const simulateCheckoutProcessing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("⚠️ Authentication Required: Please Sign In or Sign Up to purchase or inspect custom clearances.", "error");
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    if (!shippingAddress.trim() || !shippingCity.trim() || !shippingZip.trim()) {
      showToast("⚠️ Please provide a valid Shipping Address.", "error");
      return;
    }
    if (!cardName.trim() || cardNumber.replace(/\s/g, "").length < 13 || !cardExpiry.trim() || cardCvv.length < 3) {
      showToast("⚠️ Please write valid secure Payment card details.", "error");
      return;
    }

    setCheckoutStep("PROCESSING");
    
    const totalINR = cart.reduce((sum, item) => {
      const price = calculateINRPrice(item.product.basePriceKRW, pricingConfig);
      return sum + (price * item.quantity);
    }, 0);

    const steps = [
      "🔐 Securing dynamic currency rate lock with Indian Reserve gateways...",
      "🏗️ Initiating wholesale order dispatch at Gangnam Port Cargo Terminal...",
      "🛳️ Assigning maritime sea-container identifier codes and clearance manifest...",
      "🇮🇳 Calculating custom duty exemptions & clearing regulatory seaport taxes...",
      "🎉 Payment Captured successfully! Finalizing secure transaction invoice..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStepText(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Capture receipt info to display
    setLastReceipt([...cart]);
    setReceiptTotal(totalINR);
    
    // Decrease stock inside products database and register order list
    const updatedProducts = products.map((p) => {
      const cartMatch = cart.find((c) => c.product.id === p.id);
      if (cartMatch) {
         return { ...p, stock: Math.max(0, p.stock - cartMatch.quantity) };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Register active orders
    cart.forEach((item) => {
      const itemPrice = calculateINRPrice(item.product.basePriceKRW, pricingConfig);
      const newOrd = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        type: "Product Import",
        details: `${item.product.brand} ${item.product.name} (x${item.quantity})`,
        price: itemPrice * item.quantity,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        status: "Shipment Preparing"
      };
      setOrders((prev) => [newOrd, ...prev]);
    });

    // Clear cart and update page
    setCart([]);
    setCheckoutStep("RECEIPT");
    showToast("🎉 Order Processed! Dynamic cargo shipment registered with customs.", "success");
  };

  const handleCreateOrder = (p: SkincareProduct) => {
    const finalINR = calculateINRPrice(p.basePriceKRW, pricingConfig);
    const newOrd = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      type: "Product Import",
      details: `${p.brand} ${p.name}`,
      price: finalINR,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      status: "Shipment Preparing"
    };

    setOrders((prev) => [newOrd, ...prev]);

    // Update stock count
    const updatedProds = products.map((item) => {
      if (item.id === p.id) {
        return { ...item, stock: Math.max(0, item.stock - 1) };
      }
      return item;
    });
    setProducts(updatedProds);

    showToast(`🛍️ Purchase Complete! "${p.brand} ${p.name}" has been registered in our importer dispatcher for ${formatCurrency(finalINR)}. Check 'My Progress' or 'Importer Desk' to track!`, "success");
  };

  const handleAddCustomOrder = (newOrder: any) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Shop item filters
  const filteredShopItems = products.filter((p) => {
    const matchesCategory = selectedShopCategory === "All" || p.category === selectedShopCategory;
    const matchesSearch = p.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(shopSearch.toLowerCase()) ||
                          p.activeIngredient.toLowerCase().includes(shopSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoriesList = ["All", "Toner", "Essence", "Serum", "Cleanser", "Sunscreen"];

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#3C3C3C] flex flex-col font-sans relative" id="luxecare-core-application">
      
      {/* Animated notification toast overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -30, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="fixed top-8 left-1/2 z-50 w-[92vw] max-w-md"
          >
            <div className={`p-4 rounded-[24px] shadow-2xl flex items-start gap-3 border ${
              toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : toast.type === "info"
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : "bg-[#F9F7F2] border-[#E6E0D5] text-[#2A3B2D]"
            }`}>
              <div className="mt-0.5 shrink-0 text-base">
                {toast.type === "error" ? "⚠️" : toast.type === "info" ? "ℹ️" : "✨"}
              </div>
              <div className="flex-grow space-y-1.5 min-w-0">
                <p className="text-xs font-bold leading-relaxed break-words">
                  {toast.message}
                </p>
                <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 4.5, ease: "linear" }}
                    className={`h-full ${
                      toast.type === "error" ? "bg-red-500" : toast.type === "info" ? "bg-blue-500" : "bg-[#5A6D5D]"
                    }`}
                  />
                </div>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-[#7A8C7E] hover:text-[#2A3B2D] text-sm font-bold px-1 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Global Navigation Frame */}
      <header className="sticky top-0 z-40 bg-[#F5F2ED]/85 backdrop-blur-md border-b border-[#E6E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Elegant Logo with active brand styling */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5A6D5D] flex items-center justify-center text-white font-serif italic text-lg shadow-sm border border-[#E6E0D5]">
              LC
            </div>
            <div>
              <h1 className="text-xl font-serif tracking-tight font-bold text-[#2A3B2D] leading-none flex items-center gap-1">
                LUXECARE
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3B18A]" />
              </h1>
              <p className="text-[10px] text-[#5A6D5D] font-bold tracking-widest uppercase mt-0.5 font-sans">
                K-Beauty AI Importers
              </p>
            </div>
          </div>

          {/* Nav Tabs for desktop */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold" id="desktop-tabs-nav">
            {[
              { id: "diagnostic", label: "Skin & Hair Analysis", icon: <Sparkles className="w-4 h-4" /> },
              { id: "shop", label: "K-Beauty Boutique", icon: <ShoppingBag className="w-4 h-4" /> },
              { id: "subscriptions", label: "Skincare Subscription", icon: <Gift className="w-4 h-4" /> },
              { id: "telehealth", label: "Derm Clinics", icon: <Stethoscope className="w-4 h-4" /> },
              { id: "progress", label: "My Progress", icon: <TrendingUp className="w-4 h-4" /> },
              { id: "importer", label: "Importer Desk", icon: <Sliders className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`nav-tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#5A6D5D] text-white shadow-md"
                    : "text-[#7A8C7E] hover:bg-[#E6E0D5]/40 hover:text-[#2A3B2D]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Stats & Currency selection panel */}
          <div className="flex items-center gap-2">
            
            {/* Dynamic Selector Dropdown */}
            <div className="flex items-center gap-1 bg-[#F9F7F2] border border-[#E6E0D5] px-2.5 py-1 rounded-xl hover:border-[#5A6D5D] transition-all">
              <span className="text-[9px] text-[#7A8C7E] uppercase hidden md:inline tracking-wider font-bold">Currency:</span>
              <select
                id="currency-selector"
                value={activeCurrency.code}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="bg-transparent border-none text-[11px] outline-none cursor-pointer font-extrabold text-[#2A3B2D] pr-1"
                title="Choose Preferred Currency"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-white text-[#2A3B2D]">
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Auth trigger button */}
            <button
              id="user-profile-header-btn"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 bg-[#F9F7F2] hover:bg-stone-100 transition-all border border-[#E6E0D5] px-3.5 py-1.5 rounded-xl cursor-pointer text-xs font-bold text-[#2A3B2D] h-9"
              title={user ? "View Custom Clearance Account" : "Sign In / Register"}
            >
              {user ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-[#5A6D5D] text-white flex items-center justify-center text-[10px] uppercase font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-[11px] font-bold text-[#2A3B2D]">
                    Hi, {user.name.split(" ")[0]}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-[#5A6D5D]" />
                  <span className="hidden sm:inline text-[11px] text-[#5A6D5D]">Sign In</span>
                </>
              )}
            </button>

            {/* Shopping Cart Trigger */}
            <button
              id="cart-header-btn"
              onClick={() => {
                setCheckoutStep("CART");
                setIsCartOpen(true);
              }}
              className="relative flex items-center justify-center bg-[#F9F7F2] hover:bg-stone-100 transition-all border border-[#E6E0D5] rounded-xl cursor-pointer w-9 h-9"
              title="Open Importer Cart"
            >
              <ShoppingCart className="w-4 h-4 text-[#2A3B2D]" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#5A6D5D] text-white text-[9px] font-extrabold w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-md">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1 bg-[#F9F7F2] px-3.5 py-1.5 rounded-full text-[11px] font-bold text-[#5A6D5D] border border-[#E6E0D5]">
              <span>1 KRW = ₹{pricingConfig.exchangeRateKRWtoINR} INR</span>
            </div>
          </div>

        </div>

        {/* Horizontal mobile tab scroller */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-[#E6E0D5] whitespace-nowrap scrollbar-none scroll-smooth bg-white" id="mobile-tabs-nav">
          {[
            { id: "diagnostic", label: "AI Analysis", icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: "shop", label: "Store", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
            { id: "subscriptions", label: "Subscriptions", icon: <Gift className="w-3.5 h-3.5" /> },
            { id: "telehealth", label: "Clinics", icon: <Stethoscope className="w-3.5 h-3.5" /> },
            { id: "progress", label: "Progress", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: "importer", label: "Importer", icon: <Sliders className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`mobile-nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold ${
                activeTab === tab.id
                  ? "bg-[#5A6D5D] text-white"
                  : "bg-[#F9F7F2] border border-[#E6E0D5] text-[#7A8C7E]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* 2. Primary Showcase Section */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic routing matching tabs with smooth exit-entry transition animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {activeTab === "diagnostic" && (
              <AIdiagnosis />
            )}

            {activeTab === "shop" && (
              <div className="space-y-12 animate-fade-in" id="boutique-curation-tab">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E6E0D5] text-[#2A3B2D] rounded-full text-xs font-semibold uppercase tracking-wider">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#5A6D5D]" />
                    South Korea ⇌ India Curation
                  </div>
                  <h2 className="text-4xl font-serif italic text-[#2A3B2D] tracking-tight">
                    The K-Beauty Boutique Store
                  </h2>
                  <p className="text-sm text-[#7A8C7E]">
                    Explore direct premium K-Beauty products. Click the formula indicator on any card to inspect how custom duty tax, ocean freight, and our company markup are added to Seoul wholesale values.
                  </p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-[24px] border border-[#E6E0D5] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex flex-wrap gap-1.5 w-full sm:w-auto" id="shop-category-filters">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        id={`shop-cat-btn-${cat.toLowerCase()}`}
                        onClick={() => setSelectedShopCategory(cat)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                          selectedShopCategory === cat
                            ? "bg-[#5A6D5D] text-white"
                            : "bg-[#F9F7F2] border border-[#E6E0D5] text-[#3C3C3C] hover:bg-[#E6E0D5]/20"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="w-full sm:w-64 relative">
                    <input
                      type="text"
                      id="shop-search-input"
                      placeholder="Search brand or ingredient..."
                      value={shopSearch}
                      onChange={(e) => setShopSearch(e.target.value)}
                      className="w-full p-2.5 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] text-[#3C3C3C] placeholder-[#7A8C7E]"
                    />
                  </div>
                </div>

                {/* Store Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="shop-items-grid">
                  {filteredShopItems.map((p) => {
                    const finalSellingPrice = calculateINRPrice(p.basePriceKRW, pricingConfig);
                    const isLowStock = p.stock < 70;

                    return (
                      <motion.div
                        key={p.id}
                        id={`product-card-${p.id}`}
                        whileHover={{ y: -8, boxShadow: "0 10px 30px -10px rgba(90, 109, 93, 0.25)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white rounded-[32px] border border-[#E6E0D5] hover:border-[#5A6D5D] overflow-hidden shadow-sm flex flex-col justify-between group transition-all"
                      >
                        {/* Visual */}
                        <div className="aspect-[4/3] w-full bg-[#F9F7F2] relative overflow-hidden shrink-0">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase rounded tracking-wider">
                            {p.brand}
                          </span>
                          {isLowStock && (
                            <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">
                              Only {p.stock} units left in India
                            </span>
                          )}
                        </div>

                        {/* Content Details */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="text-xs font-bold text-[#2A3B2D] leading-snug group-hover:text-[#5A6D5D] transition-colors line-clamp-2">
                              {p.name}
                            </h3>
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                              <span>🧪 {p.activeIngredient}</span>
                            </div>
                            <p className="text-[11px] text-[#7A8C7E] leading-relaxed line-clamp-3">
                              {p.description}
                            </p>
                          </div>

                          {/* Import Mathematics Tooltip Box */}
                          <div className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D5] text-[10px] space-y-1">
                            <div className="flex justify-between font-bold text-stone-600">
                              <span>Wholesale Seoul:</span>
                              <span>₩{p.basePriceKRW.toLocaleString()} KRW</span>
                            </div>
                            <div className="flex justify-between text-[#7A8C7E]">
                              <span>Import duty + freight:</span>
                              <span>{formatCurrency(calculateINRPrice(p.basePriceKRW, { ...pricingConfig, profitMarginPercent: 0 }) - Math.round(p.basePriceKRW * pricingConfig.exchangeRateKRWtoINR))}</span>
                            </div>
                            <div className="flex justify-between text-[#7A8C7E] border-t border-dashed border-[#E6E0D5] mt-1 pt-1 font-bold">
                              <span>Added Markup margin:</span>
                              <span className="text-emerald-700">+{pricingConfig.profitMarginPercent}%</span>
                            </div>
                          </div>

                          {/* Selling Price and Purchase trigger */}
                          <div className="flex items-center justify-between border-t border-[#F5F2ED] pt-3 mt-1 shrink-0">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#7A8C7E] font-bold block">Import selling price</span>
                              <span className="text-sm font-bold text-[#2A3B2D] font-serif">{formatCurrency(finalSellingPrice)}</span>
                            </div>
                            <motion.button
                              id={`purchase-btn-${p.id}`}
                              onClick={() => handleAddToCart(p)}
                              whileTap={{ scale: 0.93 }}
                              className="px-4 py-2 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </motion.button>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "subscriptions" && (
              <SubscriptionBox
                products={products}
                pricingConfig={pricingConfig}
                onAddOrder={handleAddCustomOrder}
                activeCurrency={activeCurrency}
                formatCurrency={formatCurrency}
                showToast={showToast}
                isLoggedIn={!!user}
                onPromptLogin={() => setIsAuthOpen(true)}
              />
            )}

            {activeTab === "telehealth" && (
              <Doctors
                activeCurrency={activeCurrency}
                formatCurrency={formatCurrency}
                showToast={showToast}
              />
            )}

            {activeTab === "progress" && (
              <ProgressTracker showToast={showToast} />
            )}

            {activeTab === "importer" && (
              <AdminPanel
                products={products}
                pricingConfig={pricingConfig}
                onChangePricing={setPricingConfig}
                onUpdateProducts={setProducts}
                orders={orders}
                activeCurrency={activeCurrency}
                formatCurrency={formatCurrency}
                showToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* 3. Footer branding section */}
      <footer className="border-t border-[#E6E0D5] bg-white py-12 text-center text-xs text-[#7A8C7E] font-medium" id="global-footer">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-center gap-6 font-bold text-[#5A6D5D]">
            <button onClick={() => setActiveTab("diagnostic")} className="hover:underline cursor-pointer">Diagnostic Scan</button>
            <button onClick={() => setActiveTab("shop")} className="hover:underline cursor-pointer">Import Shop</button>
            <button onClick={() => setActiveTab("subscriptions")} className="hover:underline cursor-pointer">Bespoke Boxes</button>
            <button onClick={() => setActiveTab("telehealth")} className="hover:underline cursor-pointer">Derm Clinics</button>
            <button onClick={() => setActiveTab("importer")} className="hover:underline cursor-pointer">Importer Metrics</button>
          </div>
          <p className="px-4 text-[#7A8C7E]">© 2026 LUXECARE Technologies Ltd. All custom duty, ocean logistics, and currency conversions mathematically compiled.</p>
        </div>
      </footer>

      {/* 4. Collapsible Floating AI Dermatologist Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" id="floating-chatbot-widget">
        
        {/* Chat box wrapper when open */}
        <AnimatePresence>
          {isChatbotOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-[350px] max-w-[calc(100vw-2rem)] rounded-[32px] overflow-hidden shadow-2xl border border-[#E6E0D5]"
            >
              <Chatbot />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Trigger Button */}
        <motion.button
          id="toggle-chatbot-btn"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className={`p-4 rounded-full shadow-xl text-white cursor-pointer transition-all flex items-center justify-center ${
            isChatbotOpen ? "bg-[#2A3B2D]" : "bg-[#5A6D5D] hover:bg-[#4A5D4D]"
          }`}
          title="Consult AI Dermatologist"
        >
          {isChatbotOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* 5. Slide-over Shopping Cart and Customs Checkout Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 cursor-pointer"
            />

            {/* Slide-over Drawer Pane */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#FAF8F5] shadow-2xl border-l border-[#E6E0D5] z-50 flex flex-col focus:outline-none"
            >
              {/* Header block */}
              <div className="p-6 border-b border-[#E6E0D5] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#5A6D5D] flex items-center justify-center text-white">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-md font-serif font-bold text-[#2A3B2D]">Importer Cargo Cart</h2>
                    <p className="text-[10px] text-[#7A8C7E] font-bold uppercase tracking-wider">Customs Booking Desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-[#7A8C7E] hover:text-[#2A3B2D] hover:bg-stone-100 rounded-full transition-all cursor-pointer text-xs font-bold"
                  title="Close Cart"
                >
                  ✕ Close
                </button>
              </div>

              {/* Steps Indicator Bar */}
              {checkoutStep !== "PROCESSING" && checkoutStep !== "RECEIPT" && (
                <div className="bg-white/60 border-b border-[#E6E0D5] px-6 py-3 flex items-center justify-between text-[11px] font-bold text-[#5A6D5D]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] ${checkoutStep === "CART" ? "bg-[#5A6D5D] text-white border-[#5A6D5D]" : "bg-emerald-100 text-[#2A3B2D] border-emerald-300"}`}>1</span>
                    <span className={checkoutStep === "CART" ? "text-[#2A3B2D]" : "text-[#7A8C7E]"}>Cargo Manifest</span>
                  </div>
                  <div className="h-px bg-[#E6E0D5] flex-1 mx-3" />
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] ${checkoutStep === "CHECKOUT" ? "bg-[#5A6D5D] text-white border-[#5A6D5D]" : "bg-stone-100 text-stone-400 border-stone-200"}`}>2</span>
                    <span className={checkoutStep === "CHECKOUT" ? "text-[#2A3B2D]" : "text-[#7A8C7E]"}>Customs duty & Billing</span>
                  </div>
                </div>
              )}

              {/* Scrollable content pane */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                
                {/* STATE 1: Empty state */}
                {checkoutStep === "CART" && cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-300 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[#2A3B2D] font-bold">Your manifest is empty</h3>
                      <p className="text-xs text-[#7A8C7E] max-w-xs mt-1 text-center font-bold">Browse the K-Beauty Boutique, calculate custom margins, and import premium formulations to your cart.</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setActiveTab("shop");
                      }}
                      className="px-5 py-2.5 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Explore Boutique
                    </button>
                  </div>
                )}

                {/* STATE 2: Carton list in Cart tab */}
                {checkoutStep === "CART" && cart.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-[#7A8C7E] tracking-wider uppercase">Shipment Manifest</p>
                    
                    {cart.map((item) => {
                      const itemPrice = calculateINRPrice(item.product.basePriceKRW, pricingConfig);
                      
                      return (
                        <div key={item.product.id} className="bg-white p-4 rounded-3xl border border-[#E6E0D5] flex gap-4 items-center">
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl bg-stone-50 border border-stone-100 shrink-0 shadow-sm" />
                          <div className="flex-grow min-w-0">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7A8C7E] block">{item.product.brand}</span>
                            <h4 className="text-xs font-bold text-[#2A3B2D] truncate">{item.product.name}</h4>
                            <p className="text-xs font-extrabold text-[#5A6D5D] mt-1">{formatCurrency(itemPrice)} <span className="text-[10px] text-stone-400 font-medium">each</span></p>
                          </div>

                          {/* Control actions */}
                          <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                            <button
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              className="text-stone-300 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1 bg-[#F9F7F2] border border-[#E6E0D5] p-1 rounded-lg">
                              <button
                                onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                                className="p-1 hover:bg-stone-200 rounded text-[#5A6D5D] cursor-pointer text-xs font-bold"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[#2A3B2D] font-extrabold text-xs px-1.5">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                                className="p-1 hover:bg-stone-200 rounded text-[#5A6D5D] cursor-pointer text-xs font-bold"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Duty details invoice receipt block */}
                    <div className="bg-white p-5 rounded-3xl border border-[#E6E0D5] mt-6 space-y-3">
                      <p className="text-[11px] font-bold text-[#2A3B2D] tracking-wider uppercase border-b border-[#F5F2ED] pb-2">Logistics Invoice Surcharge</p>
                      
                      <div className="flex justify-between text-xs text-[#7A8C7E]">
                        <span>Formulations subtotal:</span>
                        <span className="font-bold text-[#2A3B2D] font-mono">
                          {formatCurrency(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0))}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-[#7A8C7E]">
                        <span>Marine Freight clearance taxes (12%):</span>
                        <span className="font-bold text-stone-700 font-mono">
                          {formatCurrency(Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.12))}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-[#7A8C7E]">
                        <span>Integrated IGST Import Duty (18%):</span>
                        <span className="font-bold text-stone-700 font-mono">
                          {formatCurrency(Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.18))}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl mt-2 font-bold">
                        <span>LuxeCare Rate-Lock Duty Rebate:</span>
                        <span className="font-mono">- {formatCurrency(Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.05))}</span>
                      </div>

                      <div className="flex justify-between text-sm text-[#2A3B2D] border-t border-dashed border-[#E6E0D5] pt-3 mt-1 font-serif font-bold">
                        <span>Estimated Total Cost:</span>
                        <span className="text-[#5A6D5D] text-md font-mono">
                          {formatCurrency(
                            cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) +
                            Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.12) +
                            Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.18) -
                            Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.05)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STATE 3: Billing & Customs inputs */}
                {checkoutStep === "CHECKOUT" && (
                  <form onSubmit={simulateCheckoutProcessing} className="space-y-5">
                    
                    {/* Delivery Section */}
                    <div className="space-y-3 bg-white p-5 rounded-3xl border border-[#E6E0D5]">
                      <p className="text-[11px] font-bold text-[#5A6D5D] tracking-wider uppercase flex items-center justify-between gap-1.5 w-full">
                        <span>📍 Delivery Destination</span>
                        {user ? (
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
                            ✓ LINKED: {user.name.split(" ")[0]}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCartOpen(false);
                              setIsAuthOpen(true);
                            }}
                            className="text-[9px] text-[#5A6D5D] hover:underline hover:text-[#2A3B2D] font-extrabold cursor-pointer"
                          >
                            Sign In / Sign Up to Autofill
                          </button>
                        )}
                      </p>
                      
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] text-[#7A8C7E] font-bold uppercase mb-1">Shipping Street Address</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Flat 304, Green Heights, Bandra West"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D5] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] rounded-xl text-stone-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-[#7A8C7E] font-bold uppercase mb-1">City / State</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Mumbai, MH"
                              value={shippingCity}
                              onChange={(e) => setShippingCity(e.target.value)}
                              className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D5] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] rounded-xl text-stone-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#7A8C7E] font-bold uppercase mb-1">Postal PIN Code</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 400050"
                              value={shippingZip}
                              onChange={(e) => setShippingZip(e.target.value)}
                              className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D5] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] rounded-xl text-stone-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment section */}
                    <div className="space-y-3 bg-white p-5 rounded-3xl border border-[#E6E0D5]">
                      <p className="text-[11px] font-bold text-[#5A6D5D] tracking-wider uppercase flex items-center justify-between">
                        <span>💳 Secure Payment (Simulation Agency)</span>
                        <span className="inline-flex items-center gap-1.5 text-[9px] text-[#7A8C7E] font-bold">
                          <Lock className="w-3 h-3 text-[#5A6D5D]" /> 256-BIT SSL
                        </span>
                      </p>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] text-[#7A8C7E] font-bold uppercase mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Divas Sharma"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D5] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] rounded-xl text-stone-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-[#7A8C7E] font-bold uppercase mb-1">Credit / Debit Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={19}
                              placeholder="4111 2222 3333 4444"
                              value={cardNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                                const matches = val.match(/\d{4,16}/g);
                                const match = (matches && matches[0]) || "";
                                const parts = [];
                                for (let i = 0, len = match.length; i < len; i += 4) {
                                  parts.push(match.substring(i, i + 4));
                                }
                                if (parts.length > 0) {
                                  setCardNumber(parts.join(" "));
                                } else {
                                  setCardNumber(val);
                                }
                              }}
                              className="w-full p-2.5 pl-10 text-xs bg-[#FAF8F5] border border-[#E6E0D5] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] rounded-xl text-stone-800 font-mono"
                            />
                            <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-[#7A8C7E] font-bold uppercase mb-1">Expiry Date</label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/gi, "");
                                if (val.length >= 2) {
                                  setCardExpiry(val.substring(0, 2) + "/" + val.substring(2, 4));
                                } else {
                                  setCardExpiry(val);
                                }
                              }}
                              className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D5] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] rounded-xl text-stone-800 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#7A8C7E] font-bold uppercase mb-1">CVV Security Code</label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/gi, ""))}
                              className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D5] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] rounded-xl text-stone-800 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duty details invoice receipt block */}
                    <div className="p-4 bg-stone-50 border border-[#E6E0D5] rounded-2xl text-[11px] text-[#7A8C7E] space-y-1 bg-white">
                      <div className="flex items-center gap-1.5 font-bold text-[#5A6D5D] mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>India Customs Rate Lock Certificate</span>
                      </div>
                      <p>Maritime ocean logistics tariffs are locked for 45 minutes under custom duty code <strong>LC-KBEAUTY-2026</strong>. Wholesale custom exemption rates are applied cleanly.</p>
                    </div>

                    {/* Submit pay buttons */}
                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep("CART")}
                        className="flex-1 py-3 text-xs bg-[#E6E0D5]/50 hover:bg-[#E6E0D5] text-[#2A3B2D] font-extrabold rounded-full transition-all cursor-pointer"
                      >
                        Adjust Cart
                      </button>
                      <button
                        type="submit"
                        className="flex-grow py-3 px-6 text-xs bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white font-extrabold rounded-full transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay {formatCurrency(
                          cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) +
                          Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.12) +
                          Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.18) -
                          Math.round(cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0) * 0.05)
                        )}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* STATE 4: Loading Screen */}
                {checkoutStep === "PROCESSING" && (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-[#E6E0D5] border-t-[#5A6D5D] rounded-full animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-md font-serif font-bold text-[#2A3B2D]">Contacting Port Authorities</h3>
                      <p className="text-xs text-[#7A8C7E] max-w-xs leading-relaxed font-bold animate-pulse">
                        {processingStepText}
                      </p>
                    </div>
                  </div>
                )}

                {/* STATE 5: Receipt */}
                {checkoutStep === "RECEIPT" && (
                  <div className="space-y-6 py-4 animate-fade-in">
                    
                    {/* Visual Stamp */}
                    <div className="bg-white p-6 rounded-3xl border border-[#E6E0D5] text-center space-y-3.5">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-800">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-md font-serif font-bold text-[#2A3B2D]">Gate-Clearance Approved!</h3>
                        <p className="text-[10px] text-emerald-800 font-extrabold uppercase mt-0.5 tracking-wider">LuxeCare Custom Ocean Manifest Dispatch Complete</p>
                      </div>
                    </div>

                    {/* Receipt Details Card */}
                    <div className="bg-white p-5 rounded-3xl border border-[#E6E0D5] space-y-4 shadow-xs relative overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] text-[#7A8C7E] pb-3 border-b border-[#F5F2ED]">
                        <div>
                          <span className="font-bold block">CONTAINER ID</span>
                          <span className="font-mono text-[#2A3B2D] font-bold">LXC-MAR-{Math.floor(100000 + Math.random() * 900000)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold block">INVOICE GATEWAY</span>
                          <span className="font-mono text-[#2A3B2D] font-bold">SECURE-PAY-IND</span>
                        </div>
                      </div>

                      {/* Purchased lines */}
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7A8C7E] block">Secured Formulations</span>
                        
                        {lastReceipt.map((item) => {
                          const itemPrice = calculateINRPrice(item.product.basePriceKRW, pricingConfig);
                          return (
                            <div key={item.product.id} className="flex justify-between text-xs text-[#2A3B2D]">
                              <span>{item.product.brand} {item.product.name} <strong className="text-stone-400 font-normal">x{item.quantity}</strong></span>
                              <span className="font-mono font-bold">{formatCurrency(itemPrice * item.quantity)}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-2 pt-3 border-t border-[#F5F2ED]">
                        <div className="flex justify-between text-[11px] text-[#7A8C7E]">
                          <span>Custom duty rebates & IGST clearance:</span>
                          <span className="text-emerald-700 font-bold">Approved</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#7A8C7E]">
                          <span>Active exchange lock tracer:</span>
                          <span className="font-mono font-bold">{formatCurrency(receiptTotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#2A3B2D] font-bold font-serif pt-1">
                          <span>Total Amount Processed:</span>
                          <span className="text-[#5A6D5D] text-sm font-mono font-extrabold">{formatCurrency(receiptTotal)}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-dashed border-[#E6E0D5] text-[10px] text-[#7A8C7E] space-y-1">
                        <span className="font-bold block text-stone-600">DELIVERY TO:</span>
                        <p>{shippingAddress}, {shippingCity} - PIN {shippingZip}</p>
                        <p className="text-[9px] italic mt-1 text-stone-400">Your wholesale container will be shipped from Seoul to Cochin/Mumbai harbour and delivered within 8-12 days.</p>
                      </div>
                    </div>

                    {/* Primary CTA button */}
                    <button
                      onClick={() => {
                        setCheckoutStep("CART");
                        setIsCartOpen(false);
                      }}
                      className="w-full py-3.5 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white text-xs font-bold rounded-full transition-all text-center cursor-pointer shadow-md"
                    >
                      Return to Import Boutique
                    </button>
                  </div>
                )}

              </div>

              {/* Drawer bottom actions only in CART mode screen */}
              {checkoutStep === "CART" && cart.length > 0 && (
                <div className="p-6 border-t border-[#E6E0D5] bg-white gap-3 flex flex-col shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2A3B2D]">
                    <span>Cart Subtotal:</span>
                    <span className="text-sm font-mono text-[#5A6D5D]">
                      {formatCurrency(
                        cart.reduce((s, i) => s + calculateINRPrice(i.product.basePriceKRW, pricingConfig) * i.quantity, 0)
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        showToast("⚠️ Authentication Required: Please Sign In or Create an Importer ID to complete your purchase and calculate seaport customs clearances.", "error");
                        setIsCartOpen(false); // Close cart drawer so they can see input clearly or just show modal
                        setIsAuthOpen(true);
                      } else {
                        setCheckoutStep("CHECKOUT");
                      }
                    }}
                    className="w-full py-3 text-xs bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white font-extrabold rounded-full transition-all shadow-md text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Cargo Clearance</span>
                    <CreditCard className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[9px] text-[#7A8C7E] text-center font-bold">Rates auto-convert based on Live Indian Custom Board exchange rates.</p>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. Sign In/Up/Profile authentication modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal
            user={user}
            onUpdateUser={setUser}
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
