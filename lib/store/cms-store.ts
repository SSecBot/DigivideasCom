"use client";

import React, { createContext, useContext } from "react";
import { ContactInquiry, ContentSnapshot } from "@/lib/types/cms";

/**
 * Public CMS content. The root layout loads the published snapshot on the server
 * and hands it to <ContentProvider>, so every visitor sees the same content
 * and it is present in the server-rendered HTML (SEO).
 */

const ContentContext = createContext<ContentSnapshot | null>(null);

export function ContentProvider({
  content,
  children,
}: {
  content: ContentSnapshot;
  children: React.ReactNode;
}) {
  return React.createElement(ContentContext.Provider, { value: content }, children);
}

export type InquiryPayload = Omit<ContactInquiry, "id" | "createdAt" | "deletedAt"> & {
  website?: string; // honeypot
};

export async function submitInquiry(inquiry: InquiryPayload): Promise<void> {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Talebiniz gönderilemedi. Lütfen tekrar deneyin.");
  }
}

export function useCMSStore() {
  const content = useContext(ContentContext);
  if (!content) {
    throw new Error("useCMSStore must be used inside <ContentProvider>");
  }
  return { ...content, isLoaded: true, submitInquiry };
}
