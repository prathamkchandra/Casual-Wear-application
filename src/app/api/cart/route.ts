import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  // Database disabled - returning empty cart for testing
  return NextResponse.json({ items: [] });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const incoming = (body.items || []) as any[];

  if (!session?.user?.id) {
    return NextResponse.json({ items: incoming });
  }

  // Database disabled - just return the items sent
  return NextResponse.json({ items: incoming });
}
