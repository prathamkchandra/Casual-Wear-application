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

const GUEST_STORAGE_KEY = "casual-wear-cart-guest";
const LEGACY_STORAGE_KEY = "casual-wear-cart";

const readGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    return [];
  }
};

const writeGuestCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
};

const mergeItems = (left: CartItem[], right: CartItem[]) => {
  const map = new Map<string, CartItem>();
  for (const item of [...left, ...right]) {
    const key = `${item.productId}|${item.size || ""}|${item.color || ""}`;
    const existing = map.get(key);
    if (existing) {
      map.set(key, { ...existing, qty: existing.qty + item.qty });
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
};

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(reducer, { items: [] });

  const setItems = useCallback((items: CartItem[]) => {
    dispatch({ type: "SET", payload: items });
  }, []);

  // Guest cart and auth cart must stay isolated.
  useEffect(() => {
    if (status === "loading") return;
    if (typeof window !== "undefined") {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    if (status === "unauthenticated") {
      setItems(readGuestCart());
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      const syncUserCart = async () => {
        try {
          const guestItems = readGuestCart();
          const serverRes = await fetch("/api/cart");
          const serverItems = serverRes.ok ? ((await serverRes.json()).items as CartItem[]) : [];
          const merged = mergeItems(serverItems || [], guestItems);

          if (guestItems.length > 0 || merged.length !== (serverItems || []).length) {
            const upsertRes = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: merged }),
            });
            if (upsertRes.ok) {
              const data = await upsertRes.json();
              setItems(data.items || []);
            } else {
              setItems(serverItems || []);
            }
          } else {
            setItems(serverItems || []);
          }

          localStorage.removeItem(GUEST_STORAGE_KEY);
        } catch (err) {
          console.error("Cart load failed", err);
          setItems([]);
        }
      };
      syncUserCart();
    }
  }, [status, session?.user?.id, setItems]);

  const persistCart = useCallback(
    async (items: CartItem[]) => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });
        } catch (err) {
          console.error("Cart sync failed", err);
        }
        return;
      }
      writeGuestCart(items);
    },
    [status, session?.user?.id]
  );

  const addItem = (item: CartItem) => {
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
    dispatch({ type: "SET", payload: next });
    void persistCart(next);
  };

  const removeItem = (id: string, size?: string, color?: string) => {
    const next = state.items.filter(
      (i) =>
        !(
          i.productId === id &&
          i.size === size &&
          i.color === color
        )
    );
    dispatch({ type: "SET", payload: next });
    void persistCart(next);
  };

  const updateQty = (id: string, qty: number, size?: string, color?: string) => {
    const next = state.items.map((i) =>
      i.productId === id && i.size === size && i.color === color ? { ...i, qty } : i
    );
    dispatch({ type: "SET", payload: next });
    void persistCart(next);
  };

  const clear = () => {
    dispatch({ type: "CLEAR" });
    void persistCart([]);
    if (status !== "authenticated") localStorage.removeItem(GUEST_STORAGE_KEY);
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
