import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock products database for frontend testing
const mockProducts: Record<string, any> = {
  "classic-tshirt": {
    _id: "1",
    title: "Classic T-Shirt",
    slug: "classic-tshirt",
    description: "Comfortable cotton t-shirt",
    priceInINR: 1499,
    images: ["https://via.placeholder.com/300x300?text=T-Shirt"],
    categoryId: "1",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy"],
  },
  "denim-jeans": {
    _id: "2",
    title: "Denim Jeans",
    slug: "denim-jeans",
    description: "Classic blue denim jeans",
    priceInINR: 2999,
    images: ["https://via.placeholder.com/300x300?text=Jeans"],
    categoryId: "2",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black", "Gray"],
  },
  "casual-hoodie": {
    _id: "3",
    title: "Casual Hoodie",
    slug: "casual-hoodie",
    description: "Warm and cozy hoodie",
    priceInINR: 2499,
    images: ["https://via.placeholder.com/300x300?text=Hoodie"],
    categoryId: "1",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "Black", "Navy"],
  },
};

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  // Database disabled - returning mock product
  const product = mockProducts[params.slug];
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
  // Database disabled - mock response
  const payload = await request.json();
  const updated = { _id: Date.now().toString(), ...payload, slug: params.slug };
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
  // Database disabled - mock response
  return NextResponse.json({ message: "Deleted" });
}
