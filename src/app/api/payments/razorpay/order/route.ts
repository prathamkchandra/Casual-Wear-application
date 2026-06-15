import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import {
  normalizeDeliveryAddress,
  validateDeliveryAddress,
  SHIPPING_FEE_INR,
  type CheckoutDeliveryAddress,
  type CheckoutItemInput,
} from "@/lib/checkout";
import { computeCartTotals } from "@/lib/checkout";
import { buildOrderItems } from "@/lib/orders";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const itemsPayload = (body.items || []) as CheckoutItemInput[];
  const deliveryAddress = body.deliveryAddress as Partial<CheckoutDeliveryAddress>;

  if (!itemsPayload.length) {
    return NextResponse.json({ message: "No items to order" }, { status: 400 });
  }

  const deliveryValidationError = validateDeliveryAddress(deliveryAddress);
  if (deliveryValidationError) {
    return NextResponse.json({ message: deliveryValidationError }, { status: 400 });
  }

  try {
    await dbConnect();
    const orderItems = await buildOrderItems(itemsPayload);
    const { subtotal, discountINR, discountedSubtotal } = computeCartTotals(orderItems as any);
    const grandTotalINR = discountedSubtotal + SHIPPING_FEE_INR;
    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: grandTotalINR * 100,
      currency: "INR",
      receipt: `cw_${Date.now()}`,
      notes: {
        userId: session.user.id,
        email: normalizeDeliveryAddress(deliveryAddress as CheckoutDeliveryAddress).email,
      },
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      amountInINR: grandTotalINR,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error("Razorpay order creation failed", error);
    const message = error instanceof Error ? error.message : "Unable to start Razorpay checkout";
    const status = message === "Product not found" ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
