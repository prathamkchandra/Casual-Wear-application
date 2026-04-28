import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import {
  normalizeDeliveryAddress,
  validateDeliveryAddress,
  type CheckoutDeliveryAddress,
  type CheckoutItemInput,
} from "@/lib/checkout";
import { createStoreOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ message: "Razorpay is not configured" }, { status: 500 });
  }

  const body = await request.json();
  const itemsPayload = (body.items || []) as CheckoutItemInput[];
  const deliveryAddress = body.deliveryAddress as Partial<CheckoutDeliveryAddress>;
  const razorpayOrderId = body.razorpayOrderId as string | undefined;
  const razorpayPaymentId = body.razorpayPaymentId as string | undefined;
  const razorpaySignature = body.razorpaySignature as string | undefined;

  if (!itemsPayload.length) {
    return NextResponse.json({ message: "No items to order" }, { status: 400 });
  }

  const deliveryValidationError = validateDeliveryAddress(deliveryAddress);
  if (deliveryValidationError) {
    return NextResponse.json({ message: deliveryValidationError }, { status: 400 });
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ message: "Missing Razorpay payment details" }, { status: 400 });
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    return NextResponse.json({ message: "Payment signature verification failed" }, { status: 400 });
  }

  try {
    await dbConnect();
    const normalizedDeliveryAddress = normalizeDeliveryAddress(
      deliveryAddress as CheckoutDeliveryAddress
    );
    const { order, emailSent } = await createStoreOrder({
      userId: session.user.id,
      itemsPayload,
      deliveryAddress: normalizedDeliveryAddress,
      paymentMethod: "razorpay",
      paymentStatus: "razorpay_paid",
      paymentReference: razorpayPaymentId,
      gatewayOrderId: razorpayOrderId,
      gatewaySignature: razorpaySignature,
    });

    return NextResponse.json({ order, emailSent }, { status: 201 });
  } catch (error) {
    console.error("Razorpay payment verification failed", error);
    const message = error instanceof Error ? error.message : "Unable to verify payment";
    const status = message === "Product not found" ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
