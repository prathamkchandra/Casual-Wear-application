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

export interface IOrder extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  grandTotalINR: number;
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

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    grandTotalINR: { type: Number, required: true },
    status: { type: String, enum: ["created", "fulfilled"], default: "created" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const OrderModel = (models.Order as mongoose.Model<IOrder>) || model<IOrder>("Order", OrderSchema);

export default OrderModel;
