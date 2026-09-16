import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "food-beverage",  name: "Food & Beverage",     nameId: "Makanan & Minuman",         icon: "🍜", brandCount: 49 },
  { id: "personal-care",  name: "Personal Care",        nameId: "Perawatan Diri",            icon: "🧴", brandCount: 9  },
  { id: "household",      name: "Household & Cleaning", nameId: "Pembersih & Rumah Tangga",  icon: "🧼", brandCount: 7  },
  { id: "pharmacy",       name: "Health & Pharmacy",    nameId: "Kesehatan & Obat",          icon: "💊", brandCount: 5  },
  { id: "technology",     name: "Technology",           nameId: "Teknologi",                 icon: "📱", brandCount: 4  },
  { id: "fashion",        name: "Fashion & Apparel",    nameId: "Mode & Pakaian",            icon: "👗", brandCount: 2  },
];
