import { dbConnect } from "./db";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { decodeSlugParam, normalizeSlug } from "./slug";
import { CategoryDTO, ProductDTO } from "@/types/shop";

type ProductLean = {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  priceInINR: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  categoryId?: mongoose.Types.ObjectId;
  stock?: number;
  tags?: string[];
};

type CategoryLean = {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
};

export async function getProducts(limit?: number): Promise<ProductDTO[]> {
  await dbConnect();
  const query = Product.find().sort({ createdAt: -1 }).lean();
  if (limit) query.limit(limit);
  const products = (await query.exec()) as ProductLean[];
  return products.map((product) => ({
    _id: product._id.toString(),
    title: product.title,
    slug: product.slug,
    description: product.description,
    priceInINR: product.priceInINR,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    images: product.images ?? [],
    categoryId: product.categoryId?.toString(),
    stock: product.stock ?? 0,
    tags: product.tags ?? [],
  }));
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  await dbConnect();
  const decodedSlug = decodeSlugParam(slug);
  const normalizedSlug = normalizeSlug(decodedSlug);
  const product = ((await Product.findOne({ slug: normalizedSlug }).lean()) ||
    (await Product.findOne({ slug: decodedSlug }).lean()) ||
    (await Product.findOne({ slug: decodedSlug.toLowerCase() }).lean())) as ProductLean | null;
  if (!product) return null;
  return {
    _id: product._id.toString(),
    title: product.title,
    slug: product.slug,
    description: product.description,
    priceInINR: product.priceInINR,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    images: product.images ?? [],
    categoryId: product.categoryId?.toString(),
    stock: product.stock ?? 0,
    tags: product.tags ?? [],
  };
}

export async function getCategories(): Promise<CategoryDTO[]> {
  await dbConnect();
  const categories = (await Category.find()
    .sort({ name: 1 })
    .lean()) as CategoryLean[];
  return categories.map((category) => ({
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    heroImage: category.heroImage,
  }));
}
