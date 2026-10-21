import { randomUUID } from "node:crypto";
import { Order } from "@/lib/orders/types";
import { readJsonFile, resolveDataPath, withFileLock, writeJsonFile } from "@/lib/server/storage/json-store";
import { sameHash } from "@/lib/server/security/secret-box";

/** Orders live in DATA_DIR/orders/orders.json (soft delete, included in backups). */

const FILE = () => resolveDataPath("orders", "orders.json");
const readAll = () => readJsonFile<Order[]>(FILE(), []);

export const orderRepository = {
  async list(): Promise<Order[]> {
    return (await readAll()).filter((order) => !order.deletedAt);
  },

  async findById(id: string): Promise<Order | null> {
    return (await this.list()).find((order) => order.id === id) ?? null;
  },

  async findByTokenHash(tokenHash: string): Promise<Order | null> {
    return (await this.list()).find((order) => order.tokenHash && sameHash(order.tokenHash, tokenHash)) ?? null;
  },

  async findByCheckoutToken(checkoutToken: string): Promise<Order | null> {
    return (await this.list()).find((order) => order.iyzico.checkoutToken === checkoutToken) ?? null;
  },

  async create(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
    return withFileLock(FILE(), async () => {
      const all = await readAll();
      const now = new Date().toISOString();
      const order: Order = { ...data, id: `ord-${randomUUID()}`, createdAt: now, updatedAt: now };
      await writeJsonFile(FILE(), [order, ...all]);
      return order;
    });
  },

  /** Applies `change` under the file lock; return null from `change` to abort without writing. */
  async update(id: string, change: (current: Order) => Partial<Order> | null): Promise<Order | null> {
    return withFileLock(FILE(), async () => {
      const all = await readAll();
      const order = all.find((item) => item.id === id && !item.deletedAt);
      if (!order) return null;
      const patch = change(order);
      if (!patch) return order;
      Object.assign(order, patch, { id: order.id, createdAt: order.createdAt, updatedAt: new Date().toISOString() });
      await writeJsonFile(FILE(), all);
      return order;
    });
  },

  async softDelete(id: string): Promise<boolean> {
    return withFileLock(FILE(), async () => {
      const all = await readAll();
      const order = all.find((item) => item.id === id && !item.deletedAt);
      if (!order) return false;
      order.deletedAt = new Date().toISOString();
      await writeJsonFile(FILE(), all);
      return true;
    });
  },
};
