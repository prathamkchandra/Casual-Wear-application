import mongoose, { Schema, model, models } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  priceInINR: number;
  qty: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface IDeliveryAddress {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "mock_paid" | "cod_pending" | "razorpay_paid";

export interface IOrder extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryAddress: IDeliveryAddress;
  subtotal: number;
  shippingFeeINR: number;
  grandTotalINR: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  status: "created" | "fulfilled";
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    priceInINR: { type: Number, required: true },
    qty: { type: Number, required: true },
    size: String,
    color: String,
    image: String,
  },
  { _id: false }
);

const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    deliveryAddress: { type: DeliveryAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingFeeINR: { type: Number, required: true },
    grandTotalINR: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
    paymentStatus: { type: String, enum: ["mock_paid", "cod_pending", "razorpay_paid"], required: true },
    paymentReference: { type: String, required: true },
    gatewayOrderId: { type: String },
    gatewaySignature: { type: String },
    status: { type: String, enum: ["created", "fulfilled"], default: "created" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const OrderModel = (models.Order as mongoose.Model<IOrder>) || model<IOrder>("Order", OrderSchema);

export default OrderModel;
