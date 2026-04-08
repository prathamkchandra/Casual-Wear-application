import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const filter =
    (session.user as any).role === "admin"
      ? {}
      : { userId: session.user.id };
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }
  await dbConnect();
  const body = await request.json();
  const items = body.items || [];

  // Ensure prices are fresh from DB
  const productIds = items.map((i: any) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const orderItems = items.map((i: any) => {
    const prod = products.find((p) => p._id.toString() === i.productId);
    return {
      productId: i.productId,
      title: prod?.title || i.name,
      priceInINR: prod?.priceInINR ?? i.priceInINR ?? 0,
      qty: i.qty,
      size: i.size,
      color: i.color,
      image: i.image,
    };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.priceInINR * item.qty,
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
