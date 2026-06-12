import React, { useState } from "react";
import { SkincareProduct, PricingConfig, CurrencyUnit } from "../data/skincareData";
import { ShieldAlert, RefreshCw, Layers, DollarSign, Percent, TrendingUp, Truck, Plus, Trash2, CheckCircle } from "lucide-react";

interface AdminPanelProps {
  products: SkincareProduct[];
  pricingConfig: PricingConfig;
  onChangePricing: (newConfig: PricingConfig) => void;
  onUpdateProducts: (updatedList: SkincareProduct[]) => void;
  orders: any[];
  activeCurrency?: CurrencyUnit;
  formatCurrency?: (valInINR: number) => string;
  showToast?: (message: string, type?: "success" | "info" | "error") => void;
}

export default function AdminPanel({
  products,
  pricingConfig,
  onChangePricing,
  onUpdateProducts,
  orders,
  activeCurrency = { code: "INR", symbol: "₹", rateToINR: 1.0 },
  formatCurrency = (val: number) => `₹${val.toLocaleString()}`,
  showToast = () => {}
}: AdminPanelProps) {
  // Local active states for formula config inputs
  const [exchangeInput, setExchangeInput] = useState(pricingConfig.exchangeRateKRWtoINR);
  const [dutyInput, setDutyInput] = useState(pricingConfig.customDutyPercent);
  const [shippingInput, setShippingInput] = useState(pricingConfig.shippingCostINR);
  const [marginInput, setMarginInput] = useState(pricingConfig.profitMarginPercent);

  // New item form
  const [newItemName, setNewItemName] = useState("");
  const [newItemBrand, setNewItemBrand] = useState("COSRX");
  const [newItemCategory, setNewItemCategory] = useState("Toner");
  const [newItemIngredient, setNewItemIngredient] = useState("");
  const [newItemKRWPrice, setNewItemKRWPrice] = useState(12000);
  const [newItemDesc, setNewItemDesc] = useState("");

  const handleApplyPricingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onChangePricing({
      exchangeRateKRWtoINR: Number(exchangeInput),
      customDutyPercent: Number(dutyInput),
      shippingCostINR: Number(shippingInput),
      profitMarginPercent: Number(marginInput)
    });
    showToast("💸 Pricing formulas successfully updated across the LUXECARE retail marketplace!", "success");
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemIngredient.trim()) {
      showToast("Please specify the retail product name and active ingredients.", "error");
      return;
    }

    const newItem: SkincareProduct = {
      id: `prod-${Date.now()}`,
      name: newItemName,
      brand: newItemBrand,
      category: newItemCategory,
      activeIngredient: newItemIngredient,
      basePriceKRW: Number(newItemKRWPrice),
      description: newItemDesc || "Fresh organic formula imported from Gangnam, South Korea.",
      stock: 50,
      rating: 4.8,
      reviewsCount: 1,
      skinTypeTags: ["Combination", "Dry"],
      concernTags: ["Dehydration", "Dullness"],
      imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=400"
    };

    onUpdateProducts([...products, newItem]);
    setNewItemName("");
    setNewItemIngredient("");
    setNewItemDesc("");
    showToast(`🎉 Created & Imported "${newItem.name}" to Indian Inventory!`, "success");
  };

  const handleDeleteItem = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
    showToast("🗑️ Discontinued importing selected catalog item from marketplace list.", "info");
  };

  const handleQuickStockRefill = (id: string) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return { ...p, stock: p.stock + 60 };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  return (
    <div className="space-y-12 animate-fade-in" id="admin-module">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E6E0D5] text-[#2A3B2D] rounded-full text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-[#5A6D5D]" />
          HQ Back-Office Dashboard
        </div>
        <h2 className="text-4xl font-serif italic text-[#2A3B2D] tracking-tight">
          Importers & Logistics Manager
        </h2>
        <p className="text-sm text-[#7A8C7E]">
          Audit shipping log overheads, adjust exchange rates, calculate custom Indian trade profit offsets, inspect live orders, and manage your full imported K-Beauty catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Mathematical Formula Pricing config */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-6">
          <div className="border-b border-[#F9F7F2] pb-3">
            <h3 className="text-base font-serif font-bold text-[#2A3B2D] flex items-center gap-2">
              📊 Core Pricing Formula Inputs
            </h3>
            <p className="text-xxs text-stone-550">Recalculate INR values instantaneously</p>
          </div>

          <form onSubmit={handleApplyPricingConfig} className="space-y-4 text-xs" id="importers-formula-form">
            {/* Exchange rate */}
            <div className="space-y-1">
              <label className="font-bold text-[#3C3C3C] flex items-center justify-between">
                <span>KRW to INR Exchange Rate</span>
                <span className="text-[#5A6D5D] font-bold">1 ₩ = ₹{exchangeInput}</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="0.01"
                max="0.5"
                value={exchangeInput}
                onChange={(e) => setExchangeInput(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-[#3C3C3C]"
              />
            </div>

            {/* Custom Duty % */}
            <div className="space-y-1">
              <label className="font-bold text-[#3C3C3C] flex items-center justify-between">
                <span>Custom Import Duty Tax (%)</span>
                <span className="text-[#5A6D5D] font-bold">{dutyInput}%</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={dutyInput}
                onChange={(e) => setDutyInput(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-[#3C3C3C]"
              />
            </div>

            {/* Packaging and consolidators sea shipping */}
            <div className="space-y-1">
              <label className="font-bold text-[#3C3C3C] flex items-center justify-between">
                <span>Sea-Cargo Shipping/Logistics (INR/item)</span>
                <span className="text-[#5A6D5D] font-bold">{formatCurrency(shippingInput)}</span>
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={shippingInput}
                onChange={(e) => setShippingInput(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-[#3C3C3C]"
              />
            </div>

            {/* Retail markup margin */}
            <div className="space-y-1">
              <label className="font-bold text-[#3C3C3C] flex items-center justify-between">
                <span>Target Company Profit Margin (%)</span>
                <span className="text-emerald-700 font-bold">+{marginInput}%</span>
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={marginInput}
                onChange={(e) => setMarginInput(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-[#3C3C3C]"
              />
            </div>

            <button
              id="submit-pricing-config-btn"
              type="submit"
              className="w-full py-3 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white rounded-full font-bold transition-all shadow-sm cursor-pointer"
            >
              Apply New Formulas
            </button>
          </form>

          {/* Pricing simulation calculation trace box */}
          <div className="bg-[#F9F7F2] p-4 rounded-2xl border border-[#E6E0D5] text-[11px] text-[#7A8C7E] space-y-2">
            <span className="font-bold text-[#2A3B2D] block">🧮 Display selling price trace formula:</span>
            <div className="font-mono bg-white p-2 border border-[#E6E0D5] rounded-xl space-y-1 text-center font-semibold text-[#5A6D5D]">
              <div>Cost INR = (Wholesale_KRW × Exchange)</div>
              <div>Duty INR = Cost_INR × Custom_Duty%</div>
              <div>Net Base = Cost_INR + Duty_INR + Shipping_INR</div>
              <div className="text-[#2A3B2D] font-extrabold mt-1">Final Display = Net_Base × (1 + Margin%) × RateToLocal</div>
            </div>
          </div>
        </div>

        {/* Right Tab panels: catalog manager / Orders ledger */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Orders ledger */}
          <div className="bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#2A3B2D] flex items-center gap-2 border-b border-[#F9F7F2] pb-3">
              📦 Real-time Customer Orders Ledger ({orders.length} events)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" id="ledger-table">
                <thead>
                  <tr className="bg-[#F9F7F2] text-[#7A8C7E] font-bold uppercase tracking-wider border-b border-[#E6E0D5]">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Curated Profile</th>
                    <th className="p-3">Price paid</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D5]">
                  {orders.map((ord) => (
                    <tr key={ord.id} id={`order-row-${ord.id}`} className="hover:bg-[#F9F7F2]/50">
                      <td className="p-3 font-mono font-bold text-[#2A3B2D]">{ord.id}</td>
                      <td className="p-3 font-bold text-[#3C3C3C]">{ord.type}</td>
                      <td className="p-3 text-[#7A8C7E]">{ord.details}</td>
                      <td className="p-3 font-serif font-bold text-[#2A3B2D]">{formatCurrency(ord.price || 0)}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 bg-emerald-55 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-100">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#7A8C7E] font-bold">
                        No transactions completed in current consumer session yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catalog items manager */}
          <div className="bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-4" id="catalog-manager">
            <h3 className="text-base font-bold font-serif text-[#2A3B2D] flex items-center gap-2 border-b border-[#F9F7F2] pb-3">
              📑 Warehouse Products Catalog ({products.length} Items)
            </h3>

            {/* List with direct stock updates & delete */}
            <div className="space-y-2 overflow-y-auto max-h-72" id="admin-catalog-list">
              {products.map((p) => {
                // Calculate direct price
                const rawCost = p.basePriceKRW * exchangeInput;
                const dutyCost = rawCost * (dutyInput / 100);
                const finalSelling = Math.round((rawCost + dutyCost + shippingInput) * (1 + marginInput / 100));

                return (
                  <div key={p.id} className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3 items-center">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#5A6D5D]">{p.brand}</span>
                        <h4 className="text-xs font-bold text-[#2A3B2D] truncate max-w-sm">{p.name}</h4>
                        <div className="text-[10px] text-[#7A8C7E]">
                          Wholesale: ₩{p.basePriceKRW.toLocaleString()} KRW | Calculated Selling: <span className="text-[#2A3B2D] font-bold">{formatCurrency(finalSelling)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end text-xs">
                      <div className="text-right">
                        <span className={`text-[10px] font-bold block ${p.stock < 60 ? "text-amber-700" : "text-emerald-700"}`}>
                          Stock: {p.stock} units
                        </span>
                        <button
                          id={`refill-stock-btn-${p.id}`}
                          onClick={() => handleQuickStockRefill(p.id)}
                          className="text-[10px] text-[#5A6D5D] hover:underline font-bold block cursor-pointer"
                        >
                          + Refill (+60)
                        </button>
                      </div>

                      <button
                        id={`delete-catalog-btn-${p.id}`}
                        onClick={() => handleDeleteItem(p.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg shrink-0 cursor-pointer"
                        title="Discontinue Import"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add new imported item panel */}
            <div className="bg-[#F9F7F2] p-5 rounded-[24px] border border-[#E6E0D5] space-y-4">
              <h4 className="text-xs font-bold uppercase text-[#2A3B2D] tracking-wider flex items-center gap-1">
                <Plus className="w-4 h-4 text-[#5A6D5D]" /> Import New Product Form ( Seoul Depot )
              </h4>

              <form onSubmit={handleAddNewItem} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs" id="importers-addproduct-form">
                <div className="space-y-1">
                  <label className="font-bold text-[#3C3C3C] text-xxs uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heartleaf Pore Clay Mask"
                    value={newItemName}
                    className="w-full p-2 bg-white border border-[#E6E0D5] rounded-xl text-xs text-[#3C3C3C]"
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#3C3C3C] text-xxs uppercase tracking-wider">Korean Brand</label>
                  <select
                    className="w-full p-2 bg-white border border-[#E6E0D5] rounded-xl text-xs text-[#3C3C3C]"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                  >
                    {["COSRX", "Beauty of Joseon", "Anua", "SKIN1004", "Some By Mi", "I'm From", "Laneige"].map((br) => (
                      <option key={br} value={br}>{br}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#3C3C3C] text-xxs uppercase tracking-wider">Active Ingredients</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kaolin Clay + Heartleaf 10%"
                    value={newItemIngredient}
                    className="w-full p-2 bg-white border border-[#E6E0D5] rounded-xl text-xs text-[#3C3C3C]"
                    onChange={(e) => setNewItemIngredient(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#3C3C3C] text-xxs uppercase tracking-wider">Wholesale Price (KRW)</label>
                  <input
                    type="number"
                    min="1000"
                    max="100000"
                    placeholder="e.g. 15000"
                    value={newItemKRWPrice}
                    className="w-full p-2 bg-white border border-[#E6E0D5] rounded-xl text-xs text-[#3C3C3C]"
                    onChange={(e) => setNewItemKRWPrice(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-[#3C3C3C] text-xxs uppercase tracking-wider">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Perfect clay formulation that targets high sebum in oily skin..."
                    value={newItemDesc}
                    className="w-full p-2 bg-white border border-[#E6E0D5] rounded-xl text-xs text-[#3C3C3C]"
                    onChange={(e) => setNewItemDesc(e.target.value)}
                  />
                </div>

                <button
                  id="add-import-item-btn"
                  type="submit"
                  className="md:col-span-2 py-3 bg-[#2A3B2D] hover:bg-[#1A2E1D] text-white font-bold rounded-full transition-all text-xs cursor-pointer shadow"
                >
                  Confirm Import and Save Product
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
