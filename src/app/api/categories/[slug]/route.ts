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

  const payload = await request.json();
  await dbConnect();

  const updated = await Category.findOneAndUpdate(
    { slug: params.slug },
    {
      $set: {
        name: payload.name,
        slug: payload.slug?.toLowerCase() || params.slug,
        description: payload.description,
        heroImage: payload.heroImage,
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
  const res = await Category.findOneAndDelete({ slug: params.slug });
  if (!res) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
