import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory extends mongoose.Document {
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    heroImage: String,
  },
  { timestamps: true }
);

export default models.Category || model<ICategory>("Category", CategorySchema);
