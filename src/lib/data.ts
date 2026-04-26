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

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const asIdString = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === "object" && value && "$oid" in value) {
    const oid = (value as { $oid?: unknown }).$oid;
    return typeof oid === "string" ? oid : undefined;
  }
  return undefined;
};

const toProductDTO = (product: ProductLean): ProductDTO => {
  const id = asIdString(product._id) || "";
  const normalized = normalizeSlug(asString(product.slug, ""));
  return {
    _id: id,
    title: asString(product.title, "Untitled product"),
    slug: normalized || (id ? `product-${id.slice(-6)}` : "product"),
    description: asString(product.description, ""),
    priceInINR: asNumber(product.priceInINR, 0),
    sizes: asStringArray(product.sizes),
    colors: asStringArray(product.colors),
    images: asStringArray(product.images),
    categoryId: asIdString(product.categoryId),
    stock: asNumber(product.stock, 0),
    tags: asStringArray(product.tags),
  };
};

export async function getProducts(limit?: number): Promise<ProductDTO[]> {
  await dbConnect();
  const query = Product.find().sort({ createdAt: -1 }).lean();
  if (limit) query.limit(limit);
  const products = (await query.exec()) as ProductLean[];
  return products.map(toProductDTO).filter((product) => Boolean(product._id));
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  await dbConnect();
  const decodedSlug = decodeSlugParam(slug);
  const normalizedSlug = normalizeSlug(decodedSlug);
  const product = ((await Product.findOne({ slug: normalizedSlug }).lean()) ||
    (await Product.findOne({ slug: decodedSlug }).lean()) ||
    (await Product.findOne({ slug: decodedSlug.toLowerCase() }).lean())) as ProductLean | null;
  if (!product) return null;
  return toProductDTO(product);
}

export async function getCategories(): Promise<CategoryDTO[]> {
  await dbConnect();
  const categories = (await Category.find()
    .sort({ name: 1 })
    .lean()) as CategoryLean[];
  return categories.map((category) => {
    const id = asIdString(category._id) || "";
    const normalized = normalizeSlug(asString(category.slug, ""));
    return {
      _id: id,
      name: asString(category.name, "Category"),
      slug: normalized || (id ? `category-${id.slice(-6)}` : "category"),
      description: asString(category.description, ""),
      heroImage: asString(category.heroImage, ""),
    };
  });
}
