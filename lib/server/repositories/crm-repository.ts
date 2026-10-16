import { randomUUID } from "node:crypto";
import { CrmCollection, CrmCollections } from "@/lib/crm/types";
import { readJsonFile, resolveDataPath, withFileLock, writeJsonFile } from "@/lib/server/storage/json-store";

/**
 * File-backed repositories for the CRM collections (one JSON file each under DATA_DIR/crm/).
 * Deletes are soft: records keep a deletedAt timestamp and are hidden from list().
 */

type Entity = { id: string; createdAt: string; updatedAt: string; deletedAt?: string };

const FILES: Record<CrmCollection, string> = {
  clients: "clients.json",
  proposals: "proposals.json",
  payments: "payments.json",
  events: "events.json",
};

const ID_PREFIX: Record<CrmCollection, string> = {
  clients: "cli",
  proposals: "tkl",
  payments: "pay",
  events: "evt",
};

function createRepository<T extends Entity>(collection: CrmCollection) {
  const file = () => resolveDataPath("crm", FILES[collection]);
  const readAll = () => readJsonFile<T[]>(file(), []);

  return {
    async list(): Promise<T[]> {
      return (await readAll()).filter((item) => !item.deletedAt);
    },

    async findById(id: string): Promise<T | null> {
      return (await this.list()).find((item) => item.id === id) ?? null;
    },

    async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
      return withFileLock(file(), async () => {
        const all = await readAll();
        const now = new Date().toISOString();
        const item = { ...data, id: `${ID_PREFIX[collection]}-${randomUUID()}`, createdAt: now, updatedAt: now } as T;
        await writeJsonFile(file(), [item, ...all]);
        return item;
      });
    },

    /** Applies `change` to the stored record under the file lock; returns null when missing. */
    async update(id: string, change: (current: T) => Partial<T>): Promise<T | null> {
      return withFileLock(file(), async () => {
        const all = await readAll();
        const item = all.find((entry) => entry.id === id && !entry.deletedAt);
        if (!item) return null;
        Object.assign(item, change(item), { id: item.id, createdAt: item.createdAt, updatedAt: new Date().toISOString() });
        await writeJsonFile(file(), all);
        return item;
      });
    },

    async softDelete(id: string): Promise<boolean> {
      return withFileLock(file(), async () => {
        const all = await readAll();
        const item = all.find((entry) => entry.id === id && !entry.deletedAt);
        if (!item) return false;
        item.deletedAt = new Date().toISOString();
        await writeJsonFile(file(), all);
        return true;
      });
    },
  };
}

export const crmRepositories = {
  clients: createRepository<CrmCollections["clients"]>("clients"),
  proposals: createRepository<CrmCollections["proposals"]>("proposals"),
  payments: createRepository<CrmCollections["payments"]>("payments"),
  events: createRepository<CrmCollections["events"]>("events"),
};
