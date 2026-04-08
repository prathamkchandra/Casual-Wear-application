import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Number(searchParams.get("limit") || 0);

  const filter: Record<string, any> = {};
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.categoryId = cat._id;
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
  await dbConnect();
  const payload = await request.json();
  const category = await Category.findOne({ slug: payload.categorySlug });
  if (!category) {
    return NextResponse.json({ message: "Invalid category" }, { status: 400 });
  }
  const product = await Product.create({
    title: payload.title,
    slug: payload.slug,
    description: payload.description,
    priceInINR: payload.priceInINR,
    sizes: payload.sizes || [],
    colors: payload.colors || [],
    images: payload.images || [],
    categoryId: category._id,
    stock: payload.stock ?? 0,
    tags: payload.tags || [],
  });

  return NextResponse.json(product, { status: 201 });
}
