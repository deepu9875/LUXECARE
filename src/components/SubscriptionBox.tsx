import React, { useState } from "react";
import { SkincareProduct, PricingConfig, calculateINRPrice, CurrencyUnit } from "../data/skincareData";
import { Sparkles, Check, Gift, ShoppingBag, Truck, Calendar, Info, RefreshCw, Heart } from "lucide-react";

interface SubBoxProps {
  products: SkincareProduct[];
  pricingConfig: PricingConfig;
  onAddOrder: (order: any) => void;
  activeCurrency?: CurrencyUnit;
  formatCurrency?: (valInINR: number) => string;
  showToast?: (message: string, type?: "success" | "info" | "error") => void;
}

export default function SubscriptionBox({
  products,
  pricingConfig,
  onAddOrder,
  activeCurrency = { code: "INR", symbol: "₹", rateToINR: 1.0 },
  formatCurrency = (val: number) => `₹${val.toLocaleString()}`,
  showToast = () => {}
}: SubBoxProps) {
  const [boxTarget, setBoxTarget] = useState<"Glass Glow" | "Acne Calm" | "Dryness Repair" | "Age Defense">("Glass Glow");
  const [boxSize, setBoxSize] = useState<2 | 4 | 6>(4);
  const [frequency, setFrequency] = useState<"30" | "60">("30");
  const [isOrdering, setIsOrdering] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  // Match products based on selection
  const getSelectedProducts = (): SkincareProduct[] => {
    let subset: SkincareProduct[] = [];
    if (boxTarget === "Glass Glow") {
      // Prioritize hydrating, essence, sunscreen
      subset = products.filter(p => p.concernTags.includes("Dullness") || p.concernTags.includes("Dehydration") || p.category === "Essence");
    } else if (boxTarget === "Acne Calm") {
      // Centella, Teatree, Toner
      subset = products.filter(p => p.concernTags.includes("Acne") || p.concernTags.includes("Redness") || p.activeIngredient.includes("Centella") || p.activeIngredient.includes("Teatree"));
    } else if (boxTarget === "Dryness Repair") {
      // Cream, oil, Snail, dense serums
      subset = products.filter(p => p.skinTypeTags.includes("Dry") || p.concernTags.includes("Dehydration") || p.concernTags.includes("Damaged Barrier"));
    } else {
      // Ginseng, Aging
      subset = products.filter(p => p.concernTags.includes("Aging") || p.activeIngredient.includes("Ginseng"));
    }

    // Default to everything if empty for safety
    if (subset.length === 0) subset = products;

    // Slice to match box size
    return subset.slice(0, boxSize);
  };

  const selectedItems = getSelectedProducts();

  // Calculate prices
  const totalBaseKRW = selectedItems.reduce((sum, p) => sum + p.basePriceKRW, 0);
  
  // Calculate final Indian retail price using standard helper
  const finalSellingINR = selectedItems.reduce((sum, p) => sum + calculateINRPrice(p.basePriceKRW, pricingConfig), 0);

  // Apply a 15% discount for subscribing!
  const subscriptionDiscount = Math.round(finalSellingINR * 0.15);
  const subBoxINRPrice = finalSellingINR - subscriptionDiscount;

  const handleCreateSubscription = () => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setIsOrdered(true);
      
      // Notify parent app of mock order
      onAddOrder({
        id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "Subscription Box",
        details: `${boxTarget} Box (${boxSize} Premium K-Items)`,
        price: subBoxINRPrice,
        date: new Date().toLocaleDateString(),
        status: "Shipment Preparing"
      });

      showToast(`🎉 Congratulations! Your LUXECARE "${boxTarget} subscription box" has been registered. Selected recurrance tier value is ${formatCurrency(subBoxINRPrice)}. Expected cargo arrival in 7 working days from Gangnam Harbor.`, "success");
    }, 1500);
  };

  return (
    <div className="space-y-12 animate-fade-in" id="subscription-box-module">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E6E0D5] text-[#2A3B2D] rounded-full text-xs font-semibold uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5 text-[#5A6D5D]" />
          K-Beauty Box Curation
        </div>
        <h2 className="text-4xl font-serif italic text-[#2A3B2D] tracking-tight">
          K-Skincare Subscription Box Build
        </h2>
        <p className="text-sm text-[#7A8C7E]">
          Curate a recurring monthly skin care set containing fresh premium Korean imports. Customize your skin targets and volume to save on single item import taxes and enjoy home deliveries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Curation Controls */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#2A3B2D] border-b border-[#F9F7F2] pb-3 flex items-center gap-2">
            ⚙️ Curation Engine Preferences
          </h3>

          {/* 1. Target Skin Concerns */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[#7A8C7E] tracking-widest block font-sans">1. Select Skin Target Profile</label>
            <div className="grid grid-cols-2 gap-2" id="box-concern-selector">
              {[
                { id: "Glass Glow", icon: "✨", desc: "Radiant, smooth, hydrating" },
                { id: "Acne Calm", icon: "🌿", desc: "Soothes flareups, calms redness" },
                { id: "Dryness Repair", icon: "💧", desc: "Intense barrier nourishment" },
                { id: "Age Defense", icon: "👑", desc: "Korean ginseng revitalization" }
              ].map((t) => (
                <button
                  key={t.id}
                  id={`box-concern-btn-${t.id.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => { setBoxTarget(t.id as any); setIsOrdered(false); }}
                  className={`p-3 text-left rounded-2xl border transition-all ${
                    boxTarget === t.id
                      ? "bg-[#F9F7F2] border-[#5A6D5D] ring-2 ring-[#5A6D5D]/20 text-[#2A3B2D]"
                      : "bg-white border-[#E6E0D5] hover:bg-[#F9F7F2]/40 text-[#3C3C3C]"
                  }`}
                >
                  <div className="text-xs font-bold text-[#2A3B2D]">{t.icon} {t.id}</div>
                  <div className="text-[10px] text-[#7A8C7E] mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Box Tier Volume */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[#7A8C7E] tracking-widest block font-sans">2. Select Box Volume Tier</label>
            <div className="grid grid-cols-3 gap-2" id="box-size-selector">
              {[
                { size: 2, label: "Minimalist", tag: "2 K-Beauty Stars" },
                { size: 4, label: "Essential Spa", tag: "4 K-Beauty Stars" },
                { size: 6, label: "Royal Korean", tag: "6 K-Beauty Stars" }
              ].map((b) => (
                <button
                  key={b.size}
                  id={`box-size-btn-${b.size}`}
                  onClick={() => { setBoxSize(b.size as any); setIsOrdered(false); }}
                  className={`p-2.5 text-center rounded-2xl border transition-all ${
                    boxSize === b.size
                      ? "bg-[#5A6D5D] text-white border-[#5A6D5D]"
                      : "bg-[#F9F7F2] border-[#E6E0D5] text-[#3C3C3C] hover:bg-[#E6E0D5]/20"
                  }`}
                >
                  <div className="text-xs font-bold">{b.label}</div>
                  <div className={`text-[9px] mt-0.5 ${boxSize === b.size ? "text-[#E6E0D5]" : "text-[#7A8C7E]"}`}>{b.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Delivery intervals */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[#7A8C7E] tracking-widest block font-sans">3. Select Delivery Interval</label>
            <div className="grid grid-cols-2 gap-2" id="box-interval-selector">
              <button
                id="interval-btn-30"
                onClick={() => setFrequency("30")}
                className={`py-2 text-xs rounded-2xl border font-bold transition-all ${
                  frequency === "30"
                    ? "bg-[#2A3B2D] text-white border-[#2A3B2D]"
                    : "bg-[#F9F7F2] border-[#E6E0D5] text-[#3C3C3C]"
                }`}
              >
                Every 30 Days (Recommended)
              </button>
              <button
                id="interval-btn-60"
                onClick={() => setFrequency("60")}
                className={`py-2 text-xs rounded-2xl border font-bold transition-all ${
                  frequency === "60"
                    ? "bg-[#2A3B2D] text-white border-[#2A3B2D]"
                    : "bg-[#F9F7F2] border-[#E6E0D5] text-[#3C3C3C]"
                }`}
              >
                Every 60 Days (Seasonal Care)
              </button>
            </div>
          </div>

          {/* Pricing parameters calculations explainers */}
          <div className="bg-[#F9F7F2] p-3 rounded-2xl border border-[#E6E0D5] text-[10px] text-[#7A8C7E] space-y-1.5">
            <div className="font-bold text-[#2A3B2D] uppercase flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#5A6D5D]" /> Dynamic Pricing Disclosure ( Gangnam ⇌ Delhi Transit )
            </div>
            <div>
              We convert Seoul wholesale values using live rates (1 KRW = ₹{pricingConfig.exchangeRateKRWtoINR}). Customs custom duty ({pricingConfig.customDutyPercent}%) is automatically declared. Box logistics include consolidations that save about ₹400 in individual item shipping! All billing displays dynamically in your chosen currency ({activeCurrency.code}).
            </div>
          </div>
        </div>

        {/* Right curation view results */}
        <div className="lg:col-span-7 space-y-6">
          {isOrdered ? (
            <div className="p-12 text-center bg-white border border-[#E6E0D5] rounded-[32px] shadow-sm space-y-4 flex flex-col items-center justify-center animate-fade-in" id="ordered-subbox-screen">
              <div className="w-16 h-16 bg-[#F9F7F2] rounded-full flex items-center justify-center text-[#5A6D5D] border border-[#E6E0D5] mb-2">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif text-[#2A3B2D]">Your LUXECARE Box is Scheduled!</h3>
              <p className="text-xs text-[#7A8C7E] max-w-sm">
                Expected Arrival of first batch: next Friday. Customized strictly targeting your <strong>{boxTarget}</strong> concerns. Subscriptions automatically renew every {frequency} days with 15% VIP discounts.
              </p>
              <button
                id="re-curate-box-btn"
                onClick={() => setIsOrdered(false)}
                className="px-6 py-3 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white rounded-full text-xs font-semibold transition-all mt-2"
              >
                Re-curate Or Build Another Box
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-5" id="active-box-curation-results">
              <h3 className="text-lg font-serif text-[#2A3B2D] flex items-center gap-2">
                📦 Your Curated {boxTarget} Box ({boxSize} Items)
              </h3>

              {/* Items preview */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1" id="box-items-preview-list">
                {selectedItems.map((p) => (
                  <div key={p.id} className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D5] flex gap-3 items-center">
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A6D5D]">{p.brand}</span>
                      <h4 className="text-xs font-bold text-[#2A3B2D] truncate">{p.name}</h4>
                      <p className="text-[10px] text-[#7A8C7E] block truncate">Active ingredient: {p.activeIngredient}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xxs text-stone-400 capitalize">orig: ₩{p.basePriceKRW.toLocaleString()}</div>
                      <div className="text-xs font-serif font-bold text-[#2A3B2D]">{formatCurrency(calculateINRPrice(p.basePriceKRW, pricingConfig))}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown summary */}
              <div className="p-4 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D5] space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal KRW Wholesale:</span>
                  <span>₩{totalBaseKRW.toLocaleString()} KRW</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Custom Import retail overheads:</span>
                  <span>{formatCurrency(finalSellingINR - Math.round(totalBaseKRW * pricingConfig.exchangeRateKRWtoINR))}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Consolidated Single price:</span>
                  <span>{formatCurrency(finalSellingINR)}</span>
                </div>
                <div className="flex justify-between text-[#5A6D5D] font-bold">
                  <span>VIP Sub-builder discount (15%):</span>
                  <span>- {formatCurrency(subscriptionDiscount)}</span>
                </div>
                <div className="border-t border-[#E6E0D5] my-2 pt-2 flex justify-between text-[#2A3B2D] font-bold text-sm">
                  <span>Your Special recurring subscription price:</span>
                  <span className="text-base text-[#2A3B2D] font-serif">{formatCurrency(subBoxINRPrice)} <span className="text-xxs text-[#7A8C7E] font-sans font-normal">/ month</span></span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  id="checkout-subbox-btn"
                  disabled={isOrdering}
                  onClick={handleCreateSubscription}
                  className="w-full py-3.5 bg-[#5A6D5D] hover:bg-[#4A5D4D] disabled:bg-stone-300 text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isOrdering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Customizing cargo shipment...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Secure Korean Subscription ({formatCurrency(subBoxINRPrice)})
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#7A8C7E]">
                  <div className="flex flex-col items-center p-2">
                    <Truck className="w-4.5 h-4.5 text-[#5A6D5D] mb-1" />
                    <span>Free Indian Delivery</span>
                  </div>
                  <div className="flex flex-col items-center p-2">
                    <Calendar className="w-4.5 h-4.5 text-[#5A6D5D] mb-1" />
                    <span>Pause or Cancel Anytime</span>
                  </div>
                  <div className="flex flex-col items-center p-2">
                    <Heart className="w-4.5 h-4.5 text-[#5A6D5D] mb-1" />
                    <span>100% Skin Barrier Safe</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
