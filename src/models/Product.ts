import mongoose, { Schema, model, models } from "mongoose";

export interface IProduct extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  priceInINR: number;
  sizes: string[];
  colors: string[];
  images: string[];
  categoryId: mongoose.Types.ObjectId;
  stock: number;
  tags?: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    priceInINR: { type: Number, required: true },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const ProductModel =
  (models.Product as mongoose.Model<IProduct>) || model<IProduct>("Product", ProductSchema);

export default ProductModel;
