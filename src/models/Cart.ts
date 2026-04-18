import mongoose, { Schema, model, models } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  size?: string;
  color?: string;
}

export interface ICart extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 1 },
    size: String,
    color: String,
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

const CartModel = (models.Cart as mongoose.Model<ICart>) || model<ICart>("Cart", CartSchema);

export default CartModel;
