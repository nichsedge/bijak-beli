import type { Category } from "@/lib/types";
import { brands } from "./brands";

const rawCategories: Omit<Category, "brandCount">[] = [
  { id: "food-beverage",  name: "Food & Beverage",     nameId: "Makanan & Minuman",         icon: "🍜" },
  { id: "personal-care",  name: "Personal Care",        nameId: "Perawatan Diri",            icon: "🧴" },
  { id: "household",      name: "Household & Cleaning", nameId: "Pembersih & Rumah Tangga",  icon: "🧼" },
  { id: "pharmacy",       name: "Health & Pharmacy",    nameId: "Kesehatan & Obat",          icon: "💊" },
  { id: "technology",     name: "Technology",           nameId: "Teknologi",                 icon: "📱" },
  { id: "fashion",        name: "Fashion & Apparel",    nameId: "Mode & Pakaian",            icon: "👗" },
];

export const categories: Category[] = rawCategories.map((cat) => ({
  ...cat,
  brandCount: brands.filter((b) => b.category === cat.id).length,
}));

