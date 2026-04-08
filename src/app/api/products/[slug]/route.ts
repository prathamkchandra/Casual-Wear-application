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
  await dbConnect();
  const payload = await request.json();
  const category = payload.categorySlug
    ? await Category.findOne({ slug: payload.categorySlug })
    : null;
  const update = {
    ...payload,
    ...(category ? { categoryId: category._id } : {}),
  };
  const product = await Product.findOneAndUpdate({ slug: params.slug }, update, {
    new: true,
  });
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(product);
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
  await Product.deleteOne({ slug: params.slug });
  return NextResponse.json({ message: "Deleted" });
}
