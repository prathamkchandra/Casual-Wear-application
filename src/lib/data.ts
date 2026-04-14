// Mock data for frontend testing (database disabled)

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  priceInINR: number;
  images: string[];
  categoryId: string;
  sizes?: string[];
  colors?: string[];
  createdAt?: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

const mockProducts: IProduct[] = [
  {
    _id: "1",
    title: "Classic T-Shirt",
    slug: "classic-tshirt",
    description: "Comfortable cotton t-shirt perfect for everyday wear",
    priceInINR: 1499,
    images: ["https://via.placeholder.com/300x300?text=T-Shirt"],
    categoryId: "1",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy"],
  },
  {
    _id: "2",
    title: "Denim Jeans",
    slug: "denim-jeans",
    description: "Classic blue denim jeans with perfect fit",
    priceInINR: 2999,
    images: ["https://via.placeholder.com/300x300?text=Jeans"],
    categoryId: "2",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black", "Gray"],
  },
  {
    _id: "3",
    title: "Casual Hoodie",
    slug: "casual-hoodie",
    description: "Warm and cozy hoodie for all seasons",
    priceInINR: 2499,
    images: ["https://via.placeholder.com/300x300?text=Hoodie"],
    categoryId: "1",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "Black", "Navy"],
  },
  {
    _id: "4",
    title: "Summer Shorts",
    slug: "summer-shorts",
    description: "Lightweight shorts for summer comfort",
    priceInINR: 1799,
    images: ["https://via.placeholder.com/300x300?text=Shorts"],
    categoryId: "2",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Khaki", "Navy", "Black"],
  },
  {
    _id: "5",
    title: "Button-Up Shirt",
    slug: "button-up-shirt",
    description: "Versatile button-up shirt for casual and formal occasions",
    priceInINR: 2199,
    images: ["https://via.placeholder.com/300x300?text=Shirt"],
    categoryId: "1",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue", "Checkered"],
  },
  {
    _id: "6",
    title: "Joggers",
    slug: "joggers",
    description: "Comfortable joggers for casual wear",
    priceInINR: 1999,
    images: ["https://via.placeholder.com/300x300?text=Joggers"],
    categoryId: "2",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Gray", "Navy"],
  },
];

const mockCategories: ICategory[] = [
  {
    _id: "1",
    name: "Shirts",
    slug: "shirts",
    description: "Casual shirts collection",
  },
  {
    _id: "2",
    name: "Bottoms",
    slug: "bottoms",
    description: "Pants and shorts",
  },
  {
    _id: "3",
    name: "Outerwear",
    slug: "outerwear",
    description: "Jackets and hoodies",
  },
];

export async function getProducts(limit?: number): Promise<IProduct[]> {
  // Database disabled - returning mock data
  let products = [...mockProducts];
  if (limit) {
    products = products.slice(0, limit);
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  // Database disabled - returning mock data
  return mockProducts.find((p) => p.slug === slug) || null;
}

export async function getCategories(): Promise<ICategory[]> {
  // Database disabled - returning mock data
  return [...mockCategories];
}
