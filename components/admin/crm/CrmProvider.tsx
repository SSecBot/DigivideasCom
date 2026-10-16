"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CalendarEvent, Client, CrmCollection, CrmCollections, Payment, Proposal } from "@/lib/crm/types";

/**
 * Shared CRM state for the Müşteri Takibi / Teklifler / Ödemeler / Takvim tabs.
 * Mounted inside the admin auth guard, so every request carries a valid session.
 */

async function crmFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `İstek başarısız (${response.status})`);
  return body;
}

export interface DecisionInput {
  decision: "approve" | "reject";
  note?: string;
  createPayment?: boolean;
  paymentDueDate?: string;
  monthlyFee?: number;
  endDate?: string;
}

interface CrmContextValue {
  clients: Client[];
  proposals: Proposal[];
  payments: Payment[];
  events: CalendarEvent[];
  loaded: boolean;
  error: string;
  clearError: () => void;
  reload: () => Promise<void>;
  create: <K extends CrmCollection>(collection: K, data: unknown) => Promise<CrmCollections[K] | null>;
  update: <K extends CrmCollection>(collection: K, id: string, data: unknown) => Promise<boolean>;
  remove: (collection: CrmCollection, id: string) => Promise<boolean>;
  decide: (proposalId: string, input: DecisionInput) => Promise<boolean>;
  uploadProposalFiles: (proposalId: string, files: File[]) => Promise<boolean>;
  removeProposalFile: (proposalId: string, fileId: string) => Promise<boolean>;
}

/** URL of a proposal PDF attachment (served only to logged-in admins). */
export function proposalFileUrl(proposalId: string, fileId: string, download = false): string {
  return `/api/admin/crm/proposal-files/${encodeURIComponent(proposalId)}/${encodeURIComponent(fileId)}${download ? "?download=1" : ""}`;
}

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const [c, p, pay, e] = await Promise.all([
        crmFetch<Client[]>("/api/admin/crm/clients"),
        crmFetch<Proposal[]>("/api/admin/crm/proposals"),
        crmFetch<Payment[]>("/api/admin/crm/payments"),
        crmFetch<CalendarEvent[]>("/api/admin/crm/events"),
      ]);
      setClients(c);
      setProposals(p);
      setPayments(pay);
      setEvents(e);
      setLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Mutations reload everything afterwards: approving a proposal or paying a recurring
  // payment changes several collections at once on the server.
  const run = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T | null> => {
      try {
        const result = await task();
        await reload();
        return result;
      } catch (e) {
        setError((e as Error).message);
        return null;
      }
    },
    [reload]
  );

  const value = useMemo<CrmContextValue>(
    () => ({
      clients,
      proposals,
      payments,
      events,
      loaded,
      error,
      clearError: () => setError(""),
      reload,
      create: (collection, data) =>
        run(() => crmFetch(`/api/admin/crm/${collection}`, { method: "POST", body: JSON.stringify(data) })),
      update: async (collection, id, data) =>
        (await run(() =>
          crmFetch(`/api/admin/crm/${collection}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) })
        )) !== null,
      remove: async (collection, id) =>
        (await run(() => crmFetch(`/api/admin/crm/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" }))) !== null,
      decide: async (proposalId, input) =>
        (await run(() =>
          crmFetch(`/api/admin/crm/proposal-decision/${encodeURIComponent(proposalId)}`, {
            method: "POST",
            body: JSON.stringify(input),
          })
        )) !== null,
      uploadProposalFiles: async (proposalId, files) =>
        (await run(async () => {
          const form = new FormData();
          files.forEach((file) => form.append("files", file));
          const response = await fetch(`/api/admin/crm/proposal-files/${encodeURIComponent(proposalId)}`, { method: "POST", body: form });
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) throw new Error(body.error || "PDF yüklenemedi");
          return body;
        })) !== null,
      removeProposalFile: async (proposalId, fileId) =>
        (await run(() =>
          crmFetch(`/api/admin/crm/proposal-files/${encodeURIComponent(proposalId)}/${encodeURIComponent(fileId)}`, { method: "DELETE" })
        )) !== null,
    }),
    [clients, proposals, payments, events, loaded, error, reload, run]
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): CrmContextValue {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside <CrmProvider>");
  return context;
}
