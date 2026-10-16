import { randomUUID } from "node:crypto";
import { ContactInquiry } from "@/lib/types/cms";
import { readJsonFile, resolveDataPath, withFileLock, writeJsonFile } from "@/lib/server/storage/json-store";

const INQUIRIES_FILE = () => resolveDataPath("inquiries.json");
const MAX_STORED = 5_000;

export const inquiryRepository = {
  async list(): Promise<ContactInquiry[]> {
    const all = await readJsonFile<ContactInquiry[]>(INQUIRIES_FILE(), []);
    return all.filter((inquiry) => !inquiry.deletedAt);
  },

  async create(input: Omit<ContactInquiry, "id" | "createdAt">): Promise<ContactInquiry> {
    return withFileLock(INQUIRIES_FILE(), async () => {
      const all = await readJsonFile<ContactInquiry[]>(INQUIRIES_FILE(), []);
      const inquiry: ContactInquiry = {
        ...input,
        id: `inq-${randomUUID()}`,
        createdAt: new Date().toISOString(),
      };
      await writeJsonFile(INQUIRIES_FILE(), [inquiry, ...all].slice(0, MAX_STORED));
      return inquiry;
    });
  },

  /** Adds inquiries saved by the old browser-only version; existing ids are left untouched. */
  async importMany(items: ContactInquiry[]): Promise<number> {
    return withFileLock(INQUIRIES_FILE(), async () => {
      const all = await readJsonFile<ContactInquiry[]>(INQUIRIES_FILE(), []);
      const known = new Set(all.map((inquiry) => inquiry.id));
      const fresh = items.filter((inquiry) => !known.has(inquiry.id));
      if (fresh.length === 0) return 0;
      const merged = [...all, ...fresh].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, MAX_STORED);
      await writeJsonFile(INQUIRIES_FILE(), merged);
      return fresh.length;
    });
  },

  /** Soft delete: the record stays on disk with a deletedAt timestamp. */
  async softDelete(id: string): Promise<boolean> {
    return withFileLock(INQUIRIES_FILE(), async () => {
      const all = await readJsonFile<ContactInquiry[]>(INQUIRIES_FILE(), []);
      const target = all.find((inquiry) => inquiry.id === id && !inquiry.deletedAt);
      if (!target) return false;
      target.deletedAt = new Date().toISOString();
      await writeJsonFile(INQUIRIES_FILE(), all);
      return true;
    });
  },
};
