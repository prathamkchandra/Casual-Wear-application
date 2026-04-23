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
      title: "Relaxed Oxford Shirt",
      slug: "relaxed-oxford-shirt",
      description: "Soft washed oxford weave with a roomy silhouette.",
      priceInINR: 2699,
      sizes: ["S", "M", "L", "XL"],
      colors: ["sky", "white", "stone"],
      images: [
        "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 45,
      tags: ["oxford", "everyday"],
    },
    {
      title: "Classic Denim Shirt",
      slug: "classic-denim-shirt",
      description: "Midweight denim shirt with dual chest pockets.",
      priceInINR: 2999,
      sizes: ["S", "M", "L", "XL"],
      colors: ["indigo", "washed-blue"],
      images: [
        "https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 38,
      tags: ["denim", "shirt"],
    },
    {
      title: "Weekend Polo Tee",
      slug: "weekend-polo-tee",
      description: "Breathable knit polo with subtle contrast collar.",
      priceInINR: 1999,
      sizes: ["S", "M", "L", "XL"],
      colors: ["navy", "off-white", "rust"],
      images: [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 55,
      tags: ["polo", "smart-casual"],
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
      title: "Utility Straight Cargo",
      slug: "utility-straight-cargo",
      description: "Straight-leg cargos with oversized flap pockets.",
      priceInINR: 3099,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["khaki", "graphite"],
      images: [
        "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 44,
      tags: ["cargo", "utility"],
    },
    {
      title: "Oversized Graphic Tee",
      slug: "oversized-graphic-tee",
      description: "Heavy cotton tee with a cracked vintage print.",
      priceInINR: 1799,
      sizes: ["S", "M", "L", "XL"],
      colors: ["black", "ecru"],
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 72,
      tags: ["graphic", "streetwear"],
    },
    {
      title: "Boxy Zip Jacket",
      slug: "boxy-zip-jacket",
      description: "Light shell jacket with two-way zipper and stand collar.",
      priceInINR: 4299,
      sizes: ["S", "M", "L", "XL"],
      colors: ["black", "olive", "steel"],
      images: [
        "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 30,
      tags: ["jacket", "street"],
    },
    {
      title: "City Windbreaker",
      slug: "city-windbreaker",
      description: "Packable windbreaker with breathable mesh lining.",
      priceInINR: 3899,
      sizes: ["S", "M", "L", "XL"],
      colors: ["neon-lime", "black", "navy"],
      images: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 28,
      tags: ["windbreaker", "outerwear"],
    },
    {
      title: "Ribbed Tank Duo Pack",
      slug: "ribbed-tank-duo-pack",
      description: "Two-pack stretch rib tanks for layering.",
      priceInINR: 1299,
      sizes: ["S", "M", "L", "XL"],
      colors: ["white-black"],
      images: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 64,
      tags: ["tank", "basics"],
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
    {
      title: "Sunday Fleece Sweatshirt",
      slug: "sunday-fleece-sweatshirt",
      description: "Ultra-soft fleece crewneck with dropped shoulder seams.",
      priceInINR: 2799,
      sizes: ["S", "M", "L", "XL"],
      colors: ["oatmeal", "charcoal", "forest"],
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 48,
      tags: ["sweatshirt", "fleece"],
    },
    {
      title: "Plush Knit Lounge Pants",
      slug: "plush-knit-lounge-pants",
      description: "Relaxed knit lounge pants with tapered cuff.",
      priceInINR: 2299,
      sizes: ["S", "M", "L", "XL"],
      colors: ["grey-melange", "sand"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 58,
      tags: ["lounge", "pants"],
    },
    {
      title: "Cozy Waffle Henley",
      slug: "cozy-waffle-henley",
      description: "Textured waffle knit henley built for layering.",
      priceInINR: 2199,
      sizes: ["S", "M", "L", "XL"],
      colors: ["cream", "ink", "brown"],
      images: [
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 52,
      tags: ["henley", "waffle-knit"],
    },
    {
      title: "Minimal Lounge Shorts",
      slug: "minimal-lounge-shorts",
      description: "Mid-thigh lounge shorts with invisible zip pockets.",
      priceInINR: 1699,
      sizes: ["S", "M", "L", "XL"],
      colors: ["black", "stone", "navy"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 66,
      tags: ["shorts", "lounge"],
    },
    {
      title: "Zip-Up Knit Hoodie",
      slug: "zip-up-knit-hoodie",
      description: "Light knit zip-up hoodie for transitional weather.",
      priceInINR: 3399,
      sizes: ["S", "M", "L", "XL"],
      colors: ["taupe", "black"],
      images: [
        "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 36,
      tags: ["hoodie", "zip-up"],
    },
    {
      title: "Relaxed Cotton Chinos",
      slug: "relaxed-cotton-chinos",
      description: "Roomy chinos with clean front and soft stretch.",
      priceInINR: 2599,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["beige", "navy", "olive"],
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 49,
      tags: ["chinos", "essentials"],
    },
    {
      title: "Core Pocket Tee",
      slug: "core-pocket-tee",
      description: "Classic pocket tee in combed cotton jersey.",
      priceInINR: 1499,
      sizes: ["S", "M", "L", "XL"],
      colors: ["white", "black", "dusty-blue"],
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 80,
      tags: ["tee", "basics"],
    },
    {
      title: "Washed Black Jeans",
      slug: "washed-black-jeans",
      description: "Straight fit jeans with subtle fade and soft handfeel.",
      priceInINR: 3199,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["washed-black"],
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 42,
      tags: ["jeans", "denim"],
    },
    {
      title: "Commuter Check Shirt",
      slug: "commuter-check-shirt",
      description: "Yarn-dyed check shirt with lightweight brushed finish.",
      priceInINR: 2399,
      sizes: ["S", "M", "L", "XL"],
      colors: ["red-check", "green-check"],
      images: [
        "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 46,
      tags: ["checks", "shirt"],
    },
    {
      title: "Cuban Collar Resort Shirt",
      slug: "cuban-collar-resort-shirt",
      description: "Breezy camp-collar shirt with a relaxed holiday drape.",
      priceInINR: 2499,
      sizes: ["S", "M", "L", "XL"],
      colors: ["coral", "mint", "cream"],
      images: [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 39,
      tags: ["camp-collar", "resort", "shirt"],
    },
    {
      title: "Striped Seersucker Shirt",
      slug: "striped-seersucker-shirt",
      description: "Textured seersucker shirt with airy vertical stripe pattern.",
      priceInINR: 2599,
      sizes: ["S", "M", "L", "XL"],
      colors: ["sky-stripe", "sage-stripe"],
      images: [
        "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 43,
      tags: ["seersucker", "striped", "shirt"],
    },
    {
      title: "Boxy Cropped Shirt",
      slug: "boxy-cropped-shirt",
      description: "Modern cropped shirt with a square hem and oversized chest pocket.",
      priceInINR: 2299,
      sizes: ["S", "M", "L", "XL"],
      colors: ["smoke", "off-white", "olive"],
      images: [
        "https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 41,
      tags: ["boxy", "cropped", "shirt"],
    },
    {
      title: "Vintage Flannel Overshirt",
      slug: "vintage-flannel-overshirt",
      description: "Soft brushed flannel overshirt with retro checks and roomy fit.",
      priceInINR: 3099,
      sizes: ["S", "M", "L", "XL"],
      colors: ["burgundy-check", "navy-check"],
      images: [
        "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 35,
      tags: ["flannel", "overshirt", "vintage"],
    },
    {
      title: "Mandarin Poplin Shirt",
      slug: "mandarin-poplin-shirt",
      description: "Clean band-collar poplin shirt for minimalist smart-casual looks.",
      priceInINR: 2399,
      sizes: ["S", "M", "L", "XL"],
      colors: ["white", "powder-blue", "ash"],
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 47,
      tags: ["band-collar", "poplin", "shirt"],
    },
    {
      title: "Satin Bowling Shirt",
      slug: "satin-bowling-shirt",
      description: "Shiny bowling-style shirt with contrast piping and draped sleeves.",
      priceInINR: 2899,
      sizes: ["S", "M", "L", "XL"],
      colors: ["wine", "ink-black", "teal"],
      images: [
        "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 31,
      tags: ["bowling", "satin", "street"],
    },
    {
      title: "Tech Parachute Pants",
      slug: "tech-parachute-pants",
      description: "Light nylon parachute pants with drawcord hem and utility seams.",
      priceInINR: 3599,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["slate", "black", "moss"],
      images: [
        "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 37,
      tags: ["parachute", "techwear", "pants"],
    },
    {
      title: "Pleated Wide-Leg Trousers",
      slug: "pleated-wide-leg-trousers",
      description: "Flowy wide-leg trousers with front pleats and structured waist.",
      priceInINR: 3399,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["charcoal", "mocha", "stone"],
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 34,
      tags: ["wide-leg", "pleated", "trousers"],
    },
    {
      title: "Carpenter Utility Pants",
      slug: "carpenter-utility-pants",
      description: "Workwear-inspired carpenter pants with hammer loop styling.",
      priceInINR: 3299,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["washed-olive", "sandstone"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 40,
      tags: ["carpenter", "workwear", "pants"],
    },
    {
      title: "Pinstripe Relaxed Trousers",
      slug: "pinstripe-relaxed-trousers",
      description: "Relaxed drape trousers with subtle pinstripe and soft stretch.",
      priceInINR: 2999,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["navy-stripe", "charcoal-stripe"],
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 33,
      tags: ["pinstripe", "relaxed", "trousers"],
    },
    {
      title: "Tapered Smart Joggers",
      slug: "tapered-smart-joggers",
      description: "Smart athleisure joggers with clean seams and ankle taper.",
      priceInINR: 2499,
      sizes: ["S", "M", "L", "XL"],
      colors: ["graphite", "navy", "taupe"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 57,
      tags: ["athleisure", "joggers", "pants"],
    },
    {
      title: "Acid Wash Denim Shorts",
      slug: "acid-wash-denim-shorts",
      description: "Street-ready denim shorts with vintage acid-wash finish.",
      priceInINR: 2199,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["acid-blue", "charcoal-fade"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 52,
      tags: ["denim-shorts", "acid-wash", "streetwear"],
    },
    {
      title: "Tailored Drawstring Shorts",
      slug: "tailored-drawstring-shorts",
      description: "Tailored silhouette shorts with comfort drawstring waistband.",
      priceInINR: 1899,
      sizes: ["S", "M", "L", "XL"],
      colors: ["stone", "navy", "cocoa"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 61,
      tags: ["tailored", "drawstring", "shorts"],
    },
    {
      title: "Colorblock Track Shorts",
      slug: "colorblock-track-shorts",
      description: "Retro-inspired track shorts with bold colorblocked side panels.",
      priceInINR: 1699,
      sizes: ["S", "M", "L", "XL"],
      colors: ["navy-red", "black-lime", "teal-cream"],
      images: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 68,
      tags: ["track", "colorblock", "shorts"],
    },
    {
      title: "Linen Co-ord Shorts",
      slug: "linen-coord-shorts",
      description: "Easy linen-blend shorts designed for summer co-ord styling.",
      priceInINR: 1799,
      sizes: ["S", "M", "L", "XL"],
      colors: ["sand", "sage", "powder-blue"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[2]._id,
      stock: 59,
      tags: ["linen", "coord", "shorts"],
    },
    {
      title: "Waffle Lounge Shorts",
      slug: "waffle-lounge-shorts",
      description: "Soft waffle-knit lounge shorts with relaxed weekend feel.",
      priceInINR: 1599,
      sizes: ["S", "M", "L", "XL"],
      colors: ["oatmeal", "dusty-rose", "ink"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[0]._id,
      stock: 63,
      tags: ["waffle-knit", "lounge", "shorts"],
    },
    {
      title: "Cargo Denim Shorts",
      slug: "cargo-denim-shorts",
      description: "Hybrid denim cargo shorts with roomy flap utility pockets.",
      priceInINR: 2399,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["mid-blue", "black-denim"],
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 45,
      tags: ["cargo", "denim", "shorts"],
    },
    {
      title: "Ombre Vacation Shirt",
      slug: "ombre-vacation-shirt",
      description: "Fluid shirt with gradient ombre dye and laid-back resort fit.",
      priceInINR: 2699,
      sizes: ["S", "M", "L", "XL"],
      colors: ["sunset-ombre", "ocean-ombre"],
      images: [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1400&q=80",
      ],
      categoryId: categories[1]._id,
      stock: 32,
      tags: ["ombre", "resort", "shirt"],
    },
  ]);

  console.log("Seeded users, categories, and products.");
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


