import "dotenv/config";
import bcrypt from "bcryptjs";
import { dbConnect } from "../src/lib/db";
import User from "../src/models/User";
import Category from "../src/models/Category";
import Product from "../src/models/Product";

async function run() {
  await dbConnect();

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
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
