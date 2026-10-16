import { randomUUID } from "node:crypto";
import { analyzeLead } from "@/lib/leads/scoring";
import { LeadAnalysis, PlaceLead, ScrapeJobStatus, ScrapeJobView, WebsiteAudit } from "@/lib/leads/types";
import { auditWebsite } from "@/lib/server/leads/website-audit";
import { ownWebsite } from "@/lib/leads/social";
import { ScrapeCancelledError, scrapeGoogleMaps } from "@/lib/server/leads/maps-scraper";

/**
 * In-memory background jobs for the browser-based Maps scrape. A scrape takes
 * minutes, so the admin UI starts a job and polls it. Only one job runs at a
 * time (a headless browser is heavy); finished jobs are kept for 30 minutes.
 */

export interface ScrapeJobLead extends PlaceLead {
  analysis: LeadAnalysis;
  audit?: WebsiteAudit;
}

export interface ScrapeJob {
  id: string;
  query: string;
  status: ScrapeJobStatus;
  progress: number;
  message: string;
  leads: ScrapeJobLead[];
  error?: string;
  startedAt: number;
  finishedAt?: number;
  cancelRequested: boolean;
}

const KEEP_FINISHED_MS = 30 * 60 * 1000;
const AUDIT_CONCURRENCY = 4;

// Survives Next.js dev hot reloads
const store = globalThis as unknown as { __dvScrapeJobs?: Map<string, ScrapeJob> };
const jobs = (store.__dvScrapeJobs ??= new Map<string, ScrapeJob>());

function cleanup(now = Date.now()) {
  jobs.forEach((job, id) => {
    if (job.finishedAt && now - job.finishedAt > KEEP_FINISHED_MS) jobs.delete(id);
  });
}

export function getRunningJob(): ScrapeJob | undefined {
  return Array.from(jobs.values()).find((job) => job.status === "running");
}

export function getJob(id: string): ScrapeJob | undefined {
  cleanup();
  return jobs.get(id);
}

export function cancelJob(id: string): boolean {
  const job = jobs.get(id);
  if (!job || job.status !== "running") return false;
  job.cancelRequested = true;
  job.message = "İptal ediliyor…";
  return true;
}

/** Runs website audits with a small concurrency limit while the scrape continues. */
function createAuditQueue(job: ScrapeJob) {
  const queue: ScrapeJobLead[] = [];
  let active = 0;
  let idleResolve: (() => void) | null = null;

  const pump = () => {
    while (active < AUDIT_CONCURRENCY && queue.length > 0) {
      const lead = queue.shift() as ScrapeJobLead;
      active += 1;
      auditWebsite(lead.website as string)
        .then((audit) => {
          lead.audit = audit;
          lead.analysis = analyzeLead(lead, audit);
        })
        .catch(() => undefined) // blocked / unreachable sites keep the place-only analysis
        .finally(() => {
          active -= 1;
          pump();
          if (active === 0 && queue.length === 0 && idleResolve) idleResolve();
        });
    }
  };

  return {
    add(lead: ScrapeJobLead) {
      if (!ownWebsite(lead.website) || job.cancelRequested) return;
      queue.push(lead);
      pump();
    },
    drain(): Promise<void> {
      if (active === 0 && queue.length === 0) return Promise.resolve();
      return new Promise((resolve) => {
        idleResolve = resolve;
      });
    },
  };
}

export function startScrapeJob(query: string, limit: number): ScrapeJob {
  cleanup();
  const job: ScrapeJob = {
    id: randomUUID(),
    query,
    status: "running",
    progress: 0,
    message: "Başlatılıyor…",
    leads: [],
    startedAt: Date.now(),
    cancelRequested: false,
  };
  jobs.set(job.id, job);
  const audits = createAuditQueue(job);

  scrapeGoogleMaps(query, limit, {
    onProgress: (percent, message) => {
      job.progress = percent;
      job.message = message;
    },
    onPlace: (place) => {
      const lead: ScrapeJobLead = { ...place, analysis: analyzeLead(place) };
      job.leads.push(lead);
      audits.add(lead);
    },
    isCancelled: () => job.cancelRequested,
  })
    .then(async (found) => {
      job.progress = 96;
      job.message = "Web siteleri analiz ediliyor…";
      await audits.drain();
      job.status = "done";
      job.progress = 100;
      job.message = `Tamamlandı: ${found} işletme bulundu`;
    })
    .catch(async (error: Error) => {
      await audits.drain();
      if (error instanceof ScrapeCancelledError) {
        job.status = "cancelled";
        job.message = `İptal edildi (${job.leads.length} işletme bulunmuştu)`;
      } else {
        job.status = "error";
        job.error = error.message || "Tarama başarısız oldu";
        job.message = job.error;
      }
    })
    .finally(() => {
      job.finishedAt = Date.now();
    });

  return job;
}

/** Public view of a job (no internal flags). */
export function serializeJob(job: ScrapeJob): ScrapeJobView {
  return {
    id: job.id,
    query: job.query,
    status: job.status,
    progress: job.progress,
    message: job.message,
    error: job.error,
    leads: job.leads,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
  };
}
