import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

type OrderRow = {
  _id: { toString: () => string };
  createdAt: Date | string;
  status: string;
  grandTotalINR: number;
  items: Array<{
    title: string;
    qty: number;
    priceInINR: number;
    size?: string;
    color?: string;
  }>;
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  if ((session.user as any).role === "admin") {
    redirect("/admin");
  }

  await dbConnect();
  const orders = (await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()) as OrderRow[];

  return (
    <main className="section-shell py-10 sm:py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">My orders</p>
        <h1 className="text-3xl sm:text-4xl font-bold">Order history</h1>
        <p className="text-base sm:text-lg font-medium text-ink/70">Track your purchases and see each item from previous orders.</p>
      </div>

      <div className="space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <div key={order._id.toString()} className="rounded-2xl bg-white p-4 sm:p-6 shadow-soft space-y-4">
              <div className="grid gap-3 border-b border-ink/10 pb-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-ink/60">Order ID</p>
                  <p className="text-base font-bold">#{order._id.toString().slice(-6)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink/60">Placed on</p>
                  <p className="text-base font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink/60">Status</p>
                  <p className="text-sm font-bold uppercase tracking-[0.15em]">{order.status}</p>
                </div>
                <div className="sm:text-right lg:text-left xl:text-right">
                  <p className="text-sm font-medium text-ink/60">Total</p>
                  <p className="text-lg font-bold">Rs {order.grandTotalINR.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={`${order._id.toString()}-${idx}`}
                    className="rounded-xl border border-ink/10 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-bold">{item.title}</p>
                      <p className="text-base text-ink/60">
                        Qty {item.qty}
                        {item.size ? ` | Size ${item.size}` : ""}
                        {item.color ? ` | ${item.color}` : ""}
                      </p>
                    </div>
                    <p className="text-base font-bold">
                      Rs {(item.priceInINR * item.qty).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-soft">
            <p className="text-base sm:text-lg text-ink/70">No orders yet. Start by adding products to your cart.</p>
          </div>
        )}
      </div>
    </main>
  );
}

