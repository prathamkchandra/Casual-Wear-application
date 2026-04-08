import { dbConnect } from "./db";
import Product, { IProduct } from "@/models/Product";
import Category, { ICategory } from "@/models/Category";

export async function getProducts(limit?: number): Promise<IProduct[]> {
  await dbConnect();
  const query = Product.find().sort({ createdAt: -1 });
  if (limit) query.limit(limit);
  return query.lean();
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  await dbConnect();
  return Product.findOne({ slug }).lean();
}

export async function getCategories(): Promise<ICategory[]> {
  await dbConnect();
  return Category.find().sort({ name: 1 }).lean();
}
