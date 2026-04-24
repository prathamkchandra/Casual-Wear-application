# Casual Wear Shop

A modern e-commerce platform for casual wear built with Next.js, TypeScript, and Tailwind CSS. Features user authentication, product catalog, shopping cart, and order management.

## Overview

This project is a full-stack e-commerce application designed to showcase casual wear products with an intuitive shopping experience. It includes user authentication, product browsing, shopping cart functionality, and order management.

## Tech Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) with React 18
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v4 with JWT
- **Security**: bcryptjs for password hashing
- **Data Validation**: Zod
- **Data Fetching**: SWR (stale-while-revalidate)

## Features

- 🛍️ **Product Catalog** - Browse casual wear products with categories and filtering
- 🔐 **User Authentication** - Secure login and registration with NextAuth.js
- 🛒 **Shopping Cart** - Add items to cart with persistent storage
- 📦 **Order Management** - Track orders and order history
- 👨‍💼 **Admin Dashboard** - Manage products and categories
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🎨 **Modern UI** - Clean and modern user interface with smooth interactions
- 🤖 **AI Stylist** - Prompt-based outfit recommendations with safe fallback mode

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── cart/              # Shopping cart page
│   ├── orders/            # Orders page
│   ├── product/           # Product detail pages
│   ├── shop/              # Shop/browse page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── cart/              # Cart-related components
│   ├── layout/            # Layout components (Navbar, Footer)
│   ├── product/           # Product-related components
│   └── sections/          # Page sections (Hero, etc.)
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication configuration
│   ├── data.ts            # Data fetching utilities
│   └── db.ts              # Database connection
├── models/                # Mongoose schemas
│   ├── User.ts
│   ├── Product.ts
│   ├── Category.ts
│   ├── Cart.ts
│   └── Order.ts
└── types/                 # TypeScript type definitions
    ├── shop.ts            # Shop-related types
    └── next-auth.d.ts     # NextAuth type extensions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_optional
OPENAI_MODEL=gpt-4o-mini
```

`OPENAI_API_KEY` is optional. If it is missing or unavailable in production, the app automatically uses local fallback recommendations.

4. Seed the database (optional):
```bash
npm run seed
```

### Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## API Routes

The following API endpoints are available:

- `POST /api/auth/[...nextauth]` - Authentication endpoints
- `POST /api/register` - User registration
- `GET /api/products` - Get all products
- `GET /api/products/[slug]` - Get product by slug
- `GET /api/categories` - Get all categories
- `GET /api/categories/[slug]` - Get category by slug
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/users` - Get users (admin)
- `POST /api/ai/stylist` - AI outfit recommendations (OpenAI + fallback)

## Authentication

This project uses NextAuth.js for authentication with the following providers:
- Email/Password with bcrypt hashing
- JWT sessions

Users can register and log in to access their cart and order history.

## Database Models

### User
- Email, password, name, role (user/admin)

### Product
- Name, description, price, image, category, slug

### Category
- Name, description, slug

### Cart
- User ID, items array with quantity

### Order
- User ID, items array, total price, status, timestamps

## Deployment

This application can be deployed on:
- [Vercel](https://vercel.com) (recommended)
- Any Node.js hosting platform
- Docker containers

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is private and proprietary.
