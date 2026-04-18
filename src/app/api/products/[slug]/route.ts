import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  await dbConnect();

  let categoryId = payload.categoryId as string | undefined;
  if (payload.categorySlug) {
    const category = await Category.findOne({ slug: payload.categorySlug }).lean();
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 400 });
    }
    categoryId = category._id.toString();
  }

  const updateFields: Record<string, unknown> = {};
  if (payload.title !== undefined) updateFields.title = payload.title;
  if (payload.description !== undefined) updateFields.description = payload.description;
  if (payload.priceInINR !== undefined) updateFields.priceInINR = Number(payload.priceInINR);
  if (payload.sizes !== undefined) updateFields.sizes = payload.sizes;
  if (payload.colors !== undefined) updateFields.colors = payload.colors;
  if (payload.images !== undefined) updateFields.images = payload.images;
  if (payload.stock !== undefined) updateFields.stock = Number(payload.stock);
  if (payload.tags !== undefined) updateFields.tags = payload.tags;
  if (payload.slug) updateFields.slug = payload.slug.toLowerCase();
  if (categoryId) updateFields.categoryId = categoryId;

  const updated = await Product.findOneAndUpdate(
    { slug: params.slug },
    {
      $set: updateFields,
    },
    { new: true }
  ).lean();

  if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const res = await Product.findOneAndDelete({ slug: params.slug });
  if (!res) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
