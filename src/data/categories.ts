import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "food-beverage",  name: "Food & Beverage",    nameId: "Makanan & Minuman",    icon: "🍜", brandCount: 8  },
  { id: "personal-care",  name: "Personal Care",       nameId: "Perawatan Diri",       icon: "🧴", brandCount: 4  },
  { id: "fashion",        name: "Fashion & Apparel",   nameId: "Mode & Pakaian",       icon: "👗", brandCount: 3  },
  { id: "technology",     name: "Technology",          nameId: "Teknologi",            icon: "📱", brandCount: 4  },
  { id: "transportation", name: "Transportation",      nameId: "Transportasi",         icon: "🚗", brandCount: 2  },
  { id: "finance",        name: "Finance",             nameId: "Keuangan",             icon: "💳", brandCount: 2  },
];
