import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock categories for frontend testing (database disabled)
const mockCategories = [
  {
    _id: "1",
    name: "Shirts",
    slug: "shirts",
    description: "Casual shirts collection",
  },
  {
    _id: "2",
    name: "Bottoms",
    slug: "bottoms",
    description: "Pants and shorts",
  },
  {
    _id: "3",
    name: "Outerwear",
    slug: "outerwear",
    description: "Jackets and hoodies",
  },
];

export async function GET() {
  // Database disabled - returning mock data
  return NextResponse.json(mockCategories);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Database disabled - mock response
  const payload = await request.json();
  const mockCategory = {
    _id: Date.now().toString(),
    ...payload,
  };
  return NextResponse.json(mockCategory, { status: 201 });
}
