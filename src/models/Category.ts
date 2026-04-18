import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
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

const CategoryModel =
  (models.Category as mongoose.Model<ICategory>) || model<ICategory>("Category", CategorySchema);

export default CategoryModel;
