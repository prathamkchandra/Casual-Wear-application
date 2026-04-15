import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Cart, { ICart } from "@/models/Cart";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  await dbConnect();
  const cart = await Cart.findOne({ userId: session.user.id }).lean<ICart>();
  return NextResponse.json({ items: cart?.items || [] });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const incoming = (body.items || []) as any[];

  if (!session?.user?.id) {
    // keep anonymous carts client-side
    return NextResponse.json({ items: incoming });
  }

  await dbConnect();
  const cart = await Cart.findOneAndUpdate(
    { userId: session.user.id },
    { $set: { items: incoming } },
    { new: true, upsert: true }
  ).lean<ICart>();

  return NextResponse.json({ items: cart?.items || [] });
}
