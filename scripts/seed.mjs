import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// lightweight .env loader for .env.local without external deps
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("MONGODB_URI is required");
}

const connect = async () => {
  await mongoose.connect(uri, {
    bufferCommands: false,
    dbName: dbName || undefined,
  });
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    heroImage: String,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    priceInINR: { type: Number, required: true },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Product = mongoose.model("Product", productSchema);

async function run() {
  await connect();

  const adminEmail = "admin@casualwear.dev";
  const demoEmail = "demo@casualwear.dev";
  const adminPwd = await bcrypt.hash("admin123", 10);
  const demoPwd = await bcrypt.hash("demo123", 10);

  await User.deleteMany({ email: { $in: [adminEmail, demoEmail] } });
  await User.create([
    { name: "Admin", email: adminEmail, passwordHash: adminPwd, role: "admin" },
    { name: "Demo User", email: demoEmail, passwordHash: demoPwd, role: "user" },
  ]);

  await Category.deleteMany({});
  const categories = await Category.insertMany([
    {
      name: "Lounge",
      slug: "lounge",
      description: "Soft layers built for indoors and easy errands.",
      heroImage:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Street",
      slug: "street",
      description: "Graphic tees, cargos, and jackets with edge.",
      heroImage:
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Essentials",
      slug: "essentials",
      description: "Core tees, denim, and shirts for everyday rotation.",
      heroImage:
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    },
  ]);

  await Product.deleteMany({});
  await Product.insertMany([
    {
      title: "Airy Linen Shirt",
      slug: "airy-linen-shirt",
      description: "Lightweight linen-cotton blend with relaxed drop shoulder.",
      priceInINR: 2499,
      sizes: ["S", "M", "L", "XL"],
      colors: ["white", "sage", "sand"],
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 50,
      tags: ["linen", "summer"],
    },
    {
      title: "Everyday Cargo Jogger",
      slug: "everyday-cargo-jogger",
      description: "Tapered fit with stretch waistband and matte hardware.",
      priceInINR: 2899,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["black", "olive"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 60,
      tags: ["street", "cargos"],
    },
    {
      title: "CloudSoft Hoodie",
      slug: "cloudsoft-hoodie",
      description: "Brushed terry hoodie with minimalist branding.",
      priceInINR: 3199,
      sizes: ["S", "M", "L", "XL"],
      colors: ["charcoal", "navy"],
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 40,
      tags: ["hoodie", "lounge"],
    },
  ]);

  console.log("Seeded users, categories, and products.");
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
