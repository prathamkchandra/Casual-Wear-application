export type CategoryDTO = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
};

export type ProductDTO = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  priceInINR: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  categoryId?: string;
  stock?: number;
  tags?: string[];
};
