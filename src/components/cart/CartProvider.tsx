"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
  productId: string;
  name: string;
  priceInINR: number;
  image?: string;
  size?: string;
  color?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

type Action =
  | { type: "SET"; payload: CartItem[] }
  | { type: "ADD"; payload: CartItem }
  | { type: "REMOVE"; payload: { productId: string; size?: string; color?: string } }
  | { type: "UPDATE_QTY"; payload: { productId: string; qty: number; size?: string; color?: string } }
  | { type: "CLEAR" };

const reducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case "SET":
      return { items: action.payload };
    case "ADD": {
      const existing = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i === existing ? { ...i, qty: i.qty + action.payload.qty } : i
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE":
      return {
        items: state.items.filter(
          (i) =>
            !(
              i.productId === action.payload.productId &&
              i.size === action.payload.size &&
              i.color === action.payload.color
            )
        ),
      };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color
            ? { ...i, qty: action.payload.qty }
            : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  updateQty: (id: string, qty: number, size?: string, color?: string) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "casual-wear-cart";

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(reducer, { items: [] });

  const persist = useCallback(
    (items: CartItem[]) => {
      dispatch({ type: "SET", payload: items });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    },
    [dispatch]
  );

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        dispatch({ type: "SET", payload: parsed });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Merge with server on login
  useEffect(() => {
    if (status !== "authenticated") return;
    const sync = async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: state.items }),
        });
        if (res.ok) {
          const data = await res.json();
          persist(data.items);
        }
      } catch (err) {
        console.error("Cart sync failed", err);
      }
    };
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD", payload: item });
    const next = (() => {
      const existing = state.items.find(
        (i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color
      );
      if (existing) {
        return state.items.map((i) =>
          i === existing ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...state.items, item];
    })();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const removeItem = (id: string, size?: string, color?: string) => {
    dispatch({ type: "REMOVE", payload: { productId: id, size, color } });
    const next = state.items.filter(
      (i) =>
        !(
          i.productId === id &&
          i.size === size &&
          i.color === color
        )
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const updateQty = (id: string, qty: number, size?: string, color?: string) => {
    dispatch({ type: "UPDATE_QTY", payload: { productId: id, qty, size, color } });
    const next = state.items.map((i) =>
      i.productId === id && i.size === size && i.color === color ? { ...i, qty } : i
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const clear = () => {
    dispatch({ type: "CLEAR" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const total = state.items.reduce(
    (sum, item) => sum + item.priceInINR * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, updateQty, clear, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
