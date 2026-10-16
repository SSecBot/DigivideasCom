import { randomUUID } from "node:crypto";
import { SavedLead } from "@/lib/leads/types";
import { readJsonFile, resolveDataPath, withFileLock, writeJsonFile } from "@/lib/server/storage/json-store";

const LEADS_FILE = () => resolveDataPath("leads.json");

type LeadInput = Pick<SavedLead, "place" | "audit" | "analysis" | "searchQuery">;
export type LeadPatch = Partial<Pick<SavedLead, "status" | "notes" | "audit" | "analysis">>;

async function readAll(): Promise<SavedLead[]> {
  return readJsonFile<SavedLead[]>(LEADS_FILE(), []);
}

export const leadRepository = {
  async list(): Promise<SavedLead[]> {
    return (await readAll()).filter((lead) => !lead.deletedAt);
  },

  async findById(id: string): Promise<SavedLead | null> {
    return (await this.list()).find((lead) => lead.id === id) ?? null;
  },

  /** Saves a lead; re-saving the same Google place updates it instead of duplicating. */
  async upsert(input: LeadInput): Promise<SavedLead> {
    return withFileLock(LEADS_FILE(), async () => {
      const all = await readAll();
      const now = new Date().toISOString();
      const existing = all.find((lead) => lead.place.placeId === input.place.placeId);
      if (existing) {
        Object.assign(existing, input, { updatedAt: now, deletedAt: undefined });
        await writeJsonFile(LEADS_FILE(), all);
        return existing;
      }
      const lead: SavedLead = {
        ...input,
        id: `lead-${randomUUID()}`,
        status: "yeni",
        notes: "",
        createdAt: now,
        updatedAt: now,
      };
      await writeJsonFile(LEADS_FILE(), [lead, ...all]);
      return lead;
    });
  },

  async update(id: string, patch: LeadPatch): Promise<SavedLead | null> {
    return withFileLock(LEADS_FILE(), async () => {
      const all = await readAll();
      const lead = all.find((item) => item.id === id && !item.deletedAt);
      if (!lead) return null;
      Object.assign(lead, patch, { updatedAt: new Date().toISOString() });
      await writeJsonFile(LEADS_FILE(), all);
      return lead;
    });
  },

  /** Soft delete: kept on disk with a deletedAt timestamp. */
  async softDelete(id: string): Promise<boolean> {
    return withFileLock(LEADS_FILE(), async () => {
      const all = await readAll();
      const lead = all.find((item) => item.id === id && !item.deletedAt);
      if (!lead) return false;
      lead.deletedAt = new Date().toISOString();
      await writeJsonFile(LEADS_FILE(), all);
      return true;
    });
  },
};
