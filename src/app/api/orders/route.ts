import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Database disabled - returning empty orders list
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }
  // Database disabled - mock order creation
  const body = await request.json();
  const items = body.items || [];

  const mockOrder = {
    _id: Date.now().toString(),
    userId: session.user.id,
    items,
    subtotal: items.reduce((sum: number, item: any) => sum + item.priceInINR * item.qty, 0),
    status: "pending",
    createdAt: new Date(),
  };

  return NextResponse.json(mockOrder, { status: 201 });
}
    0
  );

  const order = await Order.create({
    userId: session.user.id,
    items: orderItems,
    subtotal,
    grandTotalINR: subtotal,
    status: "created",
  });

  // Clear server cart
  await Cart.findOneAndUpdate({ userId: session.user.id }, { items: [] });

  return NextResponse.json(order, { status: 201 });
}
