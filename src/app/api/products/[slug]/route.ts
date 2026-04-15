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

  let categoryId = payload.categoryId;
  if (payload.categorySlug) {
    const category =
      (await Category.findOne({ slug: payload.categorySlug }).lean()) ||
      (payload.categoryId && (await Category.findById(payload.categoryId).lean()));
    categoryId = category?._id ?? categoryId;
  }

  const updated = await Product.findOneAndUpdate(
    { slug: params.slug },
    {
      $set: {
        title: payload.title,
        description: payload.description,
        priceInINR: payload.priceInINR,
        sizes: payload.sizes,
        colors: payload.colors,
        images: payload.images,
        categoryId,
        stock: payload.stock,
        tags: payload.tags,
        slug: payload.slug?.toLowerCase() || params.slug,
      },
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
