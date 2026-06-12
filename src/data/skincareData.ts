export interface SkincareProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  activeIngredient: string;
  basePriceKRW: number; // Price in Korea
  description: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  skinTypeTags: string[];
  concernTags: string[];
  imageUrl: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  clinicName: string;
  location: string;
  isAvailableInIndia: boolean;
  distanceKm: number; // mock distance from user
  rating: number;
  consultationFeeINR: number;
  imageUrl: string;
  nextAvailableSlot: string;
  coordinates: { lat: number; lng: number };
}

// Initial Import/Pricing Configuration
export interface PricingConfig {
  exchangeRateKRWtoINR: number; // e.g. 1 KRW = 0.062 INR
  customDutyPercent: number;    // e.g. 20% tax
  shippingCostINR: number;      // Fixed logistics overhead in INR per item
  profitMarginPercent: number;  // Company's added markup e.g. 35%
}

export interface CurrencyUnit {
  code: string;
  symbol: string;
  rateToINR: number;
}

export const SUPPORTED_CURRENCIES: CurrencyUnit[] = [
  { code: "INR", symbol: "₹", rateToINR: 1.0 },
  { code: "USD", symbol: "$", rateToINR: 0.012 },
  { code: "EUR", symbol: "€", rateToINR: 0.011 },
  { code: "KRW", symbol: "₩", rateToINR: 16.2 }
];

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  exchangeRateKRWtoINR: 0.061,
  customDutyPercent: 20,
  shippingCostINR: 180,
  profitMarginPercent: 30
};

// Helper function to calculate selling price in INR
export function calculateINRPrice(baseKRW: number, config: PricingConfig): number {
  const rawINR = baseKRW * config.exchangeRateKRWtoINR;
  const dutyCost = rawINR * (config.customDutyPercent / 100);
  const costPrice = rawINR + dutyCost + config.shippingCostINR;
  const sellingPrice = costPrice * (1 + config.profitMarginPercent / 100);
  return Math.round(sellingPrice);
}

