import nodemailer from "nodemailer";
import type { IDeliveryAddress, PaymentMethod, PaymentStatus } from "@/models/Order";

type OrderEmailItem = {
  title: string;
  qty: number;
  priceInINR: number;
  size?: string;
  color?: string;
};

type SendOrderConfirmationParams = {
  orderId: string;
  customerEmail: string;
  deliveryAddress: IDeliveryAddress;
  items: OrderEmailItem[];
  subtotal: number;
  shippingFeeINR: number;
  grandTotalINR: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
};

const formatCurrency = (amount: number) => `Rs ${amount.toLocaleString("en-IN")}`;

const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendOrderConfirmationEmail = async ({
  orderId,
  customerEmail,
  deliveryAddress,
  items,
  subtotal,
  shippingFeeINR,
  grandTotalINR,
  paymentMethod,
  paymentStatus,
}: SendOrderConfirmationParams) => {
  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!transporter || !from) {
    console.warn("SMTP not configured. Skipping order confirmation email.");
    return false;
  }

  const itemRows = items
    .map((item) => {
      const variant = [item.size ? `Size ${item.size}` : "", item.color || ""]
        .filter(Boolean)
        .join(" | ");
      return `<tr>
        <td style="padding:8px 0;">${item.title}${variant ? `<div style="color:#666;font-size:12px;">${variant}</div>` : ""}</td>
        <td style="padding:8px 0;text-align:center;">${item.qty}</td>
        <td style="padding:8px 0;text-align:right;">${formatCurrency(item.priceInINR * item.qty)}</td>
      </tr>`;
    })
    .join("");

  const paymentLabel =
    paymentMethod === "razorpay"
      ? `Razorpay demo (${paymentStatus === "mock_paid" ? "mock payment approved" : paymentStatus})`
      : "Cash on Delivery";

  await transporter.sendMail({
    from,
    to: customerEmail,
    subject: `Casual Wear order confirmation #${orderId.slice(-6)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
        <h2 style="margin-bottom:8px;">Thanks for shopping with Casual Wear</h2>
        <p style="margin-top:0;">Your order has been placed successfully.</p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${orderId.slice(-6)}</p>
          <p style="margin:0 0 8px;"><strong>Payment method:</strong> ${paymentLabel}</p>
          <p style="margin:0;"><strong>Delivery to:</strong> ${deliveryAddress.firstName} ${deliveryAddress.lastName}, ${deliveryAddress.addressLine1}, ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.zipCode}, ${deliveryAddress.country}. Phone: ${deliveryAddress.phone}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 0;border-bottom:1px solid #e5e7eb;">Item</th>
              <th style="text-align:center;padding:8px 0;border-bottom:1px solid #e5e7eb;">Qty</th>
              <th style="text-align:right;padding:8px 0;border-bottom:1px solid #e5e7eb;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top:16px;border-top:1px solid #e5e7eb;padding-top:16px;">
          <p style="margin:0 0 6px;"><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
          <p style="margin:0 0 6px;"><strong>Shipping:</strong> ${formatCurrency(shippingFeeINR)}</p>
          <p style="margin:0;"><strong>Total:</strong> ${formatCurrency(grandTotalINR)}</p>
        </div>
      </div>
    `,
  });

  return true;
};
