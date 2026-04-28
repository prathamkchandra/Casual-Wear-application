import mongoose from "mongoose";
import Product from "@/models/Product";
import Order, { type PaymentMethod, type PaymentStatus } from "@/models/Order";
import Cart from "@/models/Cart";
import { DEFAULT_PRODUCT_IMAGE, getSafeProductImage } from "@/lib/image";
import type { CheckoutDeliveryAddress, CheckoutItemInput } from "@/lib/checkout";
import { SHIPPING_FEE_INR } from "@/lib/checkout";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export const buildOrderItems = async (itemsPayload: CheckoutItemInput[]) => {
  const productIds = itemsPayload.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .select("_id title priceInINR images")
    .lean<
      Array<{
        _id: mongoose.Types.ObjectId;
        title: string;
        priceInINR: number;
        images?: string[];
      }>
    >();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  return itemsPayload.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    return {
      productId: product._id,
      title: product.title,
      priceInINR: product.priceInINR,
      qty: item.qty,
      size: item.size,
      color: item.color,
      image: getSafeProductImage(product.images?.[0], DEFAULT_PRODUCT_IMAGE),
    };
  });
};

type CreateStoreOrderParams = {
  userId: string;
  itemsPayload: CheckoutItemInput[];
  deliveryAddress: CheckoutDeliveryAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  clearCart?: boolean;
};

export const createStoreOrder = async ({
  userId,
  itemsPayload,
  deliveryAddress,
  paymentMethod,
  paymentStatus,
  paymentReference,
  gatewayOrderId,
  gatewaySignature,
  clearCart = true,
}: CreateStoreOrderParams) => {
  const orderItems = await buildOrderItems(itemsPayload);
  const subtotal = orderItems.reduce((sum, item) => sum + item.priceInINR * item.qty, 0);
  const shippingFeeINR = SHIPPING_FEE_INR;
  const grandTotalINR = subtotal + shippingFeeINR;

  const order = await Order.create({
    userId,
    items: orderItems,
    deliveryAddress,
    subtotal,
    shippingFeeINR,
    grandTotalINR,
    paymentMethod,
    paymentStatus,
    paymentReference,
    gatewayOrderId,
    gatewaySignature,
    status: "created",
  });

  if (clearCart) {
    await Cart.findOneAndUpdate({ userId }, { items: [] });
  }

  const emailSent = await sendOrderConfirmationEmail({
    orderId: order._id.toString(),
    customerEmail: deliveryAddress.email,
    deliveryAddress,
    items: orderItems,
    subtotal,
    shippingFeeINR,
    grandTotalINR,
    paymentMethod,
    paymentStatus,
  }).catch((error) => {
    console.error("Order email failed", error);
    return false;
  });

  return { order, emailSent };
};