export const INITIAL_PRODUCTS: SkincareProduct[] = [
  {
    id: "prod-1",
    name: "Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    category: "Essence",
    activeIngredient: "Snail Secretion Filtrate 96%",
    basePriceKRW: 16000,
    description: "Highly concentrated essence that hydrates, repairs skin damage, reduces hyperpigmentation, and creates the legendary glowing 'K-Beauty Glass Skin'.",
    stock: 145,
    rating: 4.9,
    reviewsCount: 312,
    skinTypeTags: ["Dry", "Acne-Prone", "Sensitive", "Combination"],
    concernTags: ["Dehydration", "Scars/Spots", "Redness", "Aging"],
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-2",
    name: "Relief Sun : Rice + Probiotics SPF50+",
    brand: "Beauty of Joseon",
    category: "Sunscreen",
    activeIngredient: "Rice Extract 30% + Grain Fermented Extracts",
    basePriceKRW: 15000,
    description: "Moisturizing organic sunscreen that applies comfortably on the skin and contains skin-brightening and soothing probiotics perfect for Indian climates.",
    stock: 92,
    rating: 4.8,
    reviewsCount: 247,
    skinTypeTags: ["Normal", "Dry", "Sensitive", "Combination"],
    concernTags: ["Sun Protection", "Dullness", "Redness"],
    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-3",
    name: "Heartleaf 77% Soothing Toner",
    brand: "Anua",
    category: "Toner",
    activeIngredient: "Heartleaf Extract (Houttuynia Cordata) 77%",
    basePriceKRW: 18000,
    description: "The #1 toner in South Korea. Extremely soothing, works exceptionally well on acne, heat rash, and inflammatory redness. Perfect for sensitive or acne-prone skin.",
    stock: 110,
    rating: 4.7,
    reviewsCount: 188,
    skinTypeTags: ["Oily", "Acne-Prone", "Sensitive", "Combination"],
    concernTags: ["Redness", "Acne", "Secretion Calibration", "Irritation"],
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-4",
    name: "Ginseng Cleansing Oil",
    brand: "Beauty of Joseon",
    category: "Cleanser",
    activeIngredient: "Ginseng Seed Oil 0.1% + Soybean Oil",
    basePriceKRW: 17000,
    description: "A lightweight cleansing oil that gently micellarizes and melts sebum and makeup residue while herbal hanbang nourishment keeps skin moisturized.",
    stock: 75,
    rating: 4.6,
    reviewsCount: 95,
    skinTypeTags: ["Oily", "Combination", "Dry"],
    concernTags: ["Clogged Pores", "Blackheads", "Makeup Removal"],
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-5",
    name: "Madagascar Centella Ampoule",
    brand: "SKIN1004",
    category: "Serum",
    activeIngredient: "Centella Asiatica Extract 100%",
    basePriceKRW: 21000,
    description: "An absolute miracle ampoule containing raw Madagascar Centella to instantly quench skin inflammation, repair dry skin barriers, and balance oil-water ratios.",
    stock: 80,
    rating: 4.9,
    reviewsCount: 140,
    skinTypeTags: ["Sensitive", "Dry", "Oily", "Acne-Prone"],
    concernTags: ["Irritation", "Acne", "Damaged Barrier", "Redness"],
    imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-6",
    name: "AHA BHA PHA 30Days Miracle Toner",
    brand: "Some By Mi",
    category: "Toner",
    activeIngredient: "Teatree 10,000ppm + Real AHA BHA PHA",
    basePriceKRW: 19000,
    description: "An exfoliating skin toner that works effectively as structural pore flush. Restores healthy skin turnover rate inside 30 days without excessive chemical sting.",
    stock: 130,
    rating: 4.5,
    reviewsCount: 172,
    skinTypeTags: ["Oily", "Acne-Prone", "Combination"],
    concernTags: ["Clogged Pores", "Acne", "Uneven Texture"],
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-7",
    name: "Ginseng Moist Sun Serum",
    brand: "Beauty of Joseon",
    category: "Sunscreen",
    activeIngredient: "Ginseng Extract 30% + Niacinamide 2%",
    basePriceKRW: 19500,
    description: "A dual-function sun protection serum delivering rich saponins from Korean Red Ginseng, combining structural aging protection with powerful sunblock filters.",
    stock: 65,
    rating: 4.8,
    reviewsCount: 111,
    skinTypeTags: ["Dry", "Normal", "Aging"],
    concernTags: ["Sun Protection", "Aging", "Dullness"],
    imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-8",
    name: "I'm From Rice Toner",
    brand: "I'm From",
    category: "Toner",
    activeIngredient: "Yeoju Rice Extract 77.78%",
    basePriceKRW: 24000,
    description: "Formulated with premium organic Yeoju Rice. Eliminated impurities deeply, evens skin tone pigmentation, and provides bouncy, radiant, and deeply moisturized glass skin.",
    stock: 55,
    rating: 4.9,
    reviewsCount: 220,
    skinTypeTags: ["Dry", "Normal", "Dull"],
    concernTags: ["Dullness", "Dryness", "Hyperpigmentation"],
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400"
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sang-Woo Park",
    specialty: "Aesthetic K-Beauty Dermatologist",
    experience: 16,
    clinicName: "LuxeSkin Clinique Gangnam",
    location: "Seoul, South Korea (Remote Consults Available)",
    isAvailableInIndia: false,
    distanceKm: 5200,
    rating: 4.9,
    consultationFeeINR: 2000,
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    nextAvailableSlot: "Today at 4:30 PM IST",
    coordinates: { lat: 37.4979, lng: 127.0276 }
  },
  {
    id: "doc-2",
    name: "Dr. Ananya Sharma",
    specialty: "Clinical Specialist (Glass Skin & HyperPigmentation)",
    experience: 12,
    clinicName: "LUXECARE Partner Clinic, Delhi Center",
    location: "Vasant Vihar, New Delhi, India",
    isAvailableInIndia: true,
    distanceKm: 4.2,
    rating: 4.8,
    consultationFeeINR: 950,
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    nextAvailableSlot: "Tomorrow at 11:00 AM IST",
    coordinates: { lat: 28.5607, lng: 77.1617 }
  },
  {
    id: "doc-3",
    name: "Dr. Rohit Deshmukh",
    specialty: "Scalp Health & Trichologist Expert",
    experience: 14,
    clinicName: "Advanced Trichology Institute & Spa",
    location: "Bandra West, Mumbai, India",
    isAvailableInIndia: true,
    distanceKm: 12.8,
    rating: 4.7,
    consultationFeeINR: 1100,
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
    nextAvailableSlot: "June 14 at 2:00 PM IST",
    coordinates: { lat: 19.0596, lng: 72.8295 }
  },
  {
    id: "doc-4",
    name: "Dr. Min-Ji Kim",
    specialty: "Acne scar treatment & Skin Barrier Specialist",
    experience: 15,
    clinicName: "Seoul National Skin Clinic",
    location: "Mapo-gu, Seoul, S.Korea (Remote Consults Available)",
    isAvailableInIndia: false,
    distanceKm: 5180,
    rating: 4.95,
    consultationFeeINR: 2200,
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    nextAvailableSlot: "Today at 5:45 PM IST",
    coordinates: { lat: 37.5562, lng: 126.9213 }
  },
  {
    id: "doc-5",
    name: "Dr. Priya Narayanan",
    specialty: "Cosmetic Dermatologist & Laser Specialist",
    experience: 10,
    clinicName: "ClearSkin Luxe Clinic",
    location: "Indiranagar, Bengaluru, India",
    isAvailableInIndia: true,
    distanceKm: 8.5,
    rating: 4.6,
    consultationFeeINR: 800,
    imageUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=200",
    nextAvailableSlot: "Monday at 10:00 AM IST",
    coordinates: { lat: 12.9784, lng: 77.6408 }
  }
];
