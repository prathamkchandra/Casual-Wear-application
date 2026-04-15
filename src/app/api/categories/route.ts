import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  if (!payload.name || !payload.slug) {
    return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });
  }

  await dbConnect();
  const category = await Category.create({
    name: payload.name,
    slug: payload.slug.toLowerCase(),
    description: payload.description,
    heroImage: payload.heroImage,
  });

  return NextResponse.json(category, { status: 201 });
}
