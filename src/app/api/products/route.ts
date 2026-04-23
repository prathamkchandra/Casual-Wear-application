import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { normalizeSlug } from "@/lib/slug";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const limit = Number(searchParams.get("limit") || 0);

  await dbConnect();

  const filter: Record<string, any> = {};
  if (categoryParam) {
    const category =
      (await Category.findOne({ slug: categoryParam }).lean()) ||
      (mongoose.isValidObjectId(categoryParam)
        ? await Category.findById(categoryParam).lean()
        : null);
    if (category) {
      filter.categoryId = category._id;
    }
  }

  const query = Product.find(filter).sort({ createdAt: -1 });
  if (limit) query.limit(limit);
  const products = await query.lean();

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  if (!payload.title || !payload.slug || !payload.priceInINR) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }
  const normalizedSlug = normalizeSlug(String(payload.slug));
  if (!normalizedSlug) {
    return NextResponse.json({ message: "Invalid product slug" }, { status: 400 });
  }

  await dbConnect();
  const category =
    (await Category.findOne({ slug: payload.categorySlug }).lean()) ||
    (payload.categoryId && mongoose.isValidObjectId(payload.categoryId)
      ? await Category.findById(payload.categoryId).lean()
      : null);

  if (!category) {
    return NextResponse.json({ message: "Category not found" }, { status: 400 });
  }

  const product = await Product.create({
    title: payload.title,
    slug: normalizedSlug,
    description: payload.description,
    priceInINR: Number(payload.priceInINR),
    sizes: payload.sizes || [],
    colors: payload.colors || [],
    images: payload.images || [],
    categoryId: category._id,
    stock: payload.stock ?? 0,
    tags: payload.tags || [],
  });

  return NextResponse.json(product, { status: 201 });
}
