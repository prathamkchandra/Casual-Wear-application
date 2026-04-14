import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock products for frontend testing (database disabled)
const mockProducts = [
  {
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
  {
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
  {
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
];

export async function GET(request: Request) {
  // Database disabled - returning mock data
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Number(searchParams.get("limit") || 0);

  let filtered = mockProducts;
  if (category) {
    // Mock category filtering
    filtered = filtered.filter((p) => p.categoryId === category);
  }
  if (limit) {
    filtered = filtered.slice(0, limit);
  }

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Database disabled - mock response
  const payload = await request.json();
  const mockProduct = {
    _id: Date.now().toString(),
    ...payload,
  };
  return NextResponse.json(mockProduct, { status: 201 });
}
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
