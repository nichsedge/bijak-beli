import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "food-beverage",  name: "Food & Beverage",    nameId: "Makanan & Minuman",    icon: "🍜", brandCount: 28 },
  { id: "personal-care",  name: "Personal Care",       nameId: "Perawatan Diri",       icon: "🧴", brandCount: 8  },
  { id: "fashion",        name: "Fashion & Apparel",   nameId: "Mode & Pakaian",       icon: "👗", brandCount: 2  },
  { id: "household",      name: "Household & Cleaning", nameId: "Pembersih & Rumah Tangga", icon: "🧼", brandCount: 10 },
  { id: "pharmacy",       name: "Health & Pharmacy",    nameId: "Kesehatan & Obat",         icon: "💊", brandCount: 8  },
  { id: "technology",     name: "Technology",          nameId: "Teknologi",            icon: "📱", brandCount: 4  },
];
