import { LeanDocument } from "mongoose";
import { dbConnect } from "./db";
import Product, { IProduct } from "@/models/Product";
import Category, { ICategory } from "@/models/Category";

type ProductPlain = LeanDocument<IProduct> & { _id: string };
type CategoryPlain = LeanDocument<ICategory> & { _id: string };

const toPlain = <T extends { _id: any }>(doc: T) => ({
  ...doc,
  _id: doc._id.toString(),
});

export async function getProducts(limit?: number): Promise<ProductPlain[]> {
  await dbConnect();
  const query = Product.find().sort({ createdAt: -1 }).lean();
  if (limit) query.limit(limit);
  const products = await query.exec();
  return products.map(toPlain);
}

export async function getProductBySlug(slug: string): Promise<ProductPlain | null> {
  await dbConnect();
  const product = await Product.findOne({ slug }).lean();
  return product ? toPlain(product) : null;
}

export async function getCategories(): Promise<CategoryPlain[]> {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories.map(toPlain);
}
