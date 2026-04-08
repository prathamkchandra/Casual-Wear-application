import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";

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
  const category = await Category.findOneAndUpdate({ slug: params.slug }, payload, {
    new: true,
  });
  if (!category) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(category);
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
  await Category.deleteOne({ slug: params.slug });
  return NextResponse.json({ message: "Deleted" });
}
