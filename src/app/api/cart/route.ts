import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

const mapCartItemsWithProduct = async (userId: string) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return [];
  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  return cart.items.map((item) => {
    const prod = products.find((p) => p._id.equals(item.productId));
    return {
      productId: item.productId.toString(),
      qty: item.qty,
      size: item.size,
      color: item.color,
      name: prod?.title ?? "Unknown",
      priceInINR: prod?.priceInINR ?? 0,
      image: prod?.images?.[0],
    };
  });
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  await dbConnect();
  const items = await mapCartItemsWithProduct(session.user.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const incoming = (body.items || []) as any[];

  if (!session?.user?.id) {
    return NextResponse.json({ items: incoming });
  }

  await dbConnect();
  const userId = session.user.id;
  const existing = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }));

  const merged = [...existing.items];
  for (const item of incoming) {
    const idx = merged.findIndex(
      (i) =>
        i.productId.toString() === item.productId &&
        i.size === item.size &&
        i.color === item.color
    );
    if (idx > -1) {
      merged[idx].qty += item.qty;
    } else {
      merged.push({
        productId: item.productId,
        qty: item.qty,
        size: item.size,
        color: item.color,
      });
    }
  }

  existing.items = merged;
  await existing.save();

  const items = await mapCartItemsWithProduct(userId);
  return NextResponse.json({ items });
}
