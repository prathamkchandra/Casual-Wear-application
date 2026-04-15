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
  const isAdmin = (session.user as any).role === "admin";
  const filter = isAdmin ? {} : { userId: session.user.id };

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const itemsPayload = (body.items || []) as Array<{
    productId: string;
    qty: number;
    size?: string;
    color?: string;
  }>;

  if (!itemsPayload.length) {
    return NextResponse.json({ message: "No items to order" }, { status: 400 });
  }

  await dbConnect();

  const productIds = itemsPayload.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  for (const item of itemsPayload) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 400 });
    }
    orderItems.push({
      productId: product._id,
      title: product.title,
      priceInINR: product.priceInINR,
      qty: item.qty,
      size: item.size,
      color: item.color,
      image: product.images?.[0],
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.priceInINR * i.qty, 0);

  const order = await Order.create({
    userId: session.user.id,
    items: orderItems,
    subtotal,
    grandTotalINR: subtotal,
    status: "created",
  });

  await Cart.findOneAndUpdate({ userId: session.user.id }, { items: [] });

  return NextResponse.json(order, { status: 201 });
}
